/**
 * Recibe una sugerencia (chart) y datos, renderiza la gráfica adecuada.
 * Por ahora solo muestra el tipo y parámetros.
 */
const ChartRenderer = ({ chart }) => {
  const { title, chart_type, parameters } = chart;

  // Futuro: fetch a /chart-data del backend y render con Recharts
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: "1rem" }}>
      <h4>{title}</h4>
      <p><strong>Tipo:</strong> {chart_type}</p>
      <pre style={{ fontSize: "0.8rem" }}>{JSON.stringify(parameters, null, 2)}</pre>
      {/* Aquí irá la gráfica */}
      <p><em>Próximamente: renderizado de gráfica 🔥</em></p>
    </div>
  );
};

export default ChartRenderer;
