import { useEffect, useState } from "react";
import { getChartData } from "../services/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";

/**
 * Componente que renderiza una gráfica según el tipo usando Recharts.
 */
const ChartPreview = ({ chartType, parameters, fileId }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getChartData(fileId, parameters);
        setChartData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (fileId && parameters) {
      fetchData();
    }
  }, [fileId, parameters]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={250}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ fontSize: "0.75rem" }}>
        {error}
      </Alert>
    );
  }

  if (!chartData || !chartData.data || chartData.data.length === 0) {
    return (
      <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
        No hay datos disponibles para esta visualización
      </Alert>
    );
  }

  const { data, columns } = chartData;
  
  // Determinar claves para ejes
  let xKey = parameters.x_axis || columns[0];
  let yKey = parameters.y_axis || columns.find(col => col !== xKey) || 'count';
  
  // Si yKey no existe en los datos, buscar alternativas
  if (!Object.prototype.hasOwnProperty.call(data[0] || {}, yKey)) {
    yKey = columns.find(col => col !== xKey && Object.prototype.hasOwnProperty.call(data[0] || {}, col)) || columns[1] || 'count';
  }

  // Limitar datos para mejor visualización
  const displayData = data.slice(0, 15);
  
  // Paleta de colores vibrante con azules, morados y rosados
  const colors = [
    '#2196f3', // Azul brillante
    '#9c27b0', // Morado
    '#e91e63', // Rosa/Magenta
    '#7c4dff', // Morado claro
    '#ff4081', // Rosa fuerte
    '#00bcd4', // Cyan
    '#ba68c8', // Morado pastel
    '#f06292', // Rosa claro
    '#42a5f5', // Azul claro
    '#ab47bc', // Morado medio
    '#ec407a', // Rosa medio
    '#64b5f6'  // Azul pastel
  ];

  // Detectar si una columna es monetaria
  const isCurrencyColumn = (columnName) => {
    const lowerName = columnName.toLowerCase();
    return lowerName.includes('precio') || 
           lowerName.includes('price') || 
           lowerName.includes('salario') || 
           lowerName.includes('salary') || 
           lowerName.includes('pago') || 
           lowerName.includes('payment') || 
           lowerName.includes('venta') || 
           lowerName.includes('sale') || 
           lowerName.includes('ingreso') || 
           lowerName.includes('income') || 
           lowerName.includes('costo') || 
           lowerName.includes('cost') || 
           lowerName.includes('valor') || 
           lowerName.includes('value') ||
           lowerName.includes('monto') ||
           lowerName.includes('amount');
  };

  // Formateador de valores
  const formatValue = (value, columnName) => {
    if (typeof value === 'number' && isCurrencyColumn(columnName)) {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return value;
  };

  // Tooltip personalizado con formato de moneda
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(26, 35, 50, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '12px',
          color: '#ffffff',
          backdropFilter: 'blur(10px)'
        }}>
          {label && <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#64b5f6' }}>{label}</div>}
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }}></div>
              <strong>{entry.name}:</strong> {formatValue(entry.value, entry.name)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };


  // Renderizar según el tipo de gráfica
  switch (chartType.toLowerCase()) {
    case "bar":
    case "column":
      return (
        <Box sx={{ bgcolor: 'rgb(25, 24, 44)', borderRadius: 2, p: 1 }}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis 
                dataKey={xKey}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11, fill: '#e0e0e0' }}
                stroke="rgba(255, 255, 255, 0.3)"
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#e0e0e0' }}
                tickFormatter={(value) => isCurrencyColumn(yKey) ? `$${value.toLocaleString()}` : value}
                stroke="rgba(255, 255, 255, 0.3)"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey={yKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      );

    case "line":
      return (
        <Box sx={{ bgcolor: 'rgb(25, 24, 44)', borderRadius: 2, p: 1 }}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis 
                dataKey={xKey}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11, fill: '#e0e0e0' }}
                stroke="rgba(255, 255, 255, 0.3)"
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#e0e0e0' }}
                tickFormatter={(value) => isCurrencyColumn(yKey) ? `$${value.toLocaleString()}` : value}
                stroke="rgba(255, 255, 255, 0.3)"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke={colors[1]} 
                strokeWidth={3}
                dot={{ fill: colors[1], r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      );

    case "pie":
    case "donut": {
      // Función personalizada para renderizar las etiquetas con mejor visibilidad
      const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 25;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
          <text 
            x={x} 
            y={y} 
            fill="#ffffff"
            textAnchor={x > cx ? 'start' : 'end'} 
            dominantBaseline="central"
            style={{ 
              fontSize: '13px', 
              fontWeight: '600',
              textShadow: '0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'
            }}
          >
            {`${name}: ${(percent * 100).toFixed(0)}%`}
          </text>
        );
      };

      return (
        <Box sx={{ bgcolor: 'rgb(25, 24, 44)', borderRadius: 2, p: 1 }}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={displayData}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={85}
                label={renderCustomLabel}
                labelLine={{ 
                  stroke: 'rgba(255, 255, 255, 0.8)', 
                  strokeWidth: 2 
                }}
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{
                backgroundColor: 'rgba(212, 216, 223, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '10px',
                color: '#ffffff'
              }} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      );
    }

    case "scatter": {
      // Tooltip personalizado para scatter que muestra todos los datos del punto
      const CustomScatterTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          return (
            <div style={{
              backgroundColor: 'rgba(26, 35, 50, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: '#ffffff',
              backdropFilter: 'blur(10px)',
              maxWidth: '250px'
            }}>
              {Object.entries(data).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <strong style={{ color: '#64b5f6' }}>{key}:</strong>
                  <span>{formatValue(value, key)}</span>
                </div>
              ))}
            </div>
          );
        }
        return null;
      };

      return (
        <Box sx={{ bgcolor: 'rgb(25, 24, 44)', borderRadius: 2, p: 1 }}>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis 
                dataKey={xKey} 
                type="number"
                tick={{ fontSize: 11, fill: '#e0e0e0' }}
                name={xKey}
                label={{ value: xKey, position: 'insideBottom', offset: -5, fontSize: 10, fill: '#e0e0e0' }}
                tickFormatter={(value) => isCurrencyColumn(xKey) ? `$${value.toLocaleString()}` : value}
                stroke="rgba(255, 255, 255, 0.3)"
              />
              <YAxis 
                dataKey={yKey}
                type="number"
                tick={{ fontSize: 11, fill: '#e0e0e0' }}
                name={yKey}
                label={{ value: yKey, angle: -90, position: 'insideLeft', fontSize: 10, fill: '#e0e0e0' }}
                tickFormatter={(value) => isCurrencyColumn(yKey) ? `$${value.toLocaleString()}` : value}
                stroke="rgba(255, 255, 255, 0.3)"
              />
              <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Scatter name={`${xKey} vs ${yKey}`} data={displayData} fill={colors[2]} />
            </ScatterChart>
          </ResponsiveContainer>
        </Box>
      );
    }

    case "area":
      return (
        <Box sx={{ bgcolor: 'rgb(25, 24, 44)', borderRadius: 2, p: 1 }}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[3]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[3]} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis 
                dataKey={xKey}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11, fill: '#e0e0e0' }}
                stroke="rgba(255, 255, 255, 0.3)"
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#e0e0e0' }}
                stroke="rgba(255, 255, 255, 0.3)"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area 
                type="monotone" 
                dataKey={yKey} 
                stroke={colors[3]} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      );

    case "histogram":
      return (
        <Box sx={{ bgcolor: 'rgb(25, 24, 44)', borderRadius: 2, p: 1 }}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis 
                dataKey={xKey}
                tick={{ fontSize: 11, fill: '#e0e0e0' }}
                tickFormatter={(value) => isCurrencyColumn(xKey) ? `$${value.toLocaleString()}` : value}
                stroke="rgba(255, 255, 255, 0.3)"
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#e0e0e0' }}
                stroke="rgba(255, 255, 255, 0.3)"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey={yKey} fill={colors[4]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      );

    default:
      return (
        <Alert severity="warning" sx={{ fontSize: "0.75rem" }}>
          Tipo de gráfica no soportado: {chartType}
        </Alert>
      );
  }
};

export default ChartPreview;

