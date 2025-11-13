# data_utils.py
# Utilidades para procesamiento de datos con pandas en la API
import pandas as pd
from typing import Dict, Any, Tuple


def read_file_to_df(file_path: str) -> pd.DataFrame:
    """
    Lee un archivo .csv o .xlsx y retorna un DataFrame de pandas.
    """
    # Lógica pendiente: distinguir formato y cargar
    pass

def get_dataframe_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Obtiene resumen de columnas (nombres/tipos), describe, info, etc.,
    para envío a la IA como contexto.
    """
    # Usar df.describe(), df.info(), df.dtypes, etc.
    pass

def aggregate_for_chart(df: pd.DataFrame, params: Dict[str, Any]) -> Tuple[list, list]:
    """
    Devuelve datos agregados y columnas para el gráfico según los parámetros.
    """
    # Implementar lógica de agrupación y agregados
    pass
