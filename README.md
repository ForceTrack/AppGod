# 🏋️ Reni - Sistema de Corrección de Ejercicios con IA

Sistema inteligente de corrección de ejercicios físicos usando visión por computadora y modelos de IA.

> ⚡ **Proyecto Modular**: Cada componente funciona independientemente pero están perfectamente integrados

## 📁 Estructura del Proyecto

```
Reni/
├── frontend/           # Aplicación web (React)
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   └── styles/        # Estilos CSS
│   └── public/
├── ai-models/         # Modelos de IA independientes
│   ├── pose-detection.js     # Detección de esqueleto humano
│   ├── person-segmentation.js # Segmentación de personas
│   └── exercise-analyzer.js   # Análisis de ejercicios
├── backend/           # Servidor API
│   └── server.js      # API para OpenAI y procesamiento
└── README.md
```

## 🚀 Características

- **Detección de Pose en Tiempo Real**: Identifica el esqueleto humano con puntos clave
- **Segmentación de Personas**: Separa a la persona del fondo
- **Análisis de Ejercicios**: Compara movimientos con ejercicios correctos
- **Retroalimentación con IA**: Genera informes personalizados usando OpenAI

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
cd Reni
```

### 2. Instalar dependencias del Frontend
```bash
cd frontend
npm install
```

### 3. Instalar dependencias del Backend
```bash
cd ../backend
npm install
```

### 4. Configurar variables de entorno
Crea un archivo `.env` en la carpeta `backend`:
```
OPENAI_API_KEY=tu_clave_api_aqui
PORT=3001
```

## 📦 Dependencias Principales

### Frontend
- React
- TensorFlow.js
- @tensorflow-models/pose-detection
- @tensorflow-models/body-segmentation
- @mediapipe/tasks-vision

### Backend
- Express.js
- OpenAI API
- CORS

## 🎯 Uso

### Iniciar el Backend
```bash
cd backend
npm start
```

### Iniciar el Frontend
```bash
cd frontend
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🧩 Módulos Independientes

Cada módulo de IA puede funcionar de forma independiente:

### 1. Detección de Pose (`ai-models/pose-detection.js`)
```javascript
import { PoseDetector } from './ai-models/pose-detection.js';
const detector = new PoseDetector();
await detector.initialize();
const poses = await detector.detectPose(videoElement);
```

### 2. Segmentación de Personas (`ai-models/person-segmentation.js`)
```javascript
import { PersonSegmenter } from './ai-models/person-segmentation.js';
const segmenter = new PersonSegmenter();
await segmenter.initialize();
const mask = await segmenter.segment(videoElement);
```

### 3. Analizador de Ejercicios (`ai-models/exercise-analyzer.js`)
```javascript
import { ExerciseAnalyzer } from './ai-models/exercise-analyzer.js';
const analyzer = new ExerciseAnalyzer();
const metrics = analyzer.analyzeExercise('squat', poses);
```

## 🔧 Manejo de Errores

El sistema está diseñado para funcionar de forma degradada:
- Si un modelo no está cargado, se muestra un mensaje informativo
- La interfaz permanece funcional incluso sin los modelos de IA
- Cada componente valida su estado antes de ejecutarse

## 📝 Ejercicios Disponibles

- Sentadillas (Squats)
- Flexiones (Push-ups)
- Planchas (Planks)
- Peso Muerto (Deadlifts)
- Más por venir...

## 🤝 Contribuir

Este es un proyecto en desarrollo. Cada módulo puede mejorarse independientemente.

## � Documentación Adicional

- **[QUICKSTART.md](./QUICKSTART.md)**: Guía de inicio rápido (5 minutos)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Arquitectura detallada del sistema
- **[EXAMPLES.md](./EXAMPLES.md)**: Ejemplos de uso independiente de cada módulo
- **[ai-models/README.md](./ai-models/README.md)**: Documentación de módulos de IA

## 🎬 Inicio Rápido con Script

```bash
# Ejecutar el script de inicio automático
./start.sh
```

El script te permite:
- Iniciar frontend + backend juntos
- Iniciar solo frontend
- Iniciar solo backend
- Instalación automática de dependencias

## �📄 Licencia

MIT License
# AppGod
