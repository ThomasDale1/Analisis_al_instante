import FileUploader from "../components/FileUploader";
import Loader from "../components/Loader";
import SuggestionCard from "../components/SuggestionCard";
import Dashboard from "../components/Dashboard";
import { useState } from "react";
import { Typography, Box, Alert } from "@mui/material";

/**
 * Página principal: orquestación de carga, IA y dashboard.
 */
const Home = () => {
  // Estados globales de la página:
  const [loading, setLoading] = useState(false); // ¿Está analizando la IA?
  const [suggestions, setSuggestions] = useState([]); // Sugerencias IA
  const [dashboardCharts, setDashboardCharts] = useState([]); // Gráficas añadidas
  const [error, setError] = useState(null); // Errores
  const [filename, setFilename] = useState(null); // Nombre del archivo subido

  return (
    <Box sx={{ maxWidth: "1400px", mx: "auto", py: 4 }}>
      <Typography variant="h3" component="h1" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
        📊 Análisis al Instante
      </Typography>

      <FileUploader 
        setLoading={setLoading} 
        setSuggestions={setSuggestions}
        setError={setError}
        setFilename={setFilename}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <Loader />}

      {/* Renderizar las tarjetas de sugerencias IA */}
      {!loading && suggestions.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            💡 Sugerencias de Visualización
          </Typography>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {suggestions.map((sugg, idx) => (
              <SuggestionCard
                key={idx}
                suggestion={sugg}
                filename={filename}
                onAdd={() => setDashboardCharts([...dashboardCharts, sugg])}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Dashboard con las gráficas seleccionadas */}
      <Dashboard charts={dashboardCharts} filename={filename} />
    </Box>
  );
};

export default Home;
