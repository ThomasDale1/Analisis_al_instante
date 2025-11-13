import axios from 'axios';

const API_BASE = 'http://localhost:8000'; // Ajusta si el backend está en otro puerto

/**
 * Sube un archivo, obtiene sugerencias IA del backend.
 * Llama primero a /upload, luego a /suggest.
 */
export async function uploadFileAndGetSuggestions(file) {
  // 1. Sube el archivo y obtiene el resumen
  const formData = new FormData();
  formData.append('file', file);

  const uploadResp = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  // 2. Envía el resumen a /suggest (simula round-trip)
  const summary = uploadResp.data;
  const suggestResp = await axios.post(`${API_BASE}/suggest`, summary);

  return suggestResp.data; // array de sugerencias
}
