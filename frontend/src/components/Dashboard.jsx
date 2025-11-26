import ChartRenderer from "./ChartRenderer";
import { Box, Typography } from "@mui/material";

/**
 * Dashboard donde se renderizan las gráficas seleccionadas.
 */
const Dashboard = ({ charts, onDeleteChart }) => {
  if (!charts || charts.length === 0) {
    return null;
  }

  const handleDelete = (indexToDelete) => {
    // Llamar a la función proporcionada por el componente padre
    if (onDeleteChart) {
      onDeleteChart(indexToDelete);
    }
  };

  return (
    <Box sx={{ mt: { xs: 5, md: 7 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Box 
          sx={{ 
            width: 4, 
            height: 32, 
            bgcolor: "primary.main",
            borderRadius: 1
          }} 
        />
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: "1.25rem", md: "1.5rem" }
          }}
        >
          📊 Mi Dashboard
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: "text.secondary",
            ml: 1
          }}
        >
          ({charts.length} {charts.length === 1 ? "gráfica" : "gráficas"})
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: { xs: 2, md: 3 }
        }}
      >
        {charts.map((chart, idx) => (
          <Box 
            key={idx}
            sx={{
              width: { xs: "100%", sm: "calc(50% - 12px)", lg: "calc(33.333% - 16px)" },
              minWidth: { sm: "450px" },
              maxWidth: "600px"
            }}
          >
            <ChartRenderer 
              chart={chart} 
              chartIndex={idx}
              onDelete={handleDelete}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Dashboard;