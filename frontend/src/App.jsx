import Home from "./pages/Home";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

// Tema oscuro y moderno
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { 
      main: "#2196f3",
      light: "#64b5f6",
      dark: "#1976d2"
    },
    secondary: {
      main: "#7c4dff",
      light: "#b47cff",
      dark: "#5e35b1"
    },
    background: { 
      default: "#0a1929",
      paper: "rgba(26, 35, 50, 0.8)"
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0bec5"
    }
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.3px'
    },
    h6: {
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(26, 35, 50, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 24px'
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Home />
    </ThemeProvider>
  );
}

export default App;
