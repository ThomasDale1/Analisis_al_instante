# endpoints.py
# Definición de rutas de la API para manejo de archivos, sugerencias IA y datos de gráficos
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models import schemas
from typing import List
import logging
from app.core.data_utils import read_file_to_df, get_dataframe_summary
from app.core.ai import build_prompt, get_suggestions_from_llm

# Configurar logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/upload", response_model=schemas.DataFrameSummary)
async def upload_file(file: UploadFile = File(...)):
    """
    Procesa realmente el archivo proporcionado y retorna un resumen de pandas.
    """
    try:
        df = read_file_to_df(file)
        summary = get_dataframe_summary(df)
        return summary
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error procesando archivo: {str(e)}")

@router.post("/suggest", response_model=List[schemas.ChartSuggestion])
async def get_ai_suggestions(summary: schemas.DataFrameSummary):
    """
    Usa IA real (OpenAI) para generar sugerencias de visualización basadas en los datos reales.
    """
    try:
        # Convertir el Pydantic model a dict para trabajar con él
        summary_dict = summary.model_dump()
        logger.info(f"Recibido resumen con {len(summary_dict.get('columns', []))} columnas")
        
        # Construir el prompt para la IA
        prompt = build_prompt(summary_dict)
        logger.debug("Prompt construido exitosamente")
        
        # Obtener sugerencias de la IA
        suggestions = get_suggestions_from_llm(prompt)
        logger.info(f"Se generaron {len(suggestions)} sugerencias de visualización")
        
        # Validar y convertir cada sugerencia al schema esperado
        validated_suggestions = []
        for sugg in suggestions:
            # Asegurar que los parámetros estén en el formato correcto
            params = sugg.get("parameters", {})
            chart_params = schemas.ChartParameters(
                x_axis=params.get("x_axis", ""),
                y_axis=params.get("y_axis"),
                hue=params.get("hue"),
                agg_func=params.get("agg_func")
            )
            
            chart_suggestion = schemas.ChartSuggestion(
                title=sugg.get("title", "Gráfico sin título"),
                chart_type=sugg.get("chart_type", "bar"),
                parameters=chart_params,
                insight=sugg.get("insight", "Sin insight disponible")
            )
            validated_suggestions.append(chart_suggestion)
        
        return validated_suggestions
        
    except ValueError as e:
        error_detail = str(e)
        # Si el error es sobre la API key, dar instrucciones más claras
        if "OPENAI_API_KEY" in error_detail:
            error_detail += "\n\nPor favor, crea un archivo .env en la carpeta backend/ con:\nOPENAI_API_KEY=sk-tu-clave-aqui"
        raise HTTPException(status_code=400, detail=error_detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando sugerencias: {str(e)}")

@router.post("/chart-data", response_model=schemas.ChartData)
async def get_chart_data(params: schemas.ChartParameters):
    """
    Simula los datos agregados para una gráfica concreta.
    """
    # Para ahora, solo devuelve datos fijos de ejemplo
    return {
        "data": [
            {"Región": "Centro", "Ventas": 3000},
            {"Región": "Norte", "Ventas": 2500},
            {"Región": "Sur", "Ventas": 1500}
        ],
        "columns": ["Región", "Ventas"]
    }
