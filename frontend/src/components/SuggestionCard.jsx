import ChartPreview from "./ChartPreview";
import { Paper, Typography, Button, Box, Chip } from "@mui/material";
import { BarChart as BarChartIcon, ShowChart, PieChart, ScatterPlot } from "@mui/icons-material";

/**
 * Tarjeta con recomendación IA que muestra la gráfica renderizada.
 * Props:
 * - suggestion: objeto con title, insight, parameters, chart_type
 * - fileId: ID único del archivo subido
 * - onAdd: función callback para añadir el gráfico al dashboard
 */
const SuggestionCard = ({ suggestion, fileId, onAdd }) => {
  const { title, insight, chart_type, parameters } = suggestion;

  // Icono según el tipo de gráfica
  const getChartIcon = () => {
    switch (chart_type?.toLowerCase()) {
      case "bar":
      case "column":
      case "histogram":
        return <BarChartIcon fontSize="small" />;
      case "line":
      case "area":
        return <ShowChart fontSize="small" />;
      case "pie":
      case "donut":
        return <PieChart fontSize="small" />;
      case "scatter":
        return <ScatterPlot fontSize="small" />;
      default:
        return <BarChartIcon fontSize="small" />;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        width: { xs: "100%", sm: "380px" },
        maxWidth: "480px",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        transition: "all 0.3s ease",
        background: "rgba(26, 35, 50, 0.8)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 3,
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 32px rgba(33, 150, 243, 0.2)",
          border: "1px solid rgba(33, 150, 243, 0.3)"
        }
      }}
    >
      {/* Título y tipo de gráfica */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, lineHeight: 1.3 }}>
          {title}
        </Typography>
        <Chip
          icon={getChartIcon()}
          label={chart_type}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ textTransform: "capitalize" }}
        />
      </Box>

      {/* Insight */}
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{
          fontStyle: "italic",
          lineHeight: 1.5,
          minHeight: "40px"
        }}
      >
        {insight}
      </Typography>

      {/* Gráfica renderizada */}
      <Box
        sx={{
          mt: 1,
          mb: 1,
          p: 1.5,
          backgroundColor: "#fafafa",
          borderRadius: 2,
          border: "1px solid #e0e0e0"
        }}
      >
        <ChartPreview
          chartType={chart_type}
          parameters={parameters}
          fileId={fileId}
        />
      </Box>

      {/* Botón para agregar al dashboard */}
      <Button
        variant="contained"
        color="primary"
        onClick={onAdd}
        sx={{
          mt: "auto",
          py: 1,
          fontWeight: "bold",
          textTransform: "none",
          fontSize: "0.95rem"
        }}
      >
        Agregar al Dashboard
      </Button>
    </Paper>
  );
};

export default SuggestionCard;
