# main.py
# Punto de entrada de la aplicación FastAPI para 'Análisis al Instante'
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(title="Análisis al Instante", description="API para análisis y dashboard automático de datos con IA", version="0.1")

# Configuración de CORS (ajusta origins para producción)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de rutas definidas en endpoints.py
app.include_router(endpoints.router)
