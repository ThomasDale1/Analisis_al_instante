# endpoints.py
# Definición de rutas de la API para manejo de archivos, sugerencias IA y datos de gráficos
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Form
from app.models import schemas
from typing import List

router = APIRouter()

@router.post("/upload", response_model=schemas.DataFrameSummary)
async def upload_file(file: UploadFile = File(...)):
    """Simula procesamiento de archivo."""
    # MOCK: devuelve un resumen falso, sin procesar nada aún
    summary = {
        "columns": ["Región", "Ventas", "Fecha"],
        "dtypes": {"Región": "object", "Ventas": "float64", "Fecha": "datetime64"},
        "describe": {
            "Ventas": {"mean": 1500, "max": 3000, "min": 500}
        },
        "info": "3 columnas: Región (texto), Ventas (numérico), Fecha (fecha)"
    }
    return summary

@router.post("/suggest", response_model=List[schemas.ChartSuggestion])
async def get_ai_suggestions(summary: schemas.DataFrameSummary):
    """Simula la respuesta de la IA con sugerencias ficticias."""
    # MOCK: sugerencias simuladas
    sample_suggestions = [
        {
            "title": "Ventas por Región",
            "chart_type": "bar",
            "parameters": {"x_axis": "Región", "y_axis": "Ventas"},
            "insight": "La región Centro presenta el mayor volumen de ventas."
        },
        {
            "title": "Tendencia de ventas",
            "chart_type": "line",
            "parameters": {"x_axis": "Fecha", "y_axis": "Ventas"},
            "insight": "Las ventas van en aumento durante el año."
        },
        {
            "title": "Ventas totales",
            "chart_type": "pie",
            "parameters": {"x_axis": "Región", "y_axis": "Ventas"},
            "insight": "La mayor proporción corresponde a la región Norte."
        }
    ]
    return sample_suggestions

@router.post("/chart-data", response_model=schemas.ChartData)
async def get_chart_data(params: schemas.ChartParameters):
    """Simula los datos agregados para una gráfica concreta."""
    # Para ahora, solo devuelve datos fijos de ejemplo
    return {
        "data": [
            {"Región": "Centro", "Ventas": 3000},
            {"Región": "Norte", "Ventas": 2500},
            {"Región": "Sur", "Ventas": 1500}
        ],
        "columns": ["Región", "Ventas"]
    }
