# data_utils.py
# Utilidades para procesamiento de datos con pandas en la API
import pandas as pd
from typing import Dict, Any, Tuple
from fastapi import UploadFile
import io


def read_file_to_df(file: UploadFile) -> pd.DataFrame:
    """
    Lee un UploadFile (.csv o .xlsx) y retorna un DataFrame de pandas
    """
    content = file.file.read()
    filename = file.filename.lower()
    # Retrocede puntero para futuras lecturas (opcional)
    file.file.seek(0)
    if filename.endswith('.csv'):
        df = pd.read_csv(io.BytesIO(content))
    elif filename.endswith('.xlsx') or filename.endswith('.xls'):
        df = pd.read_excel(io.BytesIO(content))
    else:
        raise ValueError('Formato de archivo no soportado: debe ser .csv o .xlsx')
    return df

def get_dataframe_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Obtiene nombres de columnas, tipos, describe() e info (como texto)
    """
    # Columnas y tipos
    columns = df.columns.tolist()
    dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
    # Estadísticas numéricas generales
    describe = df.describe(include='all').fillna("").to_dict()
    # info como texto plano
    buffer = io.StringIO()
    df.info(buf=buffer)
    info_str = buffer.getvalue()
    return {
        "columns": columns,
        "dtypes": dtypes,
        "describe": describe,
        "info": info_str
    }

def aggregate_for_chart(df: pd.DataFrame, params: Dict[str, Any]) -> Tuple[list, list]:
    """
    Devuelve datos agregados y columnas para el gráfico según los parámetros.
    """
    # Implementar lógica de agrupación y agregados
    pass
