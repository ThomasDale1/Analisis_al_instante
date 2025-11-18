# data_utils.py
# Utilidades para procesamiento de datos con pandas en la API
import pandas as pd
from typing import Dict, Any, Tuple
from fastapi import UploadFile
import io
import re
import logging

logger = logging.getLogger(__name__)


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
    Soporta agregaciones como sum, mean, count, etc.
    """
    # Manejo seguro de None values
    x_axis = params.get("x_axis") or ""
    y_axis = params.get("y_axis") or ""
    hue = params.get("hue")
    agg_func = params.get("agg_func") or "sum"
    
    # Strip solo si no es None
    x_axis = x_axis.strip() if x_axis else ""
    y_axis = y_axis.strip() if y_axis else ""
    if hue:
        hue = hue.strip() if isinstance(hue, str) else hue
    
    logger.info(f"Agregando datos: x={x_axis}, y={y_axis}, hue={hue}, agg={agg_func}")
    
    # Parsear columnas virtuales como "average(Salario)" o "count"
    if y_axis and '(' in y_axis and ')' in y_axis:
        match = re.match(r'(\w+)\((.+)\)', y_axis)
        if match:
            agg_func = match.group(1).lower()
            y_axis = match.group(2).strip()
            # Normalizar nombres de funciones
            if agg_func in ['average', 'avg', 'mean']:
                agg_func = 'mean'
            elif agg_func in ['count', 'cnt']:
                agg_func = 'count'
            elif agg_func in ['total', 'sum']:
                agg_func = 'sum'
    
    # Si y_axis es "count", es una agregación especial
    if y_axis and y_axis.lower() == 'count':
        y_axis = None
        agg_func = 'count'
    
    # Validar que x_axis exista
    if x_axis and x_axis not in df.columns:
        if not x_axis or x_axis == '':
            x_axis = df.columns[0] if len(df.columns) > 0 else None
        else:
            raise ValueError(f"Columna '{x_axis}' no existe en el DataFrame. Columnas disponibles: {', '.join(df.columns.tolist())}")
    
    # Validar que y_axis exista (si se especificó)
    if y_axis and y_axis not in df.columns:
        raise ValueError(f"Columna '{y_axis}' no existe en el DataFrame. Columnas disponibles: {', '.join(df.columns.tolist())}")
    
    # Validar que hue exista (si se especificó)
    if hue and hue not in df.columns:
        raise ValueError(f"Columna '{hue}' no existe en el DataFrame")
    
    # Si no hay x_axis, retornar los primeros registros
    if not x_axis:
        result = df.head(10).to_dict('records')
        columns = df.columns.tolist()
        return result, columns
    
    # Caso 1: Tenemos y_axis numérico
    if y_axis and pd.api.types.is_numeric_dtype(df[y_axis]):
        # Si x_axis también es numérico, es un scatter plot - NO agregamos, retornamos datos raw
        if x_axis and pd.api.types.is_numeric_dtype(df[x_axis]):
            logger.info("Detectado scatter plot (ambas columnas numéricas) - retornando datos sin agregar")
            # Para scatter plots, incluir todas las columnas para contexto en tooltips
            result = df[[x_axis, y_axis] + [col for col in df.columns if col not in [x_axis, y_axis]]].head(50).to_dict('records')
            columns = df.columns.tolist()
        else:
            # Es un gráfico de barras/línea - agregamos
            try:
                if hue:
                    # Agrupar por x_axis y hue
                    grouped = df.groupby([x_axis, hue])[y_axis].agg(agg_func).reset_index()
                    result = grouped.to_dict('records')
                    columns = [x_axis, hue, y_axis]
                else:
                    # Agrupar solo por x_axis
                    grouped = df.groupby(x_axis)[y_axis].agg(agg_func).reset_index()
                    result = grouped.to_dict('records')
                    columns = [x_axis, y_axis]
            except Exception as e:
                logger.warning(f"Error en agregación {agg_func}, usando sum como fallback: {e}")
                # Fallback a sum si falla
                if hue:
                    grouped = df.groupby([x_axis, hue])[y_axis].sum().reset_index()
                    result = grouped.to_dict('records')
                    columns = [x_axis, hue, y_axis]
                else:
                    grouped = df.groupby(x_axis)[y_axis].sum().reset_index()
                    result = grouped.to_dict('records')
                    columns = [x_axis, y_axis]
    
    # Caso 2: Solo x_axis (conteo de frecuencias)
    elif x_axis:
        try:
            if hue:
                # Contar combinaciones de x_axis y hue
                grouped = df.groupby([x_axis, hue]).size().reset_index(name='count')
                result = grouped.to_dict('records')
                columns = [x_axis, hue, 'count']
            else:
                # Contar valores únicos de x_axis
                grouped = df[x_axis].value_counts().reset_index()
                grouped.columns = [x_axis, 'count']
                result = grouped.to_dict('records')
                columns = [x_axis, 'count']
        except Exception as e:
            logger.warning(f"Error en conteo, usando value_counts: {e}")
            # Fallback
            unique_values = df[x_axis].value_counts().reset_index()
            unique_values.columns = [x_axis, 'count']
            result = unique_values.head(10).to_dict('records')
            columns = [x_axis, 'count']
    
    # Caso 3: Sin parámetros válidos
    else:
        result = df.head(10).to_dict('records')
        columns = df.columns.tolist()
    
    logger.info(f"Datos agregados: {len(result)} registros, columnas: {columns}")
    return result, columns
