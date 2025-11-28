# 🏗️ Arquitectura del Proyecto Reni

## 📐 Visión General

Reni es un sistema modular de corrección de ejercicios físicos usando IA y visión por computadora. El proyecto está dividido en componentes independientes que funcionan juntos pero pueden operar por separado.

```
┌─────────────────────────────────────────────────────────────┐
│                     RENI ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Camera     │  │   Exercise   │  │    Stats     │       │
│  │   Capture    │  │   Selector   │  │    Panel     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                     ┌──────▼───────┐                         │
│                     │   App.js     │                         │
│                     │ (Orquestador)│                         │
│                     └──────┬───────┘                         │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   AI MODELS     │
                    │  (Independientes)│
                    └────────┬────────┘
              ┌──────────────┼──────────────┐
              │              │              │
      ┌───────▼───────┐ ┌───▼────┐ ┌──────▼──────┐
      │ Pose Detection│ │Person  │ │  Exercise   │
      │   (TF.js)     │ │Segment │ │  Analyzer   │
      └───────────────┘ └────────┘ └──────┬──────┘
                                           │
┌──────────────────────────────────────────┼──────────────────┐
│                    BACKEND (Express)     │                   │
│                  ┌───────────────────────▼────────┐          │
│                  │   API Server (Node.js)         │          │
│                  │                                 │          │
│                  │  ┌────────────────────────┐    │          │
│                  │  │  /api/analyze          │    │          │
│                  │  │  (OpenAI Integration)  │    │          │
│                  │  └────────────────────────┘    │          │
│                  │                                 │          │
│                  │  ┌────────────────────────┐    │          │
│                  │  │  Fallback Generator    │    │          │
│                  │  │  (Works without API)   │    │          │
│                  │  └────────────────────────┘    │          │
│                  └─────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   OpenAI API    │
                    │   (Opcional)    │
                    └─────────────────┘
```

## 🎯 Componentes Principales

### 1. Frontend (React)

**Ubicación**: `/frontend`

**Responsabilidades**:
- Interfaz de usuario
- Captura de video de la cámara
- Orquestación de modelos de IA
- Visualización de resultados en tiempo real
- Comunicación con backend

**Componentes clave**:
- `App.js`: Orquestador principal
- `VideoCapture.js`: Captura y procesamiento de video
- `ExerciseSelector.js`: Selección de ejercicios
- `StatsPanel.js`: Estadísticas en tiempo real
- `ResultsPanel.js`: Resultados finales

**Flujo de datos**:
```
Camera → VideoCapture → AI Models → Stats Update → UI
                                   ↓
                              Analysis Complete
                                   ↓
                            Backend (OpenAI) → Results
```

### 2. AI Models (Módulos Independientes)

**Ubicación**: `/ai-models`

**Características**:
- ✅ Funcionan independientemente
- ✅ No requieren backend
- ✅ Pueden usarse en otros proyectos
- ✅ Exportan clases reutilizables

#### 2.1 Pose Detection (`pose-detection.js`)

**Tecnología**: TensorFlow.js + MoveNet

**Funcionalidad**:
- Detecta 17 puntos clave del cuerpo humano
- Calcula ángulos entre articulaciones
- Dibuja esqueleto en canvas
- ~30 FPS en hardware moderno

**API**:
```javascript
const detector = new PoseDetector();
await detector.initialize();
const poses = await detector.detectPose(videoElement);
```

#### 2.2 Person Segmentation (`person-segmentation.js`)

**Tecnología**: MediaPipe Selfie Segmentation / BodyPix

**Funcionalidad**:
- Separa persona del fondo
- Genera máscara de segmentación
- Efectos: blur, pixelate, extract
- Calcula % de persona en frame

**API**:
```javascript
const segmenter = new PersonSegmenter();
await segmenter.initialize();
const segmentation = await segmenter.segment(videoElement);
```

#### 2.3 Exercise Analyzer (`exercise-analyzer.js`)

**Tecnología**: Algoritmos personalizados

**Funcionalidad**:
- Analiza 4 ejercicios: squat, pushup, plank, deadlift
- Detecta repeticiones automáticamente
- Calcula calidad de forma (0-100)
- Identifica errores comunes
- Prepara datos para OpenAI

**API**:
```javascript
const analyzer = new ExerciseAnalyzer();
analyzer.startExercise('squat');
const frameData = analyzer.analyzeFrame(poses);
const report = analyzer.finishExercise();
```

### 3. Backend (Express API)

**Ubicación**: `/backend`

**Responsabilidades**:
- Recibir datos de análisis del frontend
- Integrar con OpenAI API
- Generar feedback personalizado
- Fallback sin OpenAI
- (Futuro) Persistencia de datos

**Endpoints**:

```
GET  /api/health
     → Estado del servidor y configuración OpenAI

POST /api/analyze
     Body: { prompt, metadata }
     → Genera feedback con IA

POST /api/save-session (futuro)
     → Guardar historial de sesiones

GET  /api/history/:userId (futuro)
     → Obtener historial
```

**Flujo de análisis**:
```
Frontend → POST /api/analyze → OpenAI API
                              ↓
                        AI Feedback
                              ↓
                    Frontend (Muestra al usuario)
```

**Manejo graceful de errores**:
- Si OpenAI falla → feedback genérico
- Si backend no disponible → solo análisis local
- App siempre funcional

## 🔄 Flujo Completo de Uso

```
1. Usuario abre aplicación
   ↓
2. Frontend solicita acceso a cámara
   ↓
3. Se cargan modelos de IA (pose + segmentation)
   ↓
4. Usuario selecciona ejercicio
   ↓
5. Usuario inicia grabación
   ↓
6. Loop en tiempo real:
   - Capturar frame de video
   - Detectar pose (esqueleto)
   - (Opcional) Segmentar persona
   - Analizar ejercicio
   - Calcular métricas
   - Actualizar UI
   ↓
7. Usuario detiene grabación
   ↓
8. Generar reporte local
   ↓
9. Enviar a backend para feedback IA
   ↓
10. Mostrar resultados completos
```

## 💾 Estructura de Datos

### Pose Data
```javascript
{
  keypoints: [
    { name: 'nose', x: 320, y: 240, score: 0.95 },
    { name: 'left_shoulder', x: 280, y: 300, score: 0.89 },
    // ... 17 keypoints total
  ]
}
```

### Frame Analysis
```javascript
{
  frameNumber: 42,
  timestamp: 1700000000000,
  angles: {
    knee: 87.5,
    hip: 92.3,
    ankle: 73.1
  },
  deviations: {
    knee_status: 'correcto',
    hip_status: 'fuera_de_rango'
  },
  formScore: 78.2,
  phase: 'descending',
  repetitions: 5
}
```

### Final Report
```javascript
{
  exercise: 'Sentadillas',
  exerciseType: 'squat',
  repetitions: 12,
  averageFormScore: 82.5,
  totalFrames: 360,
  commonErrors: [
    {
      angle: 'knee',
      frequency: '35.2%',
      description: 'Rodillas no alcanzan el ángulo adecuado'
    }
  ],
  aiFeedback: '¡Gran trabajo! Tu técnica...',
  timestamp: '2024-11-24T10:30:00.000Z'
}
```

## 🔌 Independencia de Módulos

### Diseño Modular

Cada módulo puede funcionar sin los otros:

**Pose Detection** ← No depende de nada
```javascript
// Puede usarse solo para detectar poses
import { PoseDetector } from './ai-models/pose-detection.js';
```

**Person Segmentation** ← No depende de nada
```javascript
// Puede usarse solo para segmentar personas
import { PersonSegmenter } from './ai-models/person-segmentation.js';
```

**Exercise Analyzer** ← Depende solo de estructura de poses
```javascript
// Puede usarse con cualquier sistema de detección de poses
import { ExerciseAnalyzer } from './ai-models/exercise-analyzer.js';
```

**Backend** ← Funciona independiente del frontend
```bash
# Puede recibir datos de cualquier cliente
curl -X POST http://localhost:3001/api/analyze
```

## 🛡️ Manejo de Errores

### Frontend
- ❌ Cámara no disponible → Mensaje de error, UI permanece funcional
- ❌ Modelos no cargan → Advertencia, permite continuar sin IA
- ❌ Backend no responde → Análisis local funciona

### AI Models
- ❌ Modelo no inicializado → Retorna null, no crash
- ❌ No detecta persona → Retorna array vacío
- ❌ Frame inválido → Skip frame, continúa

### Backend
- ❌ OpenAI falla → Usa feedback genérico
- ❌ API key inválida → Advertencia, feedback genérico
- ❌ Rate limit → Retry con backoff

## 🚀 Escalabilidad

### Mejoras Futuras

**Base de Datos**:
```
MongoDB/PostgreSQL para:
- Guardar sesiones de usuario
- Historial de progreso
- Análisis comparativo
```

**Nuevos Ejercicios**:
```javascript
// Fácil de agregar en exercise-analyzer.js
exerciseDefinitions.lunges = { ... }
```

**Análisis Avanzado**:
```
- Velocidad de ejecución
- Simetría izquierda/derecha
- Comparación con atletas profesionales
- Detección de fatiga
```

**Características Sociales**:
```
- Competencias con amigos
- Tablas de clasificación
- Compartir logros
```

## 🔐 Seguridad

- ✅ Video nunca se envía al backend
- ✅ Solo métricas numéricas se transmiten
- ✅ API key en .env (no en código)
- ✅ CORS configurado
- ✅ Validación de inputs

## 📊 Performance

**Frontend**:
- Pose Detection: ~30 FPS
- Canvas Rendering: 60 FPS
- Memory: ~200-300 MB

**Backend**:
- OpenAI Response: ~2-5 segundos
- Fallback: <100 ms

**Optimizaciones**:
- Modelos cargados una vez
- Canvas reutilizado
- Datos comprimidos para backend

---

**Conclusión**: Arquitectura modular, escalable y resiliente que garantiza funcionamiento incluso si componentes fallan.
