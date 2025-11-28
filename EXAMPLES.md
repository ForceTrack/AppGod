# 💡 Ejemplos de Uso Independiente

Esta guía muestra cómo usar cada módulo de IA de forma independiente, sin necesidad del sistema completo.

## 🎯 Módulo 1: Pose Detection

### Ejemplo Básico: Detectar Pose en Imagen

```javascript
import { PoseDetector } from './ai-models/pose-detection.js';

// Inicializar
const detector = new PoseDetector();
await detector.initialize();

// Obtener elemento de imagen
const img = document.getElementById('myImage');

// Detectar poses
const poses = await detector.detectPose(img);

console.log(`Detectadas ${poses.length} personas`);
poses.forEach((pose, i) => {
  console.log(`Persona ${i + 1}:`);
  pose.keypoints.forEach(kp => {
    console.log(`  ${kp.name}: (${kp.x}, ${kp.y}) - confianza: ${kp.score}`);
  });
});
```

### Ejemplo: Calcular Ángulo de Codo

```javascript
const detector = new PoseDetector();
await detector.initialize();

const poses = await detector.detectPose(videoElement);
const pose = poses[0];

// Obtener keypoints específicos
const shoulder = detector.getKeypoint(pose, 'left_shoulder');
const elbow = detector.getKeypoint(pose, 'left_elbow');
const wrist = detector.getKeypoint(pose, 'left_wrist');

// Calcular ángulo
if (shoulder && elbow && wrist) {
  const angle = detector.calculateAngle(shoulder, elbow, wrist);
  console.log(`Ángulo del codo: ${angle.toFixed(2)}°`);
}
```

### Ejemplo: Dibujar Esqueleto en Canvas

```html
<video id="webcam" autoplay></video>
<canvas id="output"></canvas>

<script type="module">
  import { PoseDetector } from './ai-models/pose-detection.js';
  
  const video = document.getElementById('webcam');
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');
  
  // Inicializar cámara
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  
  // Inicializar detector
  const detector = new PoseDetector();
  await detector.initialize();
  
  // Loop de detección
  async function detectLoop() {
    // Ajustar canvas al video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar video
    ctx.drawImage(video, 0, 0);
    
    // Detectar y dibujar poses
    const poses = await detector.detectPose(video);
    detector.drawSkeleton(poses, ctx);
    
    requestAnimationFrame(detectLoop);
  }
  
  video.onloadedmetadata = () => {
    detectLoop();
  };
</script>
```

---

## 👤 Módulo 2: Person Segmentation

### Ejemplo Básico: Segmentar Persona

```javascript
import { PersonSegmenter } from './ai-models/person-segmentation.js';

// Inicializar
const segmenter = new PersonSegmenter();
await segmenter.initialize();

// Segmentar
const videoElement = document.getElementById('video');
const segmentation = await segmenter.segment(videoElement);

// Verificar si hay persona
const hasP person = segmenter.hasPersonInFrame(segmentation);
console.log(`¿Hay persona en el frame? ${hasPerson ? 'Sí' : 'No'}`);

// Calcular porcentaje
const percentage = segmenter.calculatePersonPercentage(segmentation);
console.log(`La persona ocupa ${percentage.toFixed(1)}% del frame`);
```

### Ejemplo: Extraer Persona (Fondo Transparente)

```html
<video id="webcam" autoplay></video>
<canvas id="output"></canvas>

<script type="module">
  import { PersonSegmenter } from './ai-models/person-segmentation.js';
  
  const video = document.getElementById('webcam');
  const canvas = document.getElementById('output');
  
  // Inicializar cámara
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  
  // Inicializar segmentador
  const segmenter = new PersonSegmenter();
  await segmenter.initialize();
  
  // Loop de segmentación
  async function segmentLoop() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Extraer persona (fondo transparente)
    await segmenter.extractPerson(video, canvas);
    
    requestAnimationFrame(segmentLoop);
  }
  
  video.onloadedmetadata = () => {
    segmentLoop();
  };
</script>
```

### Ejemplo: Aplicar Blur al Fondo

```javascript
const segmenter = new PersonSegmenter();
await segmenter.initialize();

const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

async function applyBlur() {
  const segmentation = await segmenter.segment(video);
  
  // Dibujar con blur en el fondo
  await segmenter.drawSegmentation(segmentation, ctx, canvas, 'blur');
  
  requestAnimationFrame(applyBlur);
}

applyBlur();
```

---

## 🏋️ Módulo 3: Exercise Analyzer

### Ejemplo Básico: Analizar Sentadillas

```javascript
import { PoseDetector } from './ai-models/pose-detection.js';
import { ExerciseAnalyzer } from './ai-models/exercise-analyzer.js';

// Inicializar
const poseDetector = new PoseDetector();
await poseDetector.initialize();

const analyzer = new ExerciseAnalyzer();

// Iniciar análisis de sentadillas
analyzer.startExercise('squat');

// En cada frame del video
async function analyzeFrame(videoElement) {
  // Detectar pose
  const poses = await poseDetector.detectPose(videoElement);
  
  if (poses && poses.length > 0) {
    // Analizar frame
    const frameData = analyzer.analyzeFrame(poses);
    
    console.log(`Repeticiones: ${frameData.repetitions}`);
    console.log(`Calidad: ${frameData.formScore}/100`);
    console.log(`Fase: ${frameData.phase}`);
    
    // Mostrar ángulos
    Object.entries(frameData.angles).forEach(([joint, angle]) => {
      console.log(`  ${joint}: ${angle.toFixed(2)}°`);
    });
  }
}

// Al finalizar
const report = analyzer.finishExercise();
console.log('Reporte final:', report);
```

### Ejemplo: Sistema de Contador de Flexiones

```html
<video id="webcam" autoplay></video>
<div id="counter">Repeticiones: 0</div>
<div id="quality">Calidad: 0/100</div>
<button id="start">Iniciar</button>
<button id="stop">Detener</button>

<script type="module">
  import { PoseDetector } from './ai-models/pose-detection.js';
  import { ExerciseAnalyzer } from './ai-models/exercise-analyzer.js';
  
  const video = document.getElementById('webcam');
  const counterDiv = document.getElementById('counter');
  const qualityDiv = document.getElementById('quality');
  
  let isAnalyzing = false;
  
  // Inicializar
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  
  const poseDetector = new PoseDetector();
  await poseDetector.initialize();
  
  const analyzer = new ExerciseAnalyzer();
  
  // Botón iniciar
  document.getElementById('start').onclick = () => {
    analyzer.startExercise('pushup');
    isAnalyzing = true;
    analyzeLoop();
  };
  
  // Botón detener
  document.getElementById('stop').onclick = () => {
    isAnalyzing = false;
    const report = analyzer.finishExercise();
    
    alert(`
      ¡Sesión completada!
      Repeticiones: ${report.repetitions}
      Calidad promedio: ${report.averageFormScore}/100
      Errores encontrados: ${report.commonErrors.length}
    `);
  };
  
  // Loop de análisis
  async function analyzeLoop() {
    if (!isAnalyzing) return;
    
    const poses = await poseDetector.detectPose(video);
    
    if (poses && poses.length > 0) {
      const frameData = analyzer.analyzeFrame(poses);
      
      if (frameData && !frameData.error) {
        counterDiv.textContent = `Repeticiones: ${frameData.repetitions}`;
        qualityDiv.textContent = `Calidad: ${frameData.formScore}/100`;
      }
    }
    
    requestAnimationFrame(analyzeLoop);
  }
</script>
```

### Ejemplo: Detector de Errores en Tiempo Real

```javascript
const poseDetector = new PoseDetector();
await poseDetector.initialize();

const analyzer = new ExerciseAnalyzer();
analyzer.startExercise('squat');

async function checkForm(videoElement) {
  const poses = await poseDetector.detectPose(videoElement);
  
  if (poses && poses.length > 0) {
    const frameData = analyzer.analyzeFrame(poses);
    
    // Verificar cada ángulo
    Object.entries(frameData.deviations).forEach(([key, value]) => {
      if (key.endsWith('_status') && value === 'fuera_de_rango') {
        const joint = key.replace('_status', '');
        console.warn(`⚠️ ERROR: ${joint} fuera de rango!`);
        
        // Aquí podrías mostrar una alerta visual
        showWarning(joint);
      }
    });
    
    // Calificación de calidad
    const quality = parseFloat(frameData.formScore);
    if (quality < 60) {
      console.warn('⚠️ Calidad baja - revisa tu forma');
    } else if (quality >= 80) {
      console.log('✅ Excelente forma!');
    }
  }
}
```

---

## 🔗 Módulo 4: Backend API (Uso Independiente)

### Ejemplo: Cliente Node.js

```javascript
const axios = require('axios');

// Función para obtener feedback de IA
async function getAIFeedback(exerciseData) {
  try {
    const response = await axios.post('http://localhost:3001/api/analyze', {
      prompt: `Analiza este rendimiento de ejercicio:
      
Ejercicio: ${exerciseData.exercise}
Repeticiones: ${exerciseData.repetitions}
Calidad promedio: ${exerciseData.averageScore}/100

Proporciona feedback constructivo.`,
      
      metadata: {
        exercise: exerciseData.exerciseType,
        repetitions: exerciseData.repetitions,
        averageScore: exerciseData.averageScore
      }
    });
    
    return response.data.feedback;
    
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Uso
const feedback = await getAIFeedback({
  exercise: 'Sentadillas',
  exerciseType: 'squat',
  repetitions: 15,
  averageScore: 82.5
});

console.log('Feedback de IA:', feedback);
```

### Ejemplo: Cliente Python

```python
import requests
import json

def get_ai_feedback(exercise_data):
    url = 'http://localhost:3001/api/analyze'
    
    payload = {
        'prompt': f"""Analiza este rendimiento de ejercicio:
        
Ejercicio: {exercise_data['exercise']}
Repeticiones: {exercise_data['repetitions']}
Calidad promedio: {exercise_data['average_score']}/100

Proporciona feedback constructivo.""",
        
        'metadata': {
            'exercise': exercise_data['exercise_type'],
            'repetitions': exercise_data['repetitions'],
            'averageScore': exercise_data['average_score']
        }
    }
    
    try:
        response = requests.post(url, json=payload)
        data = response.json()
        return data.get('feedback')
    except Exception as e:
        print(f'Error: {e}')
        return None

# Uso
feedback = get_ai_feedback({
    'exercise': 'Sentadillas',
    'exercise_type': 'squat',
    'repetitions': 15,
    'average_score': 82.5
})

print('Feedback de IA:', feedback)
```

### Ejemplo: Cliente cURL

```bash
# Verificar salud del servidor
curl http://localhost:3001/api/health

# Obtener análisis
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Analiza sentadillas: 15 reps, calidad 82/100",
    "metadata": {
      "exercise": "squat",
      "repetitions": 15,
      "averageScore": 82
    }
  }'
```

---

## 🎨 Ejemplo Completo: App Minimalista

Aquí está una aplicación completa en un solo archivo HTML:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #1a1a1a;
      color: white;
    }
    video, canvas {
      width: 100%;
      max-width: 640px;
      border: 2px solid #4ade80;
      border-radius: 10px;
    }
    button {
      padding: 10px 20px;
      margin: 10px;
      font-size: 16px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .start { background: #4ade80; }
    .stop { background: #ef4444; }
    #stats {
      background: rgba(255,255,255,0.1);
      padding: 20px;
      border-radius: 10px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>🏋️ Reni Mini - Contador de Ejercicios</h1>
  
  <div>
    <select id="exercise">
      <option value="squat">Sentadillas</option>
      <option value="pushup">Flexiones</option>
      <option value="plank">Plancha</option>
    </select>
    
    <button class="start" onclick="start()">Iniciar</button>
    <button class="stop" onclick="stop()">Detener</button>
  </div>
  
  <video id="video" autoplay></video>
  <canvas id="canvas"></canvas>
  
  <div id="stats">
    <h3>Estadísticas</h3>
    <p>Repeticiones: <strong id="reps">0</strong></p>
    <p>Calidad: <strong id="quality">0</strong>/100</p>
    <p>Fase: <strong id="phase">-</strong></p>
  </div>
  
  <script type="module">
    // Importar módulos (ajusta las rutas según tu estructura)
    import { PoseDetector } from './ai-models/pose-detection.js';
    import { ExerciseAnalyzer } from './ai-models/exercise-analyzer.js';
    
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    let detector, analyzer;
    let isRunning = false;
    
    // Inicializar
    async function init() {
      // Cámara
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      
      // Modelos
      detector = new PoseDetector();
      await detector.initialize();
      
      analyzer = new ExerciseAnalyzer();
      
      console.log('✅ Listo para empezar');
    }
    
    // Iniciar análisis
    window.start = () => {
      const exercise = document.getElementById('exercise').value;
      analyzer.startExercise(exercise);
      isRunning = true;
      loop();
    };
    
    // Detener análisis
    window.stop = () => {
      isRunning = false;
      const report = analyzer.finishExercise();
      alert(`Completado!\nReps: ${report.repetitions}\nCalidad: ${report.averageFormScore}`);
    };
    
    // Loop principal
    async function loop() {
      if (!isRunning) return;
      
      // Ajustar canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Dibujar video
      ctx.drawImage(video, 0, 0);
      
      // Detectar pose
      const poses = await detector.detectPose(video);
      
      if (poses && poses.length > 0) {
        // Dibujar esqueleto
        detector.drawSkeleton(poses, ctx);
        
        // Analizar
        const data = analyzer.analyzeFrame(poses);
        
        if (data && !data.error) {
          document.getElementById('reps').textContent = data.repetitions;
          document.getElementById('quality').textContent = data.formScore;
          document.getElementById('phase').textContent = data.phase;
        }
      }
      
      requestAnimationFrame(loop);
    }
    
    // Inicializar al cargar
    init();
  </script>
</body>
</html>
```

---

## 📝 Notas Importantes

1. **Imports**: Asegúrate de ajustar las rutas de importación según tu estructura de carpetas

2. **CORS**: Si usas los módulos desde diferentes dominios, configura CORS apropiadamente

3. **Rendimiento**: En producción, considera:
   - Reducir FPS si es necesario
   - Usar Web Workers para procesamiento
   - Implementar throttling

4. **Compatibilidad**: Los módulos requieren:
   - Navegador moderno (Chrome, Firefox, Safari, Edge)
   - Soporte para ES6 modules
   - WebGL para TensorFlow.js

---

¡Experimenta con estos ejemplos y adapta los módulos a tus necesidades! 🚀
