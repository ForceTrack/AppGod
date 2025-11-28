# 💡 Consejos y Mejores Prácticas

## 🎯 Desarrollo

### Para desarrollar nuevos ejercicios:

1. **Define el ejercicio en `exercise-analyzer.js`**:
```javascript
exerciseDefinitions.newExercise = {
  name: 'Nombre del Ejercicio',
  keyAngles: {
    joint1: { min: 70, max: 110, ideal: 90 },
    // ... más ángulos
  },
  keypoints: {
    joint1: ['keypoint1', 'keypoint2', 'keypoint3']
  },
  phases: ['fase1', 'fase2', 'fase3']
};
```

2. **Agrega el ejercicio al selector**:
Edita `frontend/src/components/ExerciseSelector.js`

3. **Define descripciones de errores**:
Actualiza `getErrorDescription()` en `exercise-analyzer.js`

### Para optimizar rendimiento:

**Reducir FPS de detección**:
```javascript
// En VideoCapture.js, agregar throttle
let lastDetectionTime = 0;
const DETECTION_INTERVAL = 100; // ms (10 FPS)

if (Date.now() - lastDetectionTime > DETECTION_INTERVAL) {
  const poses = await detector.detectPose(video);
  lastDetectionTime = Date.now();
}
```

**Usar modelo más ligero**:
```javascript
// En pose-detection.js
const detectorConfig = {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING, // Más rápido
  // vs
  // modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER, // Más preciso pero lento
};
```

## 🔐 Seguridad

### Proteger API Keys:

1. **Nunca comitees `.env`** al repositorio
2. **Usa variables de entorno** en producción
3. **Implementa rate limiting** en el backend

```javascript
// Agregar a server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de requests
});

app.use('/api/', limiter);
```

### Validación de inputs:

```javascript
// Agregar validación en server.js
app.post('/api/analyze', (req, res, next) => {
  const { prompt, metadata } = req.body;
  
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt inválido' });
  }
  
  if (prompt.length > 5000) {
    return res.status(400).json({ error: 'Prompt demasiado largo' });
  }
  
  next();
});
```

## 🚀 Producción

### Preparar para producción:

1. **Build del frontend**:
```bash
cd frontend
npm run build
```

2. **Servir build estático**:
```javascript
// En backend/server.js
const path = require('path');

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

3. **Variables de entorno en producción**:
```bash
# Heroku
heroku config:set OPENAI_API_KEY=tu_clave

# Vercel
vercel env add OPENAI_API_KEY
```

### HTTPS para cámara en móvil:

La API de getUserMedia requiere HTTPS en producción:

**Opción 1: Netlify/Vercel** (HTTPS automático)

**Opción 2: Nginx con Let's Encrypt**
```nginx
server {
    listen 443 ssl;
    server_name tu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

## 📊 Monitoreo

### Agregar logging:

```javascript
// backend/server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.post('/api/analyze', async (req, res) => {
  logger.info('Análisis solicitado', { 
    exercise: req.body.metadata?.exercise,
    timestamp: new Date()
  });
  // ... resto del código
});
```

### Métricas de uso:

```javascript
// Tracking simple de métricas
let metrics = {
  totalAnalyses: 0,
  byExercise: {},
  averageResponseTime: []
};

app.post('/api/analyze', async (req, res) => {
  const startTime = Date.now();
  
  // ... procesamiento
  
  const responseTime = Date.now() - startTime;
  metrics.totalAnalyses++;
  metrics.averageResponseTime.push(responseTime);
  
  const exercise = req.body.metadata?.exercise;
  metrics.byExercise[exercise] = (metrics.byExercise[exercise] || 0) + 1;
});

// Endpoint para ver métricas
app.get('/api/metrics', (req, res) => {
  const avgTime = metrics.averageResponseTime.reduce((a, b) => a + b, 0) / 
                  metrics.averageResponseTime.length;
  
  res.json({
    totalAnalyses: metrics.totalAnalyses,
    averageResponseTime: avgTime.toFixed(2) + 'ms',
    byExercise: metrics.byExercise
  });
});
```

## 🧪 Testing

### Tests para módulos de IA:

```javascript
// test/pose-detection.test.js
import { PoseDetector } from '../ai-models/pose-detection.js';

describe('PoseDetector', () => {
  let detector;
  
  beforeAll(async () => {
    detector = new PoseDetector();
    await detector.initialize();
  });
  
  test('debe inicializar correctamente', () => {
    expect(detector.isReady()).toBe(true);
  });
  
  test('debe calcular ángulos correctamente', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 100, y: 0 };
    const p3 = { x: 100, y: 100 };
    
    const angle = detector.calculateAngle(p1, p2, p3);
    expect(angle).toBeCloseTo(90, 0);
  });
  
  afterAll(() => {
    detector.dispose();
  });
});
```

### Tests del backend:

```javascript
// test/api.test.js
const request = require('supertest');
const app = require('../backend/server');

describe('API Tests', () => {
  test('GET /api/health debe retornar status ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
  
  test('POST /api/analyze debe procesar correctamente', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({
        prompt: 'Test prompt',
        metadata: { exercise: 'squat', repetitions: 10 }
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('feedback');
  });
});
```

## 💾 Persistencia de Datos

### Agregar MongoDB:

```javascript
// backend/database.js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

const SessionSchema = new mongoose.Schema({
  userId: String,
  exercise: String,
  repetitions: Number,
  averageScore: Number,
  timestamp: { type: Date, default: Date.now },
  detailedData: Object
});

const Session = mongoose.model('Session', SessionSchema);

// Guardar sesión
app.post('/api/save-session', async (req, res) => {
  const session = new Session(req.body);
  await session.save();
  res.json({ success: true, id: session._id });
});

// Obtener historial
app.get('/api/history/:userId', async (req, res) => {
  const sessions = await Session.find({ 
    userId: req.params.userId 
  }).sort({ timestamp: -1 });
  
  res.json({ sessions });
});
```

## 🎨 Personalización UI

### Temas oscuro/claro:

```css
/* App.css */
:root {
  --bg-primary: #1a1a1a;
  --bg-secondary: rgba(255, 255, 255, 0.1);
  --text-primary: #ffffff;
  --accent: #4ade80;
}

[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: rgba(0, 0, 0, 0.1);
  --text-primary: #000000;
  --accent: #22c55e;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

```javascript
// App.js
const [theme, setTheme] = useState('dark');

useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);

// Botón para cambiar tema
<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  {theme === 'dark' ? '☀️' : '🌙'}
</button>
```

## 📱 PWA (Progressive Web App)

### Convertir a PWA:

1. **Crear manifest.json**:
```json
{
  "name": "Reni - Entrenador Personal IA",
  "short_name": "Reni",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#4ade80",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. **Service Worker básico**:
```javascript
// public/service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('reni-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/static/css/main.css',
        '/static/js/main.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

## 🐛 Debugging

### Console logging estructurado:

```javascript
// utils/logger.js
export const logger = {
  pose: (msg, data) => console.log(`[POSE] ${msg}`, data),
  segment: (msg, data) => console.log(`[SEGMENT] ${msg}`, data),
  analyzer: (msg, data) => console.log(`[ANALYZER] ${msg}`, data),
  error: (msg, error) => console.error(`[ERROR] ${msg}`, error)
};

// Uso
import { logger } from './utils/logger';

logger.pose('Detectadas poses', poses.length);
logger.error('Fallo en detección', error);
```

### Performance monitoring:

```javascript
// Medir FPS
let lastTime = Date.now();
let frames = 0;

function measureFPS() {
  frames++;
  const now = Date.now();
  
  if (now - lastTime >= 1000) {
    const fps = frames;
    console.log(`FPS: ${fps}`);
    frames = 0;
    lastTime = now;
  }
  
  requestAnimationFrame(measureFPS);
}
```

## 🌐 Internacionalización

### Agregar múltiples idiomas:

```javascript
// i18n.js
const translations = {
  es: {
    startExercise: 'Iniciar Ejercicio',
    stopExercise: 'Detener',
    repetitions: 'Repeticiones',
    quality: 'Calidad'
  },
  en: {
    startExercise: 'Start Exercise',
    stopExercise: 'Stop',
    repetitions: 'Repetitions',
    quality: 'Quality'
  }
};

export const t = (key, lang = 'es') => translations[lang][key] || key;
```

## 🎓 Recursos de Aprendizaje

- [TensorFlow.js Tutorials](https://www.tensorflow.org/js/tutorials)
- [MediaPipe Pose](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
- [React Best Practices](https://react.dev/learn)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 💬 Comunidad

- Reporta bugs como issues en GitHub
- Comparte mejoras con Pull Requests
- Documenta nuevos ejercicios
- Ayuda a otros usuarios

---

**¡Happy Coding!** 🚀
