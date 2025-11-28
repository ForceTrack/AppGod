# 🎯 Módulos Independientes de IA

Esta carpeta contiene los módulos de inteligencia artificial que funcionan de manera independiente.

## 📦 Módulos Disponibles

### 1. pose-detection.js
**Detección de Pose y Esqueleto Humano**

Detecta personas y crea su esqueleto en tiempo real usando TensorFlow.js y MoveNet.

**Características:**
- Detección de 17 puntos clave del cuerpo
- Cálculo de ángulos entre articulaciones
- Dibujo de esqueleto en canvas
- Funciona en tiempo real con alta precisión

**Uso independiente:**
```javascript
import { PoseDetector } from './pose-detection.js';

const detector = new PoseDetector();
await detector.initialize();

// En cada frame de video
const poses = await detector.detectPose(videoElement);
detector.drawSkeleton(poses, canvasContext);
```

---

### 2. person-segmentation.js
**Segmentación de Personas del Fondo**

Separa a las personas de todo el espacio y objetos que no sean la propia persona.

**Características:**
- Segmentación precisa persona vs fondo
- Múltiples efectos: máscara, blur, extracción
- Compatible con MediaPipe y BodyPix
- Cálculo de porcentaje de persona en frame

**Uso independiente:**
```javascript
import { PersonSegmenter } from './person-segmentation.js';

const segmenter = new PersonSegmenter();
await segmenter.initialize();

// Segmentar persona
const segmentation = await segmenter.segment(videoElement);

// Extraer solo la persona
await segmenter.extractPerson(videoElement, outputCanvas);
```

---

### 3. exercise-analyzer.js
**Análisis de Ejercicios en Tiempo Real**

Compara ejercicios en tiempo real, calcula métricas y prepara datos para análisis con IA.

**Características:**
- Análisis de 4 ejercicios: sentadillas, flexiones, plancha, peso muerto
- Detección automática de repeticiones
- Cálculo de ángulos y desviaciones
- Identificación de errores comunes
- Puntuación de calidad de forma (0-100)

**Uso independiente:**
```javascript
import { ExerciseAnalyzer } from './exercise-analyzer.js';

const analyzer = new ExerciseAnalyzer();

// Iniciar análisis
analyzer.startExercise('squat');

// Analizar cada frame
const frameData = analyzer.analyzeFrame(poses);
console.log(`Repeticiones: ${frameData.repetitions}`);
console.log(`Forma: ${frameData.formScore}/100`);

// Finalizar y obtener reporte
const report = analyzer.finishExercise();
```

---

## 🔧 Requisitos

Estos módulos requieren las siguientes dependencias en el frontend:

```bash
npm install @tensorflow/tfjs @tensorflow-models/pose-detection @tensorflow-models/body-segmentation
```

## 🎮 Integración

Los módulos están diseñados para integrarse fácilmente con cualquier aplicación web, pero también pueden funcionar de forma completamente independiente para testing o desarrollo.

## 📊 Datos Generados

Cada módulo genera datos estructurados:

- **PoseDetector**: Array de keypoints con coordenadas x, y y confianza
- **PersonSegmenter**: Máscara de segmentación y métricas
- **ExerciseAnalyzer**: Métricas detalladas, errores, reporte completo

## 🚀 Ventajas del Diseño Modular

1. **Independencia**: Cada módulo puede probarse y desarrollarse por separado
2. **Reutilización**: Usa los módulos en diferentes proyectos
3. **Mantenibilidad**: Actualiza un módulo sin afectar los demás
4. **Escalabilidad**: Agrega nuevos módulos fácilmente
5. **Testing**: Prueba cada módulo de forma aislada

## 📝 Agregar Nuevos Ejercicios

Para agregar un nuevo ejercicio al analyzer:

1. Define los ángulos clave en `exerciseDefinitions`
2. Especifica los keypoints para cada ángulo
3. Define las fases del ejercicio
4. Agrega descripciones de errores

```javascript
exerciseDefinitions.newExercise = {
  name: 'Nuevo Ejercicio',
  keyAngles: { /* ángulos */ },
  keypoints: { /* keypoints */ },
  phases: ['fase1', 'fase2']
};
```

## 🤝 Contribuciones

Cada módulo puede mejorarse independientemente. Algunas ideas:

- Agregar más ejercicios al analyzer
- Mejorar la precisión de detección
- Optimizar el rendimiento
- Agregar más efectos de segmentación
- Implementar análisis de velocidad

---

**Nota**: Estos módulos están optimizados para navegadores modernos y requieren acceso a la cámara web.
