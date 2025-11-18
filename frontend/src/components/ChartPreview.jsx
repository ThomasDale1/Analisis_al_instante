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
const ChartPreview = ({ chartType, parameters, filename }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getChartData(filename, parameters);
        setChartData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (filename && parameters) {
      fetchData();
    }
  }, [filename, parameters]);

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
  if (!data[0]?.hasOwnProperty(yKey)) {
    yKey = columns.find(col => col !== xKey && data[0]?.hasOwnProperty(col)) || columns[1] || 'count';
  }

  // Limitar datos para mejor visualización
  const displayData = data.slice(0, 15);
  
  // Paleta de colores moderna
  const colors = [
    '#1976d2', '#42a5f5', '#0288d1', '#03a9f4', 
    '#00bcd4', '#26c6da', '#00acc1', '#0097a7',
    '#00838f', '#006064', '#4dd0e1', '#18ffff'
  ];

  // Configuración común de tooltip
  const tooltipStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '8px'
  };

  // Renderizar según el tipo de gráfica
  switch (chartType.toLowerCase()) {
    case "bar":
    case "column":
      return (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xKey} 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey={yKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );

    case "line":
      return (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xKey}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke={colors[0]} 
              strokeWidth={3}
              dot={{ fill: colors[0], r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );

    case "pie":
    case "donut":
      return (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={displayData}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#999', strokeWidth: 1 }}
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      );

    case "scatter":
      return (
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xKey} 
              type="number"
              tick={{ fontSize: 11 }}
              name={xKey}
            />
            <YAxis 
              dataKey={yKey}
              type="number"
              tick={{ fontSize: 11 }}
              name={yKey}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Scatter name={`${xKey} vs ${yKey}`} data={displayData} fill={colors[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );

    case "area":
      return (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xKey}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area 
              type="monotone" 
              dataKey={yKey} 
              stroke={colors[0]} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      );

    case "histogram":
      return (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xKey}
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey={yKey} fill={colors[2]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
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

