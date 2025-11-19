import json
import os
import logging
from typing import Dict, Any, List
from openai import OpenAI
from app.config import OPENAI_API_KEY

logger = logging.getLogger(__name__)


def _extract_statistical_facts(columns: list, dtypes: dict, describe: dict) -> str:
    """
    Extrae HECHOS estadísticos verificables del dataset para que la IA los use.
    SOLO incluye números REALES de los datos, no suposiciones.
    """
    facts = []
    facts.append("📊 DATOS ESTADÍSTICOS REALES DEL DATASET:")
    facts.append("=" * 60)
    
    for col in columns:
        col_stats = describe.get(col, {})
        dtype = dtypes.get(col, "unknown")
        
        if "int" in dtype or "float" in dtype:
            mean = col_stats.get("mean")
            std = col_stats.get("std")
            min_val = col_stats.get("min")
            max_val = col_stats.get("max")
            count = col_stats.get("count")
            
            if mean is not None:
                facts.append(f"\n'{col}' (Numérica):")
                facts.append(f"  - Promedio: {mean:.2f}")
                if std:
                    facts.append(f"  - Desviación: {std:.2f}")
                if min_val is not None and max_val is not None:
                    facts.append(f"  - Rango: {min_val:.2f} a {max_val:.2f}")
                if count:
                    facts.append(f"  - Valores válidos: {int(count)}")
        
        elif "object" in dtype or "string" in dtype:
            unique_count = col_stats.get("unique")
            top_value = col_stats.get("top")
            top_freq = col_stats.get("freq")
            count = col_stats.get("count")
            
            if unique_count:
                facts.append(f"\n'{col}' (Categórica):")
                facts.append(f"  - Categorías únicas: {int(unique_count)}")
                if top_value and top_freq and count:
                    percentage = (top_freq / count) * 100
                    facts.append(f"  - Más frecuente: '{top_value}' ({int(top_freq)} veces, {percentage:.1f}%)")
    
    facts.append("\n" + "=" * 60)
    facts.append("⚠️ IMPORTANTE: USA SOLO ESTOS NÚMEROS REALES EN TUS INSIGHTS")
    facts.append("❌ NO INVENTES porcentajes ni estadísticas que no estén aquí")
    
    return "\n".join(facts)


def _generate_intelligent_insights(columns: list, dtypes: dict, describe: dict, analysis: dict) -> str:
    """Genera sugerencias inteligentes de análisis basadas en el dataset."""
    insights = []
    
    numeric_cols = analysis.get('numeric_columns', [])
    categorical_cols = analysis.get('categorical_columns', [])
    
    if len(numeric_cols) >= 2:
        insights.append(f"✅ OPORTUNIDAD: {len(numeric_cols)} columnas numéricas detectadas → Analiza CORRELACIONES con scatter plots")
    
    if len(categorical_cols) >= 1 and len(numeric_cols) >= 1:
        insights.append(f"✅ OPORTUNIDAD: Compara métricas numéricas entre categorías usando bar charts con agregaciones")
    
    for col in categorical_cols:
        col_stats = describe.get(col, {})
        unique_count = col_stats.get("unique", 0)
        if isinstance(unique_count, (int, float)) and 2 <= unique_count <= 7:
            insights.append(f"🎯 IDEAL para pie/donut: '{col}' tiene {int(unique_count)} categorías (rango perfecto 2-7)")
    
    temporal_cols = analysis.get('temporal_columns', [])
    if temporal_cols and numeric_cols:
        insights.append(f"⏰ TENDENCIA TEMPORAL: Columnas de fecha detectadas → Usa line/area charts para evolución temporal")
    
    high_card_cols = analysis.get('high_cardinality_columns', [])
    if high_card_cols:
        insights.append(f"⚠️ EVITAR: {', '.join(high_card_cols[:3])} tienen demasiados valores únicos → NO usar en visualizaciones")
    
    return "\n".join(insights) if insights else "ℹ️ Analiza las relaciones entre columnas para encontrar insights"


def _classify_columns(columns: list, dtypes: dict, describe: dict) -> tuple:
    """Clasifica columnas y genera análisis detallado."""
    classification = []
    numeric_cols = []
    categorical_cols = []
    temporal_cols = []
    high_cardinality_cols = []
    
    for col in columns:
        dtype = dtypes.get(col, "unknown")
        col_stats = describe.get(col, {})
        unique_count = col_stats.get("unique", "N/A")
        total_count = col_stats.get("count", "N/A")
        
        cardinality_ratio = None
        if isinstance(unique_count, (int, float)) and isinstance(total_count, (int, float)) and total_count > 0:
            cardinality_ratio = unique_count / total_count
        
        if "int" in dtype or "float" in dtype:
            col_type = "NUMÉRICA"
            numeric_cols.append(col)
            mean_val = col_stats.get("mean", "N/A")
            suggestion = f"✅ Útil para: agregaciones (mean/sum/max/min), correlaciones, scatter plots"
            
        elif "object" in dtype or "string" in dtype:
            categorical_cols.append(col)
            if cardinality_ratio and cardinality_ratio > 0.8:
                col_type = "IDENTIFICADOR ÚNICO"
                high_cardinality_cols.append(col)
                suggestion = f"❌ EVITAR: {unique_count} valores únicos (probablemente ID) → NO usar en gráficos"
            elif isinstance(unique_count, (int, float)) and unique_count > 15:
                col_type = "CATEGÓRICA (alta cardinalidad)"
                high_cardinality_cols.append(col)
                suggestion = f"⚠️ {unique_count} categorías → Solo si es crítico (limitar top 10)"
            else:
                col_type = "CATEGÓRICA"
                suggestion = f"✅ {unique_count} categorías → Ideal para x_axis en bar/pie/donut"
                
        elif "datetime" in dtype:
            col_type = "TEMPORAL"
            temporal_cols.append(col)
            suggestion = "✅ Ideal para x_axis en line/area charts (series de tiempo)"
        else:
            col_type = "OTRO"
            suggestion = "⚠️ Analizar caso por caso"
        
        classification.append(f"  - {col}: {col_type} → {suggestion}")
    
    analysis = {
        "numeric_columns": numeric_cols,
        "categorical_columns": [c for c in categorical_cols if c not in high_cardinality_cols],
        "temporal_columns": temporal_cols,
        "high_cardinality_columns": high_cardinality_cols,
        "total_rows": describe.get(columns[0], {}).get("count", "unknown") if columns else 0
    }
    
    return "\n".join(classification), analysis


def build_prompt(summary: Dict[str, Any]) -> str:
    """Construye el prompt completo para la IA con todas las reglas y ejemplos."""
    columns = summary.get("columns", [])
    dtypes = summary.get("dtypes", {})
    describe = summary.get("describe", {})
    
    logger.info(f"Construyendo prompt para {len(columns)} columnas")
    
    column_classification, analysis = _classify_columns(columns, dtypes, describe)
    auto_insights = _generate_intelligent_insights(columns, dtypes, describe, analysis)
    statistical_facts = _extract_statistical_facts(columns, dtypes, describe)
    
    prompt = f"""Eres un analista senior de datos con 15 años de experiencia en Business Intelligence y Data Science.

🚨🚨🚨 REGLAS CRÍTICAS - LEE PRIMERO 🚨🚨🚨

1. **ESTRUCTURA JSON OBLIGATORIA:**
   - Cada gráfico DEBE tener exactamente esta estructura:
   {{
     "title": "Título Específico del Gráfico",
     "chart_type": "bar",  // SOLO: bar, pie, donut, scatter, line, area
     "parameters": {{
       "x_axis": "nombre_columna_exacto",      // Columna del eje X
       "y_axis": "nombre_columna_exacto",      // Columna del eje Y (o null para count)
       "agg_func": "mean"                       // SOLO: mean, sum, count, max, min (NUNCA std, var, median)
     }},
     "insight": "Descripción del propósito del gráfico (NO conclusiones)"
   }}

2. **ERROR CRÍTICO A EVITAR:**
   ❌ PROHIBIDO: "y_axis": "mean"  // ← ERROR: "mean" NO es una columna
   ❌ PROHIBIDO: "y_axis": "sum"   // ← ERROR: "sum" NO es una columna
   ✅ CORRECTO: "y_axis": "payment_value", "agg_func": "mean"
   ✅ CORRECTO: "y_axis": "Salario", "agg_func": "sum"

3. **NOMBRES DE COLUMNAS EXACTOS:**
   Las columnas disponibles son: {', '.join(columns)}
   ⚠️ Usa estos nombres EXACTAMENTE como aparecen (respeta mayúsculas/minúsculas)

4. **FUNCIONES DE AGREGACIÓN:**
   - SOLO PERMITIDAS: "mean", "sum", "count", "max", "min"
   - PROHIBIDAS: "std", "var", "median" (generan gráficos vacíos)

5. **DIVERSIDAD OBLIGATORIA:**
   - 5 gráficos ÚNICOS (NO repetir la misma columna como eje principal)
   - 5 tipos DIFERENTES (bar, pie/donut, scatter, line/area)
   - NO repitas análisis (ej: si haces "count por estado" en gráfico 1, NO lo hagas en gráfico 4)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 DATASET A ANALIZAR:

Total de filas: {analysis['total_rows']}
Columnas disponibles: {len(columns)}

{column_classification}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{statistical_facts}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 SUGERENCIAS DE ANÁLISIS:
{auto_insights}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 GUÍA COMPLETA POR TIPO DE GRÁFICO:

**1. BAR / COLUMN (Comparaciones)**
   ✅ Cuándo usar: Comparar valores agregados entre categorías
   ✅ Parámetros:
      - x_axis: Columna categórica (ej: "customer_state", "payment_type")
      - y_axis: Columna numérica (ej: "payment_value", "order_id")
      - agg_func: "mean", "sum", "count", "max", "min"
   ✅ Ejemplo:
   {{
     "title": "Valor Total de Pagos por Tipo",
     "chart_type": "bar",
     "parameters": {{
       "x_axis": "payment_type",
       "y_axis": "payment_value",
       "agg_func": "sum"
     }},
     "insight": "Compara el volumen de ingresos por método de pago para identificar preferencias de los clientes y optimizar opciones de pago disponibles."
   }}

**2. PIE / DONUT (Proporciones)**
   ✅ Cuándo usar: Mostrar distribución porcentual de categorías (2-7 categorías ideal)
   ✅ Parámetros:
      - x_axis: Columna categórica con pocos valores únicos
      - y_axis: null (contará automáticamente)
      - agg_func: null
   ✅ Ejemplo:
   {{
     "title": "Distribución de Órdenes por Estado",
     "chart_type": "donut",
     "parameters": {{
       "x_axis": "order_status"
     }},
     "insight": "Visualiza la composición porcentual de estados de órdenes para identificar cuellos de botella en el proceso de cumplimiento y evaluar eficiencia operativa."
   }}

**3. SCATTER (Correlaciones)**
   ✅ Cuándo usar: Analizar relación entre 2 variables numéricas
   ✅ Parámetros:
      - x_axis: Columna numérica continua
      - y_axis: Columna numérica continua
      - agg_func: null (no se agrega)
   ✅ Ejemplo:
   {{
     "title": "Relación entre Código Postal y Valor de Pago",
     "chart_type": "scatter",
     "parameters": {{
       "x_axis": "customer_zip_code_prefix",
       "y_axis": "payment_value"
     }},
     "insight": "Examina si existe relación entre ubicación geográfica y monto de compra para identificar regiones de alto valor y dirigir estrategias de marketing regional."
   }}

**4. LINE / AREA (Tendencias Temporales)**
   ✅ Cuándo usar: SOLO si hay columnas de fecha/tiempo
   ✅ Parámetros:
      - x_axis: Columna temporal
      - y_axis: Métrica numérica
      - agg_func: "mean", "sum", "count"
   ✅ Ejemplo:
   {{
     "title": "Evolución de Pagos en el Tiempo",
     "chart_type": "line",
     "parameters": {{
       "x_axis": "order_purchase_timestamp",
       "y_axis": "payment_value",
       "agg_func": "sum"
     }},
     "insight": "Observa tendencias temporales de ingresos para identificar estacionalidad, picos de demanda y planificar inventario o promociones."
   }}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 TU TAREA:

Genera EXACTAMENTE 5 visualizaciones siguiendo estas preguntas:

1. **¿Dónde están las OPORTUNIDADES?** → Identifica categorías con mayor potencial
2. **¿Dónde están los RIESGOS?** → Detecta concentraciones peligrosas o outliers
3. **¿Qué está CAUSANDO las diferencias?** → Busca correlaciones entre variables
4. **¿Hacia dónde VAMOS?** → Analiza tendencias temporales (si hay fechas)
5. **¿Cómo están DISTRIBUIDOS los recursos?** → Visualiza composición/distribución

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VALIDACIONES ANTES DE RESPONDER:

[ ] ¿Usé SOLO columnas de esta lista?: {', '.join(columns)}
[ ] ¿Usé SOLO agg_func permitidas?: mean, sum, count, max, min
[ ] ¿Cada y_axis es una COLUMNA REAL (no "mean" o "sum")?
[ ] ¿Los 5 gráficos usan columnas X DIFERENTES?
[ ] ¿Los 5 gráficos son tipos DIFERENTES?
[ ] ¿Evité columnas con muchos valores únicos?: {', '.join(analysis['high_cardinality_columns'][:3]) if analysis['high_cardinality_columns'] else 'N/A'}
[ ] ¿Mis insights describen el PROPÓSITO (no conclusiones)?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 FORMATO DE RESPUESTA:

Responde SOLO con el array JSON (sin markdown, sin ```json, sin explicaciones):

[
  {{
    "title": "Título específico del primer gráfico",
    "chart_type": "bar",
    "parameters": {{
      "x_axis": "nombre_columna_exacto",
      "y_axis": "nombre_columna_exacto",
      "agg_func": "mean"
    }},
    "insight": "Descripción del propósito y utilidad del gráfico para toma de decisiones."
  }},
  {{
    "title": "Título específico del segundo gráfico",
    "chart_type": "donut",
    "parameters": {{
      "x_axis": "nombre_columna_exacto"
    }},
    "insight": "Descripción del propósito y utilidad del gráfico para toma de decisiones."
  }},
  {{
    "title": "Título específico del tercer gráfico",
    "chart_type": "scatter",
    "parameters": {{
      "x_axis": "nombre_columna_exacto",
      "y_axis": "nombre_columna_exacto"
    }},
    "insight": "Descripción del propósito y utilidad del gráfico para toma de decisiones."
  }},
  {{
    "title": "Título específico del cuarto gráfico",
    "chart_type": "bar",
    "parameters": {{
      "x_axis": "nombre_columna_exacto",
      "y_axis": "nombre_columna_exacto",
      "agg_func": "sum"
    }},
    "insight": "Descripción del propósito y utilidad del gráfico para toma de decisiones."
  }},
  {{
    "title": "Título específico del quinto gráfico",
    "chart_type": "line",
    "parameters": {{
      "x_axis": "nombre_columna_exacto",
      "y_axis": "nombre_columna_exacto",
      "agg_func": "count"
    }},
    "insight": "Descripción del propósito y utilidad del gráfico para toma de decisiones."
  }}
]

🚨 RECUERDA: 
- NO pongas "mean" o "sum" como nombre de columna en y_axis
- SOLO usa columnas de esta lista: {', '.join(columns)}
- RESPONDE SOLO CON EL JSON (sin texto adicional)
"""
    
    return prompt


def get_suggestions_from_llm(prompt: str) -> List[Dict[str, Any]]:
    """Llama a la API de OpenAI y devuelve las sugerencias de visualización."""
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY no está configurada. Por favor, configúrala en tu archivo .env")
    
    content = ""
    try:
        logger.info("Llamando a la API de OpenAI...")
        
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """Eres un analista de datos senior con 15 años de experiencia en BI y Data Science.

REGLAS CRÍTICAS:
🚨 NUNCA uses "mean", "sum", "count" como nombre de columna en y_axis
🚨 y_axis debe ser siempre el NOMBRE DE UNA COLUMNA REAL del dataset
🚨 agg_func es donde pones "mean", "sum", "count", "max", "min"
🚨 SOLO usa agg_func permitidas: mean, sum, count, max, min
🚨 PROHIBIDO usar: std, var, median
🚨 Cada gráfico debe analizar una COLUMNA DIFERENTE como eje principal
🚨 Insights deben describir el PROPÓSITO (no conclusiones)

ESTRUCTURA CORRECTA:
{
  "y_axis": "payment_value",  // ← Nombre de columna real
  "agg_func": "mean"           // ← Función de agregación
}

ESTRUCTURA INCORRECTA (PROHIBIDA):
{
  "y_axis": "mean",  // ❌ ERROR: "mean" no es una columna
  "agg_func": "sum"
}

Siempre respondes con JSON válido sin markdown.
Tus sugerencias son inteligentes, variadas y orientadas al valor de negocio."""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=2500
        )
        
        logger.info("Respuesta recibida de OpenAI")
        
        if not response.choices or not response.choices[0].message:
            raise ValueError("La respuesta de OpenAI está vacía")
        
        content = response.choices[0].message.content.strip()
        
        if not content:
            raise ValueError("La respuesta de la IA está vacía")
        
        # Limpiar markdown si existe
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        suggestions = json.loads(content)
        
        if not isinstance(suggestions, list):
            raise ValueError(f"La respuesta no es una lista. Tipo: {type(suggestions)}")
        
        if len(suggestions) == 0:
            raise ValueError("La respuesta está vacía (sin sugerencias)")
        
        logger.info(f"Se recibieron {len(suggestions)} sugerencias de la IA")
        
        return suggestions
        
    except json.JSONDecodeError as e:
        error_msg = f"Error parseando JSON: {str(e)}"
        if content:
            error_msg += f"\n\nContenido recibido:\n{content[:500]}"
        logger.error(error_msg)
        raise ValueError(error_msg)
    except ValueError as e:
        logger.error(f"ValueError: {str(e)}")
        raise
    except Exception as e:
        error_msg = f"Error llamando a OpenAI: {str(e)}"
        logger.error(error_msg)
        raise Exception(error_msg)
