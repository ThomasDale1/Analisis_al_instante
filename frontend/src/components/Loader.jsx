/**
 * Loader con mensaje para mostrar mientras analiza la IA.
 */
import { Box, CircularProgress, Typography } from "@mui/material";

const Loader = () => (
  <Box 
    sx={{ 
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      my: 6,
      p: 4
    }}
  >
    <CircularProgress size={60} thickness={4} />
    <Typography 
      variant="h6" 
      sx={{ 
        fontWeight: 600,
        color: "primary.main",
        textAlign: "center"
      }}
    >
      🧠 Analizando tus datos con IA...
    </Typography>
    <Typography 
      variant="body2" 
      sx={{ 
        color: "text.secondary",
        textAlign: "center"
      }}
    >
      Por favor espera mientras generamos las visualizaciones
    </Typography>
  </Box>
);

export default Loader;
