/**
 * Tarjeta con recomendación IA.
 * Props:
 * - suggestion: objeto con title, insight, parameters, chart_type
 * - onAdd: función callback para añadir el gráfico al dashboard
 */
const SuggestionCard = ({ suggestion, onAdd }) => {
  const { title, insight, chart_type } = suggestion;

  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: 8,
      padding: "1rem",
      minWidth: 250,
      background: "#fafafe"
    }}>
      <h3>{title}</h3>
      <p><em>{insight}</em></p>
      <p><strong>Tipo:</strong> {chart_type}</p>
      <button onClick={onAdd}>Agregar al Dashboard</button>
    </div>
  );
};

export default SuggestionCard;
