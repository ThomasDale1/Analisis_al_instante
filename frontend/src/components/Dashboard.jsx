import ChartRenderer from "./ChartRenderer";

/**
 * Renderiza el dashboard: una cuadrícula de gráficos seleccionados.
 * Props:
 * - charts: array de sugerencias seleccionadas
 */
const Dashboard = ({ charts }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
    marginTop: "2rem"
  }}>
    {charts.map((chart, idx) => (
      <ChartRenderer key={idx} chart={chart} />
    ))}
  </div>
);

export default Dashboard;
