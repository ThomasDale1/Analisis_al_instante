import Home from "./pages/Home";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

// Tema personalizado con Material UI
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    background: { default: "#f4f8fb" }
  },
  typography: {
    fontFamily: "'Segoe UI', Arial, sans-serif"
  }
});

function App() {
  // Componente principal, aplica el tema y el fondo global
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ minHeight: "100vh", background: "#f4f8fb" }}>
        <Home />
      </div>
    </ThemeProvider>
  );
}

export default App;
