# 🔧 Solución de Problemas - ForceTrack/Reni

## ❌ Error: "Failed to parse model JSON from TensorFlow Hub"

Este es el error más común y ocurre cuando los modelos de IA no se pueden descargar.

### 🎯 Soluciones:

#### 1. **Verifica tu conexión a Internet**
Los modelos se descargan desde servidores de Google/TensorFlow. Necesitas:
- ✅ Conexión estable
- ✅ Mínimo 2-3 MB/s de velocidad
- ✅ Sin bloqueos de firewall/proxy

```bash
# Prueba tu conexión:
ping google.com
curl -I https://tfhub.dev
```

#### 2. **Espera más tiempo (IMPORTANTE)**
Los modelos pueden tardar:
- Primera carga: **30-90 segundos**
- Con conexión lenta: **hasta 2 minutos**

**NO recargues la página mientras dice "Cargando IA..."**

#### 3. **Limpia la caché del navegador**
```
Chrome/Edge: Cmd+Shift+Delete (Mac) o Ctrl+Shift+Delete (Windows)
- Selecciona "Imágenes y archivos en caché"
- Selecciona "Todo el tiempo"
- Haz clic en "Borrar datos"
```

Luego recarga: **Cmd+Shift+R** (Mac) o **Ctrl+Shift+R** (Windows)

#### 4. **Usa Chrome o Edge** (Recomendado)
TensorFlow.js funciona mejor en navegadores basados en Chromium:
- ✅ Google Chrome (mejor opción)
- ✅ Microsoft Edge
- ⚠️ Firefox (puede ser más lento)
- ❌ Safari (problemas conocidos con TensorFlow.js)

#### 5. **Verifica la consola del navegador**
Abre la consola (F12 o Cmd+Option+I) y busca:

**Si ves esto, está funcionando:**
```
Inicializando modelos de IA...
Intentando cargar PoseNet (alternativa más estable)...
PoseDetector inicializado correctamente con PoseNet
PersonSegmenter inicializado correctamente con BodyPix
ExerciseAnalyzer listo
Sistema inicializado correctamente
```

**Si ves errores de red:**
```
net::ERR_INTERNET_DISCONNECTED
net::ERR_NAME_NOT_RESOLVED
net::ERR_CONNECTION_TIMED_OUT
```
→ Problema de conexión a internet

**Si ves errores de CORS:**
```
Access-Control-Allow-Origin
CORS policy blocked
```
→ Problema del navegador, usa Chrome

---

## 🔄 Cambios Aplicados (v2.0)

### Nueva Estrategia de Carga:

**Antes (problemático):**
- MoveNet Lightning → Pesado, servidores lentos
- MediaPipe → Requiere CDN externo

**Ahora (mejorado):**
1. **PoseNet** (primera opción) - Más ligero, más confiable
2. **MoveNet Thunder** (fallback) - Versión más pequeña
3. **BodyPix** (segmentación) - Descarga directa desde TensorFlow
4. **Timeouts aumentados** - 60 segundos en vez de 30
5. **Modo parcial** - La app funciona aunque algunos modelos fallen

### Estados del Sistema:

| Estado | Color | Significado | ¿Funciona? |
|--------|-------|-------------|------------|
| 🟢 **IA Lista** | Verde | Todos los modelos cargados | ✅ Sí |
| 🔵 **Modo Limitado** | Azul | Solo pose detector funciona | ⚠️ Parcialmente |
| 🟠 **Modo Demo** | Naranja | Sin modelos de IA | ❌ Solo UI |
| 🔴 **Error** | Rojo | Fallo crítico | ❌ Recarga página |

---

## 🌐 Problemas de Red

### Si estás detrás de un firewall corporativo:

1. **Permite estos dominios:**
   ```
   tfhub.dev
   storage.googleapis.com
   cdn.jsdelivr.net
   unpkg.com
   ```

2. **O descarga modelos localmente:**
   ```bash
   # Descargar modelos manualmente (próximamente)
   npm run download-models
   ```

### Si usas VPN:
- Desactiva la VPN temporalmente
- O usa un servidor VPN en USA/Europa (más cerca de los servidores de TensorFlow)

---

## 💻 Problemas de Hardware

### GPU/WebGL:

**Verifica si WebGL está habilitado:**
1. Ve a: `chrome://gpu`
2. Busca: "WebGL: Hardware accelerated"
3. Si dice "Software only", TensorFlow será MUY lento

**Habilitar aceleración:**
```
Chrome → Configuración → Sistema
✅ Activar "Usar aceleración de hardware cuando esté disponible"
```

### RAM insuficiente:
Los modelos necesitan:
- Mínimo: 2 GB RAM libre
- Recomendado: 4 GB RAM libre

**Cierra otras pestañas** antes de usar la app.

---

## 🚀 Solución Rápida: Modo Solo Analyzer

Si los modelos NO cargan y necesitas usar la app YA:

1. Los modelos de pose/segmentación son **opcionales**
2. El **ExerciseAnalyzer** SIEMPRE funciona (usa matemáticas, no IA)
3. Puedes hacer ejercicios y recibir análisis básico

**Limitaciones en Modo Limitado:**
- ❌ No verás el esqueleto dibujado
- ❌ No verás segmentación de fondo
- ✅ Sí verás contador de repeticiones
- ✅ Sí verás análisis de ángulos
- ✅ Sí recibirás feedback

---

## 📞 ¿Nada Funciona?

### Opción 1: Reinstalar dependencias
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Opción 2: Usar versión anterior de TensorFlow
```bash
cd frontend
npm install @tensorflow/tfjs@3.20.0
npm install @tensorflow-models/pose-detection@2.0.0
npm start
```

### Opción 3: Reportar el bug
Incluye:
- Sistema operativo
- Navegador y versión
- Mensaje de error completo
- Captura de la consola (F12)

---

## ✅ Verificación Post-Solución

Después de aplicar las soluciones, verifica:

1. **Abre**: http://localhost:3000
2. **Espera**: 60-90 segundos
3. **Verifica consola**: Debe decir "Sistema inicializado correctamente"
4. **Verifica indicador**: Debe estar en verde "IA Lista"
5. **Selecciona ejercicio**: Debe habilitarse el botón "Iniciar"
6. **Inicia cámara**: Debe aparecer tu video
7. **Prueba detección**: Muévete, debe detectar tu pose

Si TODO lo anterior funciona → **✅ ÉXITO**

---

## 📊 Comparación de Modelos

| Modelo | Tamaño | Velocidad | Precisión | Confiabilidad |
|--------|--------|-----------|-----------|---------------|
| **PoseNet** | ~10 MB | 30 FPS | Buena | ⭐⭐⭐⭐⭐ |
| **MoveNet Lightning** | ~7 MB | 50 FPS | Muy buena | ⭐⭐⭐ |
| **MoveNet Thunder** | ~12 MB | 30 FPS | Excelente | ⭐⭐⭐⭐ |
| **BodyPix** | ~8 MB | 20 FPS | Buena | ⭐⭐⭐⭐⭐ |

**Ahora la app usa PoseNet + BodyPix** (las opciones más confiables)

---

## 🎓 Entendiendo los Errores

### Error común:
```
Failed to parse model JSON of response from https://tfhub.dev/...
```

**Significa:**
- El navegador intentó descargar el modelo
- El servidor respondió, pero los datos estaban corruptos
- O el servidor está caído temporalmente

**NO significa:**
- Tu código está mal ❌
- La app está rota ❌
- Necesitas entrenar modelos ❌

**Solución:** Esperar o cambiar de modelo (ya lo hicimos automáticamente)

---

## 📅 Última actualización: 24 Nov 2025

**Cambios en esta versión:**
- ✅ PoseNet como modelo principal
- ✅ Timeouts de 60 segundos
- ✅ Mejor manejo de errores
- ✅ Modo parcial funcional
- ✅ Mensajes más claros
