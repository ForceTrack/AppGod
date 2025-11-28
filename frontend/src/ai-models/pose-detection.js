/**
 * MÓDULO 2: DETECCIÓN DE POSE (ESQUELETO HUMANO)
 * 
 * Este módulo detecta personas y crea su esqueleto en tiempo real
 * usando TensorFlow.js y MediaPipe Pose Detection.
 * 
 * Puede funcionar de forma independiente.
 */

import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';

export class PoseDetector {
  constructor() {
    this.detector = null;
    this.isInitialized = false;
    this.isLoading = false;
  }

  /**
   * Inicializa el modelo de detección de pose
   * Usa MoveNet o BlazePose según disponibilidad
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('PoseDetector ya está inicializado');
      return true;
    }

    if (this.isLoading) {
      console.log('PoseDetector ya se está cargando...');
      return false;
    }

    try {
      this.isLoading = true;
      console.log('Inicializando PoseDetector...');

      // Asegurar que TensorFlow.js está listo
      await tf.ready();
      console.log('TensorFlow.js listo');

      // Intentar con PoseNet primero (más confiable, modelo más ligero)
      console.log('Intentando cargar PoseNet (alternativa más estable)...');

      try {
        const poseNetConfig = {
          architecture: 'MobileNetV1',
          outputStride: 16,
          inputResolution: { width: 640, height: 480 },
          multiplier: 0.75,
          quantBytes: 2
        };

        this.detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.PoseNet,
          poseNetConfig
        );

        this.isInitialized = true;
        this.isLoading = false;
        console.log('PoseDetector inicializado correctamente con PoseNet');
        return true;

      } catch (poseNetError) {
        console.warn('PoseNet falló, intentando con MoveNet...', poseNetError.message);

        // Fallback a MoveNet con Thunder (más pequeño que Lightning)
        try {
          const detectorConfig = {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
            enableSmoothing: true,
            minPoseScore: 0.25
          };

          console.log('Descargando MoveNet Thunder desde CDN alternativo...');

          this.detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            detectorConfig
          );

          this.isInitialized = true;
          this.isLoading = false;
          console.log('PoseDetector inicializado correctamente con MoveNet Thunder');
          return true;

        } catch (moveNetError) {
          console.error('Ambos modelos fallaron:', moveNetError.message);
          throw new Error('No se pudo cargar ningún modelo de pose. Verifica tu conexión a internet.');
        }
      }

    } catch (error) {
      console.error('❌ Error al inicializar PoseDetector:', error);
      this.isLoading = false;
      this.isInitialized = false;
      throw new Error(`Error al cargar modelo de pose: ${error.message}`);
    }
  }

  /**
   * Detecta poses en un video o imagen
   * @param {HTMLVideoElement|HTMLImageElement} input - Elemento de video o imagen
   * @returns {Array} Array de poses detectadas con keypoints
   */
  async detectPose(input) {
    if (!this.isInitialized) {
      console.warn('⚠️ PoseDetector no está inicializado. Llama a initialize() primero.');
      return null;
    }

    // Verificar dimensiones del input
    const width = input.videoWidth || input.width;
    const height = input.videoHeight || input.height;

    if (!width || !height || width === 0 || height === 0) {
      return null;
    }

    try {
      // Detectar poses
      const poses = await this.detector.estimatePoses(input);

      if (poses && poses.length > 0) {
        // Filtrar keypoints con baja confianza
        return poses;
      }

      return [];

    } catch (error) {
      console.error('Error al detectar pose:', error);
      return null;
    }
  }

  /**
   * Dibuja el esqueleto en un canvas
   * @param {Array} poses - Poses detectadas
   * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
   */
  drawSkeleton(poses, ctx) {
    if (!poses || poses.length === 0) return;

    poses.forEach(pose => {
      // Dibujar keypoints (articulaciones)
      pose.keypoints.forEach(keypoint => {
        if (keypoint.score > 0.2) { // Umbral reducido a 0.2
          ctx.beginPath();
          ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI); // Radio aumentado a 6
          ctx.fillStyle = '#00FFFF'; // Cyan brillante para las articulaciones
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF'; // Borde blanco
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Dibujar conexiones (huesos)
      const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
        poseDetection.SupportedModels.MoveNet
      );

      adjacentKeyPoints.forEach(([i, j]) => {
        const kp1 = pose.keypoints[i];
        const kp2 = pose.keypoints[j];

        if (kp1 && kp2 && kp1.score > 0.2 && kp2.score > 0.2) {
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
          ctx.strokeStyle = '#00FF00'; // Verde neon para los huesos
          ctx.lineWidth = 4; // Grosor aumentado a 4
          ctx.stroke();
        }
      });
    });
  }

  /**
   * Obtiene keypoints específicos por nombre
   * @param {Object} pose - Pose detectada
   * @param {String} keypointName - Nombre del keypoint (ej: 'left_shoulder')
   */
  getKeypoint(pose, keypointName) {
    if (!pose || !pose.keypoints) return null;
    return pose.keypoints.find(kp => kp.name === keypointName);
  }

  /**
   * Calcula el ángulo entre tres puntos
   * @param {Object} pointA - Primer punto {x, y}
   * @param {Object} pointB - Punto central {x, y}
   * @param {Object} pointC - Tercer punto {x, y}
   * @returns {Number} Ángulo en grados
   */
  calculateAngle(pointA, pointB, pointC) {
    if (!pointA || !pointB || !pointC) return null;

    const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
      Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);

    let angle = Math.abs(radians * 180.0 / Math.PI);

    if (angle > 180.0) {
      angle = 360 - angle;
    }

    return angle;
  }

  /**
   * Libera recursos
   */
  dispose() {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
    this.isInitialized = false;
    console.log('PoseDetector recursos liberados');
  }

  /**
   * Verifica si el modelo está listo
   */
  isReady() {
    return this.isInitialized && this.detector !== null;
  }
}

// Exportar una instancia singleton si se desea
export default new PoseDetector();
