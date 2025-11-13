# ai.py
# Funciones para generación de prompts y consulta al LLM para análisis inteligente
from typing import Dict, Any, List


def build_prompt(summary: Dict[str, Any]) -> str:
    """
    Construye el prompt para el LLM basado en el resumen del DataFrame.
    """
    # Ejemplo: incluye nombres de columnas, tipos, y resumen estadístico
    pass

def get_suggestions_from_llm(prompt: str) -> List[Dict[str, Any]]:
    """
    Llama a la API de IA (ej. OpenAI) con el prompt y devuelve sugerencias en JSON.
    """
    # Implementar integración con LLM
    pass
