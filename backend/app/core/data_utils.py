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

def _calculate_boxplot_stats(df: pd.DataFrame, x_axis: str, y_axis: str) -> Tuple[list, list]:
    """
    Calcula estadísticas de box plot (min, Q1, median, Q3, max) por categoría.
    """
    logger.info(f"Calculando estadísticas de box plot para {x_axis} vs {y_axis}")
    
    result = []
    categories = df[x_axis].unique()
    
    for category in categories:
        category_data = df[df[x_axis] == category][y_axis].dropna()
        
        if len(category_data) > 0:
            stats = {
                x_axis: category,
                'min': float(category_data.min()),
                'q1': float(category_data.quantile(0.25)),
                'median': float(category_data.quantile(0.5)),
                'q3': float(category_data.quantile(0.75)),
                'max': float(category_data.max()),
                'mean': float(category_data.mean()),
                'count': int(len(category_data))
            }
            result.append(stats)
    
    columns = [x_axis, 'min', 'q1', 'median', 'q3', 'max', 'mean', 'count']
    return result, columns


def aggregate_for_chart(df: pd.DataFrame, params: Dict[str, Any]) -> Tuple[list, list]:
    """
    Devuelve datos agregados y columnas para el gráfico según los parámetros.
    Soporta agregaciones como sum, mean, count, etc.
    Para box plots, calcula estadísticas de distribución.
    """
    # Manejo seguro de None values
    x_axis = params.get("x_axis") or ""
    y_axis = params.get("y_axis") or ""
    hue = params.get("hue")
    agg_func = params.get("agg_func") or "sum"
    chart_type = params.get("chart_type", "").lower()
    
    # Strip solo si no es None
    x_axis = x_axis.strip() if x_axis else ""
    y_axis = y_axis.strip() if y_axis else ""
    if hue:
        hue = hue.strip() if isinstance(hue, str) else hue
    
    logger.info(f"Agregando datos: x={x_axis}, y={y_axis}, hue={hue}, agg={agg_func}, chart_type={chart_type}")
    
    # CASO ESPECIAL: Box plots deshabilitados - convertir a bar con mean
    if chart_type in ['box', 'boxplot']:
        logger.warning(f"Box plot detectado, convirtiendo a bar chart con mean")
        chart_type = 'bar'
        if not agg_func or agg_func == 'sum':
            agg_func = 'mean'
    
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
    
    # Detectar si x_axis es temporal y convertir si es necesario
    is_temporal = False
    temporal_aggregation = None
    if x_axis and x_axis in df.columns:
        # Verificar si es datetime o string que parece fecha
        if pd.api.types.is_datetime64_any_dtype(df[x_axis]):
            is_temporal = True
            logger.info(f"Columna '{x_axis}' detectada como temporal (datetime)")
        elif pd.api.types.is_object_dtype(df[x_axis]):
            # Intentar convertir a datetime
            try:
                df[x_axis] = pd.to_datetime(df[x_axis])
                is_temporal = True
                logger.info(f"Columna '{x_axis}' convertida a temporal")
            except:
                logger.info(f"Columna '{x_axis}' no se pudo convertir a temporal")
        
        # Si es temporal, determinar el nivel de agregación apropiado
        if is_temporal:
            # Calcular el rango temporal
            date_range = df[x_axis].max() - df[x_axis].min()
            unique_dates = df[x_axis].nunique()
            
            # Decidir agregación según el rango
            if date_range.days > 365 * 2:  # Más de 2 años → Agrupar por trimestre
                temporal_aggregation = 'quarter'
                # Crear columna temporal formateada (2018-Q1, 2018-Q2, etc.)
                df[x_axis] = df[x_axis].dt.to_period('Q').astype(str)
                logger.info(f"Agregación temporal: TRIMESTRE (rango: {date_range.days} días)")
            elif date_range.days > 90 or unique_dates > 30:  # Más de 3 meses o >30 fechas → Agrupar por mes
                temporal_aggregation = 'month'
                # Crear columna temporal formateada (YYYY-MM)
                df[x_axis] = df[x_axis].dt.to_period('M').astype(str)
                logger.info(f"Agregación temporal: MES (rango: {date_range.days} días, {unique_dates} fechas únicas)")
            else:  # Menos de 3 meses y pocas fechas → Mantener por día
                temporal_aggregation = 'day'
                # Formatear como YYYY-MM-DD para mejor legibilidad
                df[x_axis] = df[x_axis].dt.strftime('%Y-%m-%d')
                logger.info(f"Agregación temporal: DÍA (rango corto: {date_range.days} días)")
    
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
                    # Ordenar por x_axis si es temporal
                    if is_temporal:
                        grouped = grouped.sort_values(by=x_axis)
                        logger.info(f"Datos ordenados cronológicamente por '{x_axis}'")
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
                    # Ordenar por x_axis si es temporal
                    if is_temporal:
                        grouped = grouped.sort_values(by=x_axis)
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
                # Ordenar por x_axis si es temporal (en lugar de por frecuencia)
                if is_temporal:
                    grouped = grouped.sort_values(by=x_axis)
                    logger.info(f"Conteo ordenado cronológicamente por '{x_axis}'")
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
