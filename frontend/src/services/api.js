import axios from 'axios';

const API_BASE = 'http://localhost:8000'; // Ajusta si el backend está en otro puerto

/**
 * Sube un archivo, obtiene sugerencias IA del backend.
 * Llama primero a /upload, luego a /suggest.
 */
export async function uploadFileAndGetSuggestions(file) {
  try {
    // 1. Sube el archivo y obtiene el resumen
    const formData = new FormData();
    formData.append('file', file);

    const uploadResp = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // 2. Envía el resumen a /suggest
    const summary = uploadResp.data;
    const suggestResp = await axios.post(`${API_BASE}/suggest`, summary);

    return suggestResp.data; // array de sugerencias
  } catch (error) {
    // Extraer mensaje de error más descriptivo
    let errorMessage = "Error al procesar el archivo";
    
    if (error.response) {
      // El servidor respondió con un código de error
      const detail = error.response.data?.detail || error.response.data?.message || "Error desconocido del servidor";
      errorMessage = `Error del servidor: ${detail}`;
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      errorMessage = "No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.";
    } else {
      // Algo más pasó
      errorMessage = `Error: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
}
