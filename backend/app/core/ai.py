# ai.py
# Funciones para generación de prompts y consulta al LLM para análisis inteligente
from typing import Dict, Any, List
import json
import os
import logging
from openai import OpenAI
from app.config import OPENAI_API_KEY

logger = logging.getLogger(__name__)


def _classify_columns(columns: list, dtypes: dict, describe: dict) -> str:
    """
    Clasifica las columnas por tipo y características para ayudar a la IA.
    """
    classification = []
    
    for col in columns:
        dtype = dtypes.get(col, "unknown")
        col_stats = describe.get(col, {})
        unique_count = col_stats.get("unique", "N/A")
        
        # Determinar el tipo de columna
        if "int" in dtype or "float" in dtype:
            col_type = "NUMÉRICA"
            suggestion = "Ideal para y_axis en gráficos de barras, o para scatter plots"
        elif "object" in dtype or "string" in dtype:
            if isinstance(unique_count, (int, float)) and unique_count > 10:
                col_type = "CATEGÓRICA (muchos valores únicos)"
                suggestion = "EVITAR en gráficos de pastel. Puede ser nombre/ID único"
            else:
                col_type = "CATEGÓRICA (pocos valores)"
                suggestion = "Ideal para x_axis en barras o pastel"
        elif "datetime" in dtype:
            col_type = "TEMPORAL"
            suggestion = "Ideal para x_axis en gráficos de línea"
        else:
            col_type = "OTRO"
            suggestion = "Analizar caso por caso"
        
        classification.append(f"  - {col}: {col_type} (valores únicos: {unique_count}) → {suggestion}")
    
    return "\n".join(classification)


def build_prompt(summary: Dict[str, Any]) -> str:
    """
    Construye el prompt para el LLM basado en el resumen del DataFrame.
    """
    columns = summary.get("columns", [])
    dtypes = summary.get("dtypes", {})
    describe = summary.get("describe", {})
    info = summary.get("info", "")
    
    logger.info(f"Construyendo prompt para {len(columns)} columnas: {', '.join(columns)}")
    
    prompt = f"""Eres un analista de datos experto especializado en visualización de datos. Analiza el siguiente dataset y sugiere las visualizaciones más relevantes e impactantes.

INFORMACIÓN DEL DATASET:
- Columnas disponibles: {', '.join(columns)}
- Tipos de datos: {json.dumps(dtypes, indent=2)}
- Estadísticas descriptivas: {json.dumps(describe, indent=2, default=str)}
- Información del DataFrame:
{info}

REGLAS CRÍTICAS PARA SELECCIÓN DE COLUMNAS:
1. **Para gráficos de BARRAS (bar)**:
   - x_axis: Usa columnas CATEGÓRICAS (texto, departamentos, regiones, categorías)
   - y_axis: Usa columnas NUMÉRICAS (salarios, ventas, cantidades, edades)
   - Ejemplo: x_axis="Departamento", y_axis="Salario" (NO uses columnas de nombres de personas)

2. **Para gráficos de PASTEL (pie)**:
   - x_axis: Usa SOLO columnas categóricas con POCOS valores únicos (departamentos, categorías, regiones)
   - y_axis: Déjalo vacío o null (el gráfico contará automáticamente)
   - NUNCA uses columnas con nombres de personas o IDs únicos
   - Ejemplo: x_axis="Departamento" (mostrará la proporción de cada departamento)

3. **Para gráficos de DISPERSIÓN (scatter)**:
   - x_axis: Variable numérica independiente (edad, años de experiencia)
   - y_axis: Variable numérica dependiente (salario, ventas)
   - Ejemplo: x_axis="Edad", y_axis="Salario"

4. **Para gráficos de LÍNEA (line)**:
   - x_axis: Fechas, tiempo, o secuencias ordenadas
   - y_axis: Valores numéricos que cambian en el tiempo
   - Solo usa si hay columnas de fecha o tiempo

5. **Para HISTOGRAMAS (histogram)**:
   - x_axis: Una sola columna numérica para ver su distribución
   - y_axis: Déjalo vacío (el histograma cuenta frecuencias automáticamente)

TIPOS DE COLUMNAS IDENTIFICADAS:
{_classify_columns(columns, dtypes, describe)}

INSTRUCCIONES:
1. Analiza los tipos de columnas y sus valores únicos
2. Sugiere EXACTAMENTE 5 visualizaciones que sean RELEVANTES y CORRECTAS
3. EVITA usar columnas con muchos valores únicos (como nombres de personas) en gráficos de pastel o barras
4. Prioriza comparaciones significativas (salarios por departamento, distribuciones de edad, etc.)
5. Usa VARIEDAD de tipos de gráficos (bar, pie, scatter, histogram, line si hay fechas)
6. Para cada visualización, proporciona:
   - Un título claro y descriptivo
   - El tipo de gráfico más apropiado según los datos
   - Las columnas correctas para x_axis e y_axis
   - Un insight breve (1-2 oraciones) explicando qué revela

FORMATO DE RESPUESTA (JSON VÁLIDO):
[
  {{
    "title": "Distribución de Salarios por Departamento",
    "chart_type": "bar",
    "parameters": {{
      "x_axis": "Departamento",
      "y_axis": "Salario"
    }},
    "insight": "Compara los salarios promedio entre departamentos para identificar diferencias de compensación."
  }},
  {{
    "title": "Proporción de Empleados por Departamento",
    "chart_type": "pie",
    "parameters": {{
      "x_axis": "Departamento"
    }},
    "insight": "Muestra qué porcentaje del personal trabaja en cada departamento."
  }}
]

IMPORTANTE:
- Responde SOLO con el JSON, sin texto adicional
- Genera EXACTAMENTE 5 visualizaciones (no más, no menos)
- Los nombres de columnas deben coincidir EXACTAMENTE con: {', '.join(columns)}
- NO uses columnas de nombres de personas para gráficos de pastel o barras
- Verifica que las combinaciones x_axis/y_axis tengan sentido estadístico
- Usa diferentes tipos de gráficos para dar variedad
"""
    return prompt


def get_suggestions_from_llm(prompt: str) -> List[Dict[str, Any]]:
    """
    Llama a la API de OpenAI con el prompt y devuelve sugerencias en JSON.
    """
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY no está configurada. Por favor, configúrala en tu archivo .env")
    
    content = ""
    try:
        logger.info("Llamando a la API de OpenAI...")
        logger.debug(f"Prompt (primeros 500 caracteres): {prompt[:500]}...")
        
        # Inicializar el cliente de OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Hacer la llamada a la API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Eres un analista de datos experto. Siempre respondes con JSON válido y estructurado."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        logger.info("Respuesta recibida de OpenAI")
        
        # Extraer el contenido de la respuesta
        if not response.choices or not response.choices[0].message:
            raise ValueError("La respuesta de OpenAI está vacía o no tiene contenido")
        
        content = response.choices[0].message.content.strip()
        
        if not content:
            raise ValueError("La respuesta de la IA está vacía")
        
        # Limpiar el contenido si viene con markdown
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        # Parsear el JSON
        suggestions = json.loads(content)
        
        # Validar que sea una lista
        if not isinstance(suggestions, list):
            raise ValueError(f"La respuesta de la IA no es una lista de sugerencias. Tipo recibido: {type(suggestions)}")
        
        if len(suggestions) == 0:
            raise ValueError("La respuesta de la IA está vacía (lista sin elementos)")
        
        logger.info(f"Se recibieron {len(suggestions)} sugerencias de la IA")
        logger.debug(f"Sugerencias: {json.dumps(suggestions, indent=2, ensure_ascii=False)}")
        
        return suggestions
        
    except json.JSONDecodeError as e:
        error_msg = f"Error parseando la respuesta JSON de la IA: {str(e)}"
        if content:
            error_msg += f"\nContenido recibido (primeros 500 caracteres): {content[:500]}"
        raise ValueError(error_msg)
    except ValueError as e:
        raise
    except Exception as e:
        error_msg = f"Error llamando a la API de OpenAI: {str(e)}"
        if hasattr(e, 'response') and e.response:
            error_msg += f"\nDetalles de la respuesta: {e.response}"
        raise Exception(error_msg)
