# ai.py
# Funciones para generación de prompts y consulta al LLM para análisis inteligente
from typing import Dict, Any, List
import json
import os
import logging
from openai import OpenAI
from app.config import OPENAI_API_KEY

logger = logging.getLogger(__name__)


def build_prompt(summary: Dict[str, Any]) -> str:
    """
    Construye el prompt para el LLM basado en el resumen del DataFrame.
    """
    columns = summary.get("columns", [])
    dtypes = summary.get("dtypes", {})
    describe = summary.get("describe", {})
    info = summary.get("info", "")
    
    logger.info(f"Construyendo prompt para {len(columns)} columnas: {', '.join(columns)}")
    
    prompt = f"""Eres un analista de datos experto. Analiza el siguiente conjunto de datos y sugiere visualizaciones impactantes.

INFORMACIÓN DEL DATASET:
- Columnas: {', '.join(columns)}
- Tipos de datos: {json.dumps(dtypes, indent=2)}
- Estadísticas descriptivas: {json.dumps(describe, indent=2, default=str)}
- Información del DataFrame:
{info}

INSTRUCCIONES:
1. Identifica los patrones, relaciones o insights más interesantes en estos datos.
2. Sugiere entre 3 y 5 visualizaciones específicas que destaquen estos patrones.
3. Para cada visualización, proporciona:
   - Un título descriptivo y atractivo
   - El tipo de gráfico más adecuado (bar, line, pie, scatter, area, etc.)
   - Las columnas a usar (x_axis, y_axis, y opcionalmente hue para agrupaciones)
   - Un insight breve (1-2 oraciones) explicando qué revela esta visualización

TIPOS DE GRÁFICOS DISPONIBLES:
- bar: Para comparar categorías
- line: Para tendencias temporales
- pie: Para proporciones/porcentajes
- scatter: Para relaciones entre dos variables numéricas
- area: Para tendencias acumulativas
- histogram: Para distribuciones

IMPORTANTE:
- Responde ÚNICAMENTE con un JSON válido, sin texto adicional antes o después.
- El JSON debe tener este formato exacto:
[
  {{
    "title": "Título descriptivo del gráfico",
    "chart_type": "bar",
    "parameters": {{
      "x_axis": "nombre_columna_x",
      "y_axis": "nombre_columna_y"
    }},
    "insight": "Breve análisis de qué revela este gráfico"
  }}
]

Asegúrate de que los nombres de las columnas en "parameters" coincidan exactamente con las columnas proporcionadas.
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
