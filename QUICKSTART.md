# 🚀 Guía de Inicio Rápido

Esta guía te ayudará a poner en marcha Reni en menos de 5 minutos.

## ✅ Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Cámara web
- (Opcional) Cuenta de OpenAI para feedback con IA

## 📦 Paso 1: Instalación

Las dependencias ya están instaladas. Si necesitas reinstalarlas:

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

## 🔑 Paso 2: Configurar OpenAI (Opcional)

Si quieres feedback generado por IA:

1. Copia el archivo de ejemplo:
```bash
cd backend
cp .env.example .env
```

2. Edita `.env` y agrega tu API key:
```
OPENAI_API_KEY=sk-tu_clave_aqui
```

3. Obtén tu API key en: https://platform.openai.com/api-keys

**Nota**: Si no configuras OpenAI, la app seguirá funcionando con feedback genérico.

## 🚀 Paso 3: Iniciar el Proyecto

### Opción A: Dos terminales

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Opción B: Modo desarrollo con nodemon

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev  # Reinicia automáticamente al cambiar código
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## 🎯 Paso 4: Usar la Aplicación

1. El frontend se abrirá automáticamente en `http://localhost:3000`
2. Permite acceso a la cámara cuando el navegador lo pida
3. Espera a que los modelos de IA se carguen (indicador en pantalla)
4. Selecciona un ejercicio (Sentadillas, Flexiones, Plancha, Peso Muerto)
5. Haz clic en "▶️ Iniciar Ejercicio"
6. ¡Realiza tu ejercicio!
7. Haz clic en "⏹️ Detener y Analizar"
8. Revisa tu puntuación y feedback

## 🔍 Verificar que Todo Funciona

### Backend:
Abre `http://localhost:3001/api/health` en tu navegador.

Deberías ver:
```json
{
  "status": "ok",
  "message": "Backend de Reni funcionando",
  "openaiConfigured": true
}
```

### Frontend:
Ve a `http://localhost:3000` - Deberías ver la interfaz de Reni.

## 🐛 Solución de Problemas Comunes

### La cámara no funciona
- Verifica los permisos del navegador
- Asegúrate de usar HTTPS o localhost
- Prueba con otro navegador

### Los modelos no cargan
- Verifica tu conexión a internet (necesita descargar modelos)
- Espera un poco más, la primera carga puede tardar
- Revisa la consola del navegador (F12)

### Error de OpenAI
- Verifica que tu API key sea correcta
- Asegúrate de tener créditos en tu cuenta de OpenAI
- La app seguirá funcionando sin OpenAI

### Puerto en uso
Si los puertos 3000 o 3001 están ocupados:

Backend:
```bash
PORT=3002 npm start
```

Frontend: Edita `package.json` y cambia el puerto

## 📱 Uso en Móvil

Reni funciona en móviles, pero necesitas:

1. Servir sobre HTTPS (requerido para acceso a cámara en móvil)
2. Usar ngrok o similar para exponer localhost

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer frontend
ngrok http 3000
```

## 🎮 Ejercicios Disponibles

| Ejercicio | ID | Descripción |
|-----------|----|-----------  |
| 🦵 Sentadillas | `squat` | Fortalece piernas y glúteos |
| 💪 Flexiones | `pushup` | Trabaja pecho, brazos y core |
| 🧘 Plancha | `plank` | Fortalece el core |
| 🏋️ Peso Muerto | `deadlift` | Espalda baja y piernas |

## 📊 Métricas Analizadas

Para cada ejercicio, Reni analiza:
- ✅ Número de repeticiones
- ✅ Calidad de forma (0-100)
- ✅ Ángulos de articulaciones
- ✅ Fases del movimiento
- ✅ Errores comunes
- ✅ Desviaciones de la forma correcta

## 🔧 Personalización

### Agregar un nuevo ejercicio:

1. Edita `ai-models/exercise-analyzer.js`
2. Agrega definición en `exerciseDefinitions`
3. Actualiza `frontend/src/components/ExerciseSelector.js`
4. Agrega descripciones de errores

### Cambiar modelo de IA:

Edita `ai-models/pose-detection.js` para usar BlazePose en lugar de MoveNet:

```javascript
const detectorConfig = {
  runtime: 'mediapipe',
  solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
  modelType: 'full'
};

this.detector = await poseDetection.createDetector(
  poseDetection.SupportedModels.BlazePose,
  detectorConfig
);
```

## 📚 Recursos

- [Documentación TensorFlow.js](https://www.tensorflow.org/js)
- [Pose Detection Guide](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [React Documentation](https://react.dev)

## 🤝 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa los logs del backend en la terminal
3. Verifica que todos los puertos estén disponibles
4. Asegúrate de que la cámara funcione en otras apps

## 🎉 ¡Listo!

Ya puedes usar Reni para mejorar tu técnica de ejercicios con IA. ¡Disfruta entrenando! 💪

---

**Próximos pasos sugeridos:**
- Agregar más ejercicios
- Implementar persistencia de datos (base de datos)
- Agregar gráficos de progreso
- Crear sistema de usuarios
- Exportar videos con análisis
