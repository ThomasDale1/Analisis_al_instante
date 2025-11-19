# main.py
# Punto de entrada de la aplicación FastAPI para 'Análisis al Instante'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints

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

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "API funcionando correctamente",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/test")
async def test():
    return {
        "test": "exitoso",
        "message": "Endpoint de prueba funcionando"
    }

# Handler para Vercel (IMPORTANTE)
handler = app