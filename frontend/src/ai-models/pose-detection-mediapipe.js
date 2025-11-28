/**
 * DETECCIÓN DE POSE CON MEDIAPIPE (Versión CDN simplificada)
 * 
 * Usa MediaPipe Pose desde CDN (sin webpack)
 * Detecta 33 keypoints del cuerpo humano
 */

let poseInstance = null;

const loadMediaPipeScript = async () => {
  return new Promise((resolve, reject) => {
    // Cargar la versión más nueva y estable
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1633989730/pose_bundle.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      console.log('✅ Script MediaPipe cargado');
      resolve();
    };
    script.onerror = (error) => {
      console.error('❌ Error cargando script:', error);
      reject(error);
    };
    document.head.appendChild(script);
  });
};

export class PoseDetector {
  constructor() {
    this.pose = null;
    this.isInitialized = false;
    this.lastResults = null;
  }

  async initialize() {
    try {
      console.log('🚀 Cargando MediaPipe Pose desde CDN...');

      // Cargar script de MediaPipe
      await loadMediaPipeScript();

      // Esperar un poco a que se registre window.Pose
      await new Promise(r => setTimeout(r, 500));

      // Verificar que está disponible
      if (typeof window.Pose === 'undefined') {
        console.warn('⚠️ window.Pose no encontrado, intentando con window.Mediapipe');
        if (typeof window.Mediapipe === 'undefined') {
          throw new Error('MediaPipe no se cargó correctamente (window.Pose y window.Mediapipe undefined)');
        }
        this.pose = new window.Mediapipe.Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1633989730/${file}`;
          }
        });
      } else {
        // Crear instancia
        this.pose = new window.Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1633989730/${file}`;
          }
        });
      }

      // Callback de resultados
      this.pose.onResults((results) => {
        this.lastResults = results;
      });

      this.isInitialized = true;
      console.log('✅ MediaPipe Pose inicializado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando MediaPipe:', error);
      throw error;
    }
  }

  /**
   * Detecta pose en video
   */
  async detectPose(video) {
    if (!this.isInitialized || !this.pose) return [];

    try {
      // Procesar frame
      await this.pose.send({ image: video });

      if (!this.lastResults?.landmarks || this.lastResults.landmarks.length === 0) {
        return [];
      }

      // Retornar en formato esperado por ExerciseAnalyzer
      return [{ keypoints: this.convertLandmarks(this.lastResults.landmarks) }];
    } catch (error) {
      console.error('Error en detectPose:', error);
      return [];
    }
  }

  /**
   * Convierte landmarks MediaPipe al formato del analyzer
   */
  convertLandmarks(landmarks) {
    const names = [
      'nose',
      'left_eye_inner', 'left_eye', 'left_eye_outer',
      'right_eye_inner', 'right_eye', 'right_eye_outer',
      'left_ear', 'right_ear',
      'mouth_left', 'mouth_right',
      'left_shoulder', 'right_shoulder',
      'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist',
      'left_pinky', 'right_pinky',
      'left_index', 'right_index',
      'left_thumb', 'right_thumb',
      'left_hip', 'right_hip',
      'left_knee', 'right_knee',
      'left_ankle', 'right_ankle',
      'left_heel', 'right_heel',
      'left_foot_index', 'right_foot_index'
    ];

    return landmarks.map((lm, idx) => ({
      name: names[idx],
      x: lm.x,
      y: lm.y,
      score: lm.visibility || 0.95
    }));
  }

  /**
   * Dibuja esqueleto en canvas
   */
  drawSkeleton(poses, ctx) {
    if (!poses?.length || !this.lastResults?.landmarks) return;

    const landmarks = this.lastResults.landmarks;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 7],
      [0, 4], [4, 5], [5, 6], [6, 8],
      [9, 10],
      [11, 12],
      [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
      [11, 23], [23, 25], [25, 27], [27, 29], [29, 31],
      [12, 24], [24, 26], [26, 28], [28, 30], [30, 32],
      [23, 24]
    ];

    // Dibujar líneas
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const [start, end] of connections) {
      const lm1 = landmarks[start];
      const lm2 = landmarks[end];
      if (lm1?.visibility > 0.3 && lm2?.visibility > 0.3) {
        ctx.beginPath();
        ctx.moveTo(lm1.x * w, lm1.y * h);
        ctx.lineTo(lm2.x * w, lm2.y * h);
        ctx.stroke();
      }
    }

    // Dibujar puntos
    ctx.fillStyle = '#FFD700';
    for (const lm of landmarks) {
      if (lm?.visibility > 0.3) {
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }

  getKeypoint(pose, name) {
    return pose?.keypoints?.find(kp => kp.name === name) || null;
  }

  calculateAngle(pA, pB, pC) {
    if (!pA || !pB || !pC) return null;
    const rad = Math.atan2(pC.y - pB.y, pC.x - pB.x) - Math.atan2(pA.y - pB.y, pA.x - pB.x);
    let angle = Math.abs(rad * 180 / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  }

  dispose() {
    if (this.pose) this.pose.close();
    this.isInitialized = false;
  }

  isReady() {
    return this.isInitialized && this.pose !== null;
  }
}

export default new PoseDetector();
