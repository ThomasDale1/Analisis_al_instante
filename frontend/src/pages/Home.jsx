import FileUploader from "../components/FileUploader";
import Loader from "../components/Loader";
import SuggestionCard from "../components/SuggestionCard";
import Dashboard from "../components/Dashboard";
import { useState } from "react";
import { Typography, Box, Alert, Container } from "@mui/material";
import { BarChart as BarChartIcon } from "@mui/icons-material";

/**
 * Página principal: orquestación de carga, IA y dashboard.
 */
const Home = () => {
  // Estados globales de la página:
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [dashboardCharts, setDashboardCharts] = useState([]);
  const [error, setError] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [filename, setFilename] = useState(null);

  return (
    <Box 
      sx={{ 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a1929 0%, #1a2332 50%, #0f1419 100%)",
        pb: 6
      }}
    >
      <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 2, 
            mb: { xs: 3, md: 5 },
            flexWrap: "wrap"
          }}
        >
          <BarChartIcon sx={{ fontSize: { xs: 40, md: 50 }, color: "primary.main" }} />
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              background: "linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-1px"
            }}
          >
            Análisis al Instante
          </Typography>
        </Box>

        {/* File Uploader */}
        <FileUploader 
          setLoading={setLoading} 
          setSuggestions={setSuggestions}
          setError={setError}
          setFileId={setFileId}
          setFilename={setFilename}
        />

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 3, 
              mb: 2,
              borderRadius: 2,
              backgroundColor: "rgba(211, 47, 47, 0.1)",
              border: "1px solid rgba(211, 47, 47, 0.3)"
            }}
          >
            {error}
          </Alert>
        )}

        {/* Loader */}
        {loading && <Loader />}

        {/* Sugerencias de Visualización */}
        {!loading && suggestions.length > 0 && (
          <Box sx={{ mt: { xs: 4, md: 6 } }}>
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
                💡 Sugerencias de Visualización
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
              {suggestions.map((sugg, idx) => (
                <SuggestionCard
                  key={idx}
                  suggestion={sugg}
                  fileId={fileId}
                  filename={filename}
                  onAdd={() => setDashboardCharts([...dashboardCharts, { ...sugg, fileId, filename }])}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Dashboard */}
        <Dashboard charts={dashboardCharts} />
      </Container>
    </Box>
  );
};

export default Home;
