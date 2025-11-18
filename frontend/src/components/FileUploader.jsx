import { useRef, useState } from "react";
import { uploadFileAndGetSuggestions } from "../services/api";
import { Box, Button, Typography, Paper } from "@mui/material";

/**
 * Componente para subir archivos con drag-and-drop y Material UI.
 */
const FileUploader = ({ setLoading, setSuggestions, setError, setFileId, setFilename }) => {
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");

  // Cuando cambia el input invisible
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setSuggestions([]);
    setError(null);

    try {
      const result = await uploadFileAndGetSuggestions(file);
      setSuggestions(result.suggestions);
      setFileId(result.fileId);
      setFilename(result.filename);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.message || "Error desconocido al procesar el archivo");
    }
  };

  // Drag events:
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setLoading(true);
      setSuggestions([]);
      setError(null);

      try {
        const result = await uploadFileAndGetSuggestions(file);
        setSuggestions(result.suggestions);
        setFileId(result.fileId);
        setFilename(result.filename);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(error.message || "Error desconocido al procesar el archivo");
      }
    }
  };

  return (
    <Box sx={{ my: { xs: 3, md: 4 } }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <Paper
        elevation={0}
        onClick={() => fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: { xs: 3, md: 4 },
          textAlign: "center",
          border: dragActive 
            ? "2px solid #2196f3" 
            : "2px dashed rgba(255, 255, 255, 0.2)",
          background: dragActive 
            ? "rgba(33, 150, 243, 0.1)" 
            : "rgba(26, 35, 50, 0.6)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          borderRadius: 3,
          backdropFilter: "blur(10px)",
          "&:hover": {
            borderColor: "primary.main",
            background: "rgba(33, 150, 243, 0.05)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(33, 150, 243, 0.2)"
          }
        }}
      >
        <Typography 
          variant="h6" 
          color="primary" 
          sx={{ 
            mb: 1.5,
            fontSize: { xs: "1.1rem", md: "1.25rem" },
            fontWeight: 600
          }}
        >
          Sube tu archivo de datos
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 2,
            color: "text.secondary",
            fontSize: { xs: "0.9rem", md: "1rem" }
          }}
        >
          Arrastra y suelta aquí tu hoja de cálculo (.xlsx o .csv),
          <br />
          o haz clic para buscar el archivo en tu equipo.
        </Typography>
        {fileName && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 1.5, 
              bgcolor: "rgba(33, 150, 243, 0.1)",
              borderRadius: 2,
              border: "1px solid rgba(33, 150, 243, 0.3)"
            }}
          >
            <Typography variant="body2" color="primary">
              Archivo seleccionado: <strong>{fileName}</strong>
            </Typography>
          </Box>
        )}
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ 
            mt: 3,
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(33, 150, 243, 0.4)"
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current.click();
          }}
        >
          SELECCIONAR ARCHIVO
        </Button>
      </Paper>
    </Box>
  );
};

export default FileUploader;