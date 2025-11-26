import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Ajusta si el backend está en otro puerto

/**
 * Sube un archivo, obtiene sugerencias IA del backend.
 * Llama primero a /upload, luego a /suggest.
 */
export async function uploadFileAndGetSuggestions(file) {
  try {
    // 1. Sube el archivo y obtiene el resumen con file_id
    const formData = new FormData();
    formData.append('file', file);
    console.log('🔧 Haciendo POST a:', `${API_BASE}/upload`);
    const uploadResp = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('✅ Upload exitoso:', uploadResp.data);
    // 2. Envía el resumen a /suggest (sin file_id ni filename)
    const { file_id, filename, ...summary } = uploadResp.data;
    const suggestResp = await axios.post(`${API_BASE}/suggest`, summary);

    return {
      suggestions: suggestResp.data,
      fileId: file_id,
      filename: filename
    };
  } catch (error) {
    console.error('❌ Error completo:', error);
    let errorMessage = "Error al procesar el archivo";

    if (error.response) {
      // El servidor respondió con un código de error
      const detail = error.response.data?.detail || error.response.data?.message || "Error desconocido del servidor";
      errorMessage = `Error del servidor: ${detail}`;
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      errorMessage = "No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.";
    } else {
      // Algo pasó al configurar la petición
      errorMessage = `Error: ${error.message}`;
    }

    throw new Error(errorMessage);
  }
}

/**
 * Obtiene los datos procesados para una gráfica específica.
 * @param {string} fileId - ID único del archivo subido
 * @param {object} parameters - Parámetros de la gráfica (x_axis, y_axis, hue, agg_func)
 * @returns {Promise<{data: Array, columns: Array}>}
 */
export async function getChartData(fileId, parameters) {
  try {
    const response = await axios.post(`${API_BASE}/chart-data`, {
      file_id: fileId,
      parameters
    });
    return response.data;
  } catch (error) {
    let errorMessage = "Error al obtener datos de la gráfica";

    if (error.response) {
      const detail = error.response.data?.detail || error.response.data?.message || "Error desconocido del servidor";
      errorMessage = `Error del servidor: ${detail}`;
    } else if (error.request) {
      errorMessage = "No se pudo conectar con el servidor.";
    } else {
      errorMessage = `Error: ${error.message}`;
    }

    throw new Error(errorMessage);
  }
}
