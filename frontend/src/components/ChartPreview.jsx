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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar,
  ComposedChart,
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
const ChartPreview = ({ chartType, parameters, fileId, description }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Pasar el chart_type en los parámetros para casos especiales (box plots)
        const paramsWithType = {
          ...parameters,
          chart_type: chartType
        };
        const data = await getChartData(fileId, paramsWithType);
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
  }, [fileId, parameters, chartType]);

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


  const renderDescription = () => (
    description && (
      <Typography
        variant="body2"
        sx={{
          color: "#e0e0e0",
          textAlign: "center",
          marginBottom: 2,
        }}
      >
        {description}
      </Typography>
    )
  );

  // Renderizar según el tipo de gráfica
  switch (chartType.toLowerCase()) {
    case "bar":
    case "column":
      return (
        <Box sx={{ bgcolor: 'rgb(25, 24, 44)', borderRadius: 2, p: 1 }}>
          {renderDescription()}
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
          {renderDescription()}
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

      // Usar innerRadius solo si es tipo donut
      const isDonut = chartType?.toLowerCase() === "donut";

      return (
        <Box sx={{ bgcolor: 'rgb(25, 24, 44)', borderRadius: 2, p: 1, position: 'relative' }}>
          {renderDescription()}
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={displayData}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                innerRadius={isDonut ? 60 : 0}
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
                backgroundColor: 'rgba(235, 239, 247, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '10px',
                color: '#ffffff'
              }} />
              
              {/* Texto central para donut */}
              {isDonut && (
                <text 
                  x="50%" 
                  y="50%" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    fill: '#ffffff',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  {displayData.length}
                </text>
              )}
              {isDonut && (
                <text 
                  x="50%" 
                  y="50%" 
                  dy="20"
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    fill: '#ffffff',
                    opacity: 0.8
                  }}
                >
                  categorías
                </text>
              )}
            </PieChart>
          </ResponsiveContainer>
        </Box>
      );
    }

    case "scatter": {
      // Tooltip personalizado para scatter que muestra solo los campos más relevantes
      const CustomScatterTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          
          // Filtrar solo los campos más importantes: X, Y y máximo 2 campos adicionales
          const priorityFields = [xKey, yKey];
          const otherFields = Object.keys(data).filter(key => 
            !priorityFields.includes(key) && 
            typeof data[key] !== 'object' &&
            !key.toLowerCase().includes('id') &&
            !key.toLowerCase().includes('timestamp') &&
            !key.toLowerCase().includes('date')
          ).slice(0, 2); // Máximo 2 campos adicionales
          
          const fieldsToShow = [...priorityFields, ...otherFields];
          
          return (
            <div style={{
              backgroundColor: 'rgba(26, 35, 50, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: '#ffffff',
              backdropFilter: 'blur(10px)',
              maxWidth: '220px'
            }}>
              {fieldsToShow.map((key) => (
                <div key={key} style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <strong style={{ color: '#64b5f6' }}>{key}:</strong>
                  <span style={{ textAlign: 'right' }}>{formatValue(data[key], key)}</span>
                </div>
              ))}
            </div>
          );
        }
        return null;
      };

      return (
        <Box sx={{ bgcolor: 'rgb(25, 24, 44)', borderRadius: 2, p: 1 }}>
          {renderDescription()}
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
          {renderDescription()}
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
          {renderDescription()}
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

    // Box plots deshabilitados - se procesan como bar charts en el backend

    case "radar": {
      return (
        <Box sx={{ bgcolor: 'rgb(25, 24, 44)', borderRadius: 2, p: 1 }}>
          {renderDescription()}
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={displayData}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
              <PolarAngleAxis 
                dataKey={xKey} 
                tick={{ fontSize: 10, fill: '#e0e0e0' }}
              />
              <PolarRadiusAxis 
                tick={{ fontSize: 10, fill: '#e0e0e0' }}
              />
              <Radar 
                name={yKey} 
                dataKey={yKey} 
                stroke={colors[6]} 
                fill={colors[6]} 
                fillOpacity={0.6} 
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(26, 35, 50, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
      );
    }

    case "radialbar":
    case "radial": {
      return (
        <Box sx={{ bgcolor: 'rgb(25, 24, 44)', borderRadius: 2, p: 1 }}>
          {renderDescription()}
          <ResponsiveContainer width="100%" height={280}>
            <RadialBarChart 
              innerRadius="10%" 
              outerRadius="90%" 
              data={displayData} 
              startAngle={180} 
              endAngle={0}
            >
              <RadialBar 
                minAngle={15} 
                background 
                clockWise={true} 
                dataKey={yKey}
                label={{ fill: '#ffffff', position: 'insideStart' }}
              />
              <Legend 
                iconSize={10} 
                wrapperStyle={{ fontSize: '12px' }}
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(26, 35, 50, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </Box>
      );
    }

    case "composed":
    case "combo":
    case "mixed": {
      // Gráfico combinado con barras y línea
      return (
        <Box sx={{ bgcolor: 'rgb(25, 24, 44)', borderRadius: 2, p: 1 }}>
          {renderDescription()}
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
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
              <Bar dataKey={yKey} fill={colors[7]} radius={[4, 4, 0, 0]} />
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke={colors[8]} 
                strokeWidth={2}
                dot={{ fill: colors[8], r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      );
    }

    default:
      return (
        <Box sx={{ bgcolor: 'rgb(25, 24, 44)', borderRadius: 2, p: 1 }}>
          {renderDescription()}
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
              <Bar dataKey={yKey} fill={colors[9]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              color: 'warning.main',
              mt: 1,
              fontSize: '0.7rem'
            }}
          >
            ⚠️ Tipo "{chartType}" no reconocido, mostrando como gráfico de barras
          </Typography>
        </Box>
      );
  }
};

export default ChartPreview;

