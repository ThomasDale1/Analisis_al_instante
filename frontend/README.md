# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Análisis al Instante

## Configuración y Ejecución del Proyecto Localmente

### Requisitos
- Node.js (versión 16 o superior)
- npm (gestor de paquetes incluido con Node.js)
- Python (versión 3.9 o superior)

### Pasos para Configurar el Proyecto
1. Clona el repositorio:
   ```bash
   git clone <URL-del-repositorio>
   ```
2. Navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Navega a la carpeta del backend:
   ```bash
   cd ../backend
   ```
6. Instala las dependencias de Python:
   ```bash
   pip install -r requirements.txt
   ```
7. Inicia el servidor de desarrollo del backend:
   ```bash
   uvicorn app.main:app --reload
   ```
8. Accede al proyecto en tu navegador en `http://localhost:3000` para el frontend y `http://localhost:8000` para el backend.

## Decisiones Técnicas

### Librerías y Frameworks
- **Frontend**:
  - React: Framework principal para la construcción de interfaces de usuario.
  - Material-UI: Biblioteca de componentes para estilizar y estructurar la interfaz.
  - Recharts: Utilizado para la visualización de datos mediante gráficos interactivos.
  - Vite: Herramienta de desarrollo rápida para proyectos de frontend.

- **Backend**:
  - FastAPI: Framework para construir APIs rápidas y eficientes.
  - Pydantic: Validación de datos y creación de esquemas.
  - Uvicorn: Servidor ASGI para ejecutar la aplicación FastAPI.

### Decisiones de Arquitectura
- Separación de frontend y backend para facilitar el desarrollo y mantenimiento.
- Uso de componentes reutilizables en React para mejorar la modularidad.
- Implementación de gráficos interactivos para una mejor experiencia de usuario.

## Enfoque para la Ingeniería de Prompts para la IA

### Estrategia

1. **Estructura Clara y Validaciones**:
   - Los prompts se diseñaron con reglas estrictas para garantizar respuestas consistentes y útiles.
   - Ejemplo de estructura JSON obligatoria:
     ```json
     {
       "title": "Título Específico del Gráfico",
       "chart_type": "bar",  // SOLO: bar, pie, donut, scatter, line, area
       "parameters": {
         "x_axis": "nombre_columna_exacto",      // Columna del eje X
         "y_axis": "nombre_columna_exacto",      // Columna del eje Y (o null para count)
         "agg_func": "mean"                       // SOLO: mean, sum, count, max, min
       },
       "insight": "Descripción del propósito del gráfico (NO conclusiones)"
     }
     ```

2. **Reglas Críticas**:
   - Validaciones estrictas para evitar errores comunes, como usar nombres de columnas inexistentes o funciones de agregación no permitidas.
   - Ejemplo:
     - ❌ PROHIBIDO: "y_axis": "mean"  // "mean" NO es una columna
     - ✅ CORRECTO: "y_axis": "payment_value", "agg_func": "mean"

3. **Diversidad y Cobertura**:
   - Generar exactamente 5 gráficos únicos con tipos diferentes (bar, pie/donut, scatter, line/area).
   - Evitar repetir columnas como eje principal y garantizar diversidad en el análisis.

4. **Guía Completa por Tipo de Gráfico**:
   - Se proporcionaron instrucciones detalladas para cada tipo de gráfico, incluyendo cuándo usarlo, parámetros requeridos y ejemplos.
   - Ejemplo para gráficos de barras:
     ```json
     {
       "title": "Valor Total de Pagos por Tipo",
       "chart_type": "bar",
       "parameters": {
         "x_axis": "payment_type",
         "y_axis": "payment_value",
         "agg_func": "sum"
       },
       "insight": "Compara el volumen de ingresos por método de pago para identificar preferencias de los clientes y optimizar opciones de pago disponibles."
     }
     ```

5. **Validaciones Antes de Responder**:
   - Los prompts incluyeron listas de verificación para garantizar que las respuestas cumplieran con las reglas establecidas.
   - Ejemplo de validaciones:
     - [ ] ¿Usé SOLO columnas de esta lista?
     - [ ] ¿Cada y_axis es una COLUMNA REAL (no "mean" o "sum")?
     - [ ] ¿Los 5 gráficos usan columnas X DIFERENTES?

Este enfoque estructurado permitió maximizar la utilidad de la IA en la generación de gráficos y análisis de datos, asegurando resultados consistentes, relevantes y alineados con los objetivos del proyecto.
