# Backend - Análisis al Instante

Este backend expone una API para analizar hojas de cálculo y sugerir visualizaciones utilizando IA.

## Estructura del backend
```
backend/
  └── app/
      ├── main.py          # Punto de entrada FastAPI
      ├── api/endpoints.py # Endpoints principales del API
      ├── core/            # Utils: IA y manejo de datos
      ├── models/schemas.py# Esquemas Pydantic
      └── config.py        # Configuración global
```

## Cómo iniciar

1. Instala dependencias:
   ```
   pip install -r requirements.txt
   ```
2. Ejecuta el servidor:
   ```
   uvicorn app.main:app --reload
   ```

- Por defecto acepta conexiones desde cualquier origen (`CORS`).
- Puedes modificar la configuración, rutas y claves en `app/config.py` y en un archivo `.env` (no compartido por seguridad).

### Endpoints principales
- `/upload`: Recibe archivo y genera resumen.
- `/suggest`: Usa IA para sugerir visualizaciones.
- `/chart-data`: Devuelve datos agregados para una visualización específica.

---

**Desarrollado para facilitar el análisis de datos y visualizaciones automáticas con IA.**
