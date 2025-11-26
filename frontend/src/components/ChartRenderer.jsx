import ChartPreview from "./ChartPreview";
import { Paper, Typography, Box } from "@mui/material";

/**
 * Renderiza una gráfica individual dentro del dashboard.
 */
const ChartRenderer = ({ chart }) => {
  const { title, chart_type, parameters, fileId, insight, description } = chart;

  const displayDescription = description || insight;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 400,
        background: "rgba(26, 35, 50, 0.8)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 3,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(33, 150, 243, 0.15)",
          border: "1px solid rgba(33, 150, 243, 0.2)"
        }
      }}
    >
      <Typography 
        variant="h6" 
        fontWeight="bold" 
        sx={{ 
          mb: 2,
          color: "text.primary"
        }}
      >
        {title}
      </Typography>

      {displayDescription && (
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: "text.secondary",
            textAlign: "center"
          }}
        >
          {displayDescription}
        </Typography>
      )}

      <Box sx={{ flex: 1, minHeight: 300 }}>
        <ChartPreview
          chartType={chart_type}
          parameters={parameters}
          fileId={fileId}
        />
      </Box>
    </Paper>
  );
};

export default ChartRenderer;
