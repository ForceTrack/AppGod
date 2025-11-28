# 🔍 Diagnóstico de Modelos - ForceTrack

## ¿Los modelos NO cargan? Sigue estos pasos:

### Paso 1: Abre la app en tu navegador

```
http://localhost:3000
```

### Paso 2: Abre la Consola del Navegador

**Chrome/Edge:**
- Windows: `Ctrl + Shift + J`
- Mac: `Cmd + Option + J`

**Firefox:**
- Windows: `Ctrl + Shift + K`
- Mac: `Cmd + Option + K`

### Paso 3: Busca la sección "PRUEBA DE CARGA DE MODELOS"

Deberías ver algo así:

```
========================================
PRUEBA DE CARGA DE MODELOS
========================================
✅ TensorFlow.js funciona correctamente
   Backend: webgl
   Versión: 4.22.0

--- Probando PoseNet ---
Descargando PoseNet...
✅ PoseNet cargado exitosamente

--- Probando MoveNet ---
Descargando MoveNet Lightning...
✅ MoveNet cargado exitosamente

--- Probando BodyPix ---
Descargando BodyPix...
✅ BodyPix cargado exitosamente

========================================
PRUEBA COMPLETADA
========================================
```

---

## 📊 Interpretando los Resultados:

### ✅ Si TODO tiene checkmarks verdes:
**Los modelos funcionan correctamente**

**Problema:** Puede ser el código de inicialización en VideoCapture.js

**Solución:**
1. Recarga la página completamente: `Cmd+Shift+R` (Mac) o `Ctrl+Shift+R` (Windows)
2. Espera 30 segundos
3. Verifica que el indicador diga "IA Lista" (verde)

---

### ❌ Si ves "Error con TensorFlow.js":

**Problema:** TensorFlow.js básico no funciona

**Causas posibles:**
- WebGL no está habilitado
- Navegador no soportado
- Extensiones bloqueando JavaScript

**Soluciones:**

#### 1. Verifica WebGL:
Ve a: `chrome://gpu` (en Chrome/Edge)

Busca:
```
WebGL: Hardware accelerated
```

Si dice "Software only" o "Disabled":
- Chrome → Configuración → Sistema
- ✅ Activar "Usar aceleración de hardware"
- Reinicia el navegador

#### 2. Prueba en modo incógnito:
- Chrome: `Cmd+Shift+N` (Mac) o `Ctrl+Shift+N` (Windows)
- Esto desactiva extensiones que pueden interferir

#### 3. Usa Chrome o Edge:
Safari y Firefox tienen problemas conocidos con TensorFlow.js

---

### ❌ Si PoseNet falla pero TensorFlow funciona:

**Problema:** No puede descargar el modelo

**Error común:**
```
Failed to fetch
net::ERR_INTERNET_DISCONNECTED
```

**Soluciones:**

#### 1. Verifica tu internet:
```bash
ping google.com
curl -I https://storage.googleapis.com
```

#### 2. Desactiva VPN/Proxy temporalmente

#### 3. Verifica firewall:
Permite estos dominios:
- `storage.googleapis.com`
- `tfhub.dev`
- `cdn.jsdelivr.net`

#### 4. Espera más tiempo:
Primera descarga: 30-60 segundos
Conexión lenta: hasta 2 minutos

**NO recargues** mientras dice "Descargando..."

---

### ❌ Si MoveNet falla pero PoseNet funciona:

**Esto es NORMAL**

MoveNet tiene problemas conocidos con los servidores de TensorFlow Hub.

**Solución:** La app usará PoseNet (que ya funciona)

---

### ❌ Si BodyPix falla:

**Esto NO es crítico**

BodyPix es solo para efectos visuales (difuminar fondo).

**Solución:** La app funcionará sin segmentación de fondo

---

## 🔧 Soluciones Rápidas por Error:

### Error: "Failed to parse model JSON"
```
Failed to parse model JSON of response from https://tfhub.dev/...
```

**Causa:** Servidor de TensorFlow Hub caído o lento

**Solución:**
1. Espera 5 minutos
2. Recarga la página
3. Si persiste, usa PoseNet (la app ya lo intenta automáticamente)

---

### Error: "CORS policy blocked"
```
Access to fetch at '...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Causa:** Problema de navegador

**Solución:**
1. Usa Chrome o Edge (mejor soporte)
2. O inicia Chrome con CORS deshabilitado (solo para desarrollo):

**Mac:**
```bash
open -na "Google Chrome" --args --disable-web-security --user-data-dir="/tmp/chrome-dev"
```

**Windows:**
```cmd
chrome.exe --disable-web-security --user-data-dir="C:\tmp\chrome-dev"
```

---

### Error: "WebGL is not supported"
```
WebGL is not supported on this device
```

**Causa:** GPU no soportada o drivers desactualizados

**Soluciones:**
1. Actualiza drivers de GPU
2. Usa CPU como fallback (más lento):

En consola del navegador:
```javascript
await tf.setBackend('cpu');
```

---

## 📱 Problemas Específicos por Navegador:

### Chrome (✅ Recomendado)
- Funciona mejor
- Mejor soporte WebGL
- Modelos más rápidos

### Edge (✅ Recomendado)
- Basado en Chromium
- Igual que Chrome

### Firefox (⚠️ Funciona pero más lento)
- WebGL más lento
- Descarga de modelos puede fallar
- Usa PoseNet en vez de MoveNet

### Safari (❌ No recomendado)
- Muchos problemas con TensorFlow.js
- WebGL limitado
- NO LO USES si tienes otra opción

---

## 🐛 Registro de Errores Comunes:

Si sigues teniendo problemas, **copia y pega TODA la consola** en un archivo de texto.

Incluye:
1. Sistema operativo
2. Navegador y versión
3. Mensajes de error completos
4. Resultado de la "PRUEBA DE CARGA DE MODELOS"

---

## 🎯 Verificación Final:

Si después de seguir TODOS los pasos anteriores:

✅ TensorFlow.js funciona
✅ Al menos UN modelo carga (PoseNet o MoveNet)
✅ El navegador es Chrome/Edge
✅ WebGL está habilitado

Pero la app TODAVÍA no funciona...

Entonces el problema es el código de `VideoCapture.js` o `pose-detection.js`, no los modelos.

**Solución:**
```bash
cd /Users/joaquinholmes/Desktop/Reni/frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 💡 Atajos Útiles:

### Ver versión de TensorFlow:
En consola del navegador:
```javascript
console.log(tf.version);
```

### Ver backend actual:
```javascript
console.log(tf.getBackend());
```

### Forzar CPU (si WebGL falla):
```javascript
await tf.setBackend('cpu');
```

### Limpiar caché de TensorFlow:
```javascript
await tf.disposeVariables();
location.reload();
```

---

## 📞 Última Opción: Modo Offline

Si NADA funciona, puedes descargar los modelos manualmente:

```bash
cd /Users/joaquinholmes/Desktop/Reni
mkdir -p frontend/public/models

# Descargar modelos (próximamente)
# wget ...
```

---

## ✅ Checklist de Diagnóstico:

Marca lo que YA probaste:

- [ ] Abrí la consola del navegador
- [ ] Vi la "PRUEBA DE CARGA DE MODELOS"
- [ ] TensorFlow.js carga correctamente
- [ ] Usé Chrome o Edge
- [ ] Verifiqué WebGL en chrome://gpu
- [ ] Probé en modo incógnito
- [ ] Esperé al menos 60 segundos
- [ ] Recargué con Cmd+Shift+R / Ctrl+Shift+R
- [ ] Limpié la caché del navegador
- [ ] Verifiqué mi conexión a internet
- [ ] Desactivé VPN/Proxy
- [ ] Reinstalé node_modules

Si marcaste TODO y NO funciona → Reporta el bug con la consola completa
