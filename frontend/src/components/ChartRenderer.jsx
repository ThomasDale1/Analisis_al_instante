import ChartPreview from "./ChartPreview";
import { Paper, Typography, Box, IconButton, Tooltip } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

/**
 * Renderiza una gráfica individual dentro del dashboard.
 */
const ChartRenderer = ({ chart, onDelete, chartIndex }) => {
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
        position: "relative",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(33, 150, 243, 0.15)",
          border: "1px solid rgba(33, 150, 243, 0.2)",
          "& .delete-button": {
            opacity: 1
          }
        }
      }}
    >
      {/* Botón de eliminar (aparece al hacer hover) */}
      <Tooltip title="Eliminar del dashboard" arrow>
        <IconButton
          className="delete-button"
          onClick={() => onDelete(chartIndex)}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            opacity: 0,
            transition: "all 0.2s ease",
            backgroundColor: "rgba(244, 67, 54, 0.1)",
            color: "error.main",
            "&:hover": {
              backgroundColor: "error.main",
              color: "white",
              transform: "scale(1.1)"
            }
          }}
          size="small"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Typography 
        variant="h6" 
        fontWeight="bold" 
        sx={{ 
          mb: 2,
          color: "text.primary",
          pr: 5 // Espacio para el botón de eliminar
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