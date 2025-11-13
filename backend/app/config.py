# config.py
# Configuración centralizada de la aplicación: rutas, claves, env, etc.
import os
from dotenv import load_dotenv

# Cargar variables desde .env (si existe)
load_dotenv()

# Rutas y configuración básica
data_folder = os.environ.get("DATA_FOLDER", "./data")

# Claves de API para servicios externos (ejemplo OpenAI)
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

# Ajusta/expande según se requiera
