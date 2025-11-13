# schemas.py
# Esquemas Pydantic para validar requests y responses en cada endpoint
from pydantic import BaseModel
from typing import List, Dict, Any

class DataFrameSummary(BaseModel):
    """
    Resumen del DataFrame procesado: nombres y tipos de columnas,
    y estadísticas generales (describe, info).
    """
    columns: List[str]
    dtypes: Dict[str, str]
    describe: Dict[str, Any]
    info: str  # Por simplicidad, en texto plano, pero puede ser mejorado

class ChartParameters(BaseModel):
    """
    Especifica las columnas y posibles agregaciones necesarias para un gráfico
    (ejemplo: {"x_axis": "Región", "y_axis": "Ventas"}).
    """
    x_axis: str
    y_axis: str = None
    hue: str = None  # Opcional para agrupaciones
    agg_func: str = None  # opción para suma, promedio, etc.

class ChartSuggestion(BaseModel):
    """
    Sugerencia generada por la IA.
    """
    title: str
    chart_type: str  # bar, line, pie, scatter, etc.
    parameters: ChartParameters
    insight: str

class ChartData(BaseModel):
    """
    Datos agregados y listos para graficar con los parámetros seleccionados.
    """
    data: List[Dict[str, Any]]
    columns: List[str] # columnas relevantes para la gráfica
