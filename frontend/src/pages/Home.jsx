import FileUploader from "../components/FileUploader";
import Loader from "../components/Loader";
import SuggestionCard from "../components/SuggestionCard";
import Dashboard from "../components/Dashboard";
import { useState } from "react";
import { Typography, Box } from "@mui/material";

/**
 * Página principal: orquestación de carga, IA y dashboard.
 */
const Home = () => {
  // Estados globales de la página:
  const [loading, setLoading] = useState(false); // ¿Está analizando la IA?
  const [suggestions, setSuggestions] = useState([]); // Sugerencias IA
  const [dashboardCharts, setDashboardCharts] = useState([]); // Gráficas añadidas

  return (
    <div>
      <h1>Análisis al Instante</h1>
      <FileUploader 
        setLoading={setLoading} 
        setSuggestions={setSuggestions} />
      {loading && <Loader />}
      {/* Renderizar las tarjetas de sugerencias IA */}
      {!loading && suggestions.length > 0 && (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {suggestions.map((sugg, idx) => (
            <SuggestionCard
              key={idx}
              suggestion={sugg}
              onAdd={() => setDashboardCharts([...dashboardCharts, sugg])}
            />
          ))}
        </div>
      )}

      {/* Dashboard con las gráficas seleccionadas */}
      <Dashboard charts={dashboardCharts} />
    </div>
  );
};

export default Home;
