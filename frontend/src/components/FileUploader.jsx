import { useRef, useState } from "react";
import { uploadFileAndGetSuggestions } from "../services/api";
import { Box, Button, Typography, Paper, Alert } from "@mui/material";

/**
 * Componente para subir archivos con drag-and-drop y Material UI.
 */
const FileUploader = ({ setLoading, setSuggestions, setError }) => {
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
    setError(null); // Limpiar errores previos

    try {
      const suggs = await uploadFileAndGetSuggestions(file);
      setSuggestions(suggs);
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
      setError(null); // Limpiar errores previos

      try {
        const suggs = await uploadFileAndGetSuggestions(file);
        setSuggestions(suggs);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(error.message || "Error desconocido al procesar el archivo");
      }
    }
  };

  return (
    <Box sx={{ margin: "2rem 0" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <Paper
        elevation={dragActive ? 6 : 2}
        onClick={() => fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 3,
          textAlign: "center",
          border: dragActive ? "2px solid #1976d2" : "2px dashed #aaa",
          background: dragActive ? "#e3f2fd" : "#f6f8fa",
          cursor: "pointer",
          transition: "all 0.2s"
        }}
      >
        <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
          Sube tu archivo de datos
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Arrastra y suelta aquí tu hoja de cálculo (.xlsx o .csv),<br />
          o haz clic para buscar el archivo en tu equipo.
        </Typography>
        {fileName && (
          <Typography variant="subtitle2" color="textSecondary">
            Archivo seleccionado: <strong>{fileName}</strong>
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current.click();
          }}
        >
          Seleccionar archivo
        </Button>
      </Paper>
    </Box>
  );
};

export default FileUploader;