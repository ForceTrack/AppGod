/**
 * VERSIÓN SIMPLIFICADA - SOLO POSENET (EL MÁS CONFIABLE)
 */

import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';

export class PoseDetector {
  constructor() {
    this.detector = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {
      console.log('🚀 Cargando PoseNet...');
      
      // Asegurar TensorFlow está listo
      await tf.ready();
      console.log('✅ TensorFlow listo, backend:', tf.getBackend());

      // Solo PoseNet - el más confiable y rápido
      const config = {
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 257, height: 257 },
        multiplier: 0.5,  // Más pequeño = más rápido
        quantBytes: 2
      };

      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.PoseNet,
        config
      );

      this.isInitialized = true;
      console.log('✅ PoseNet inicializado correctamente');
      return true;

    } catch (error) {
      console.error('❌ Error al inicializar PoseNet:', error.message);
      this.isInitialized = false;
      throw error;
    }
  }

  async detectPose(input) {
    if (!this.isInitialized || !this.detector) {
      return null;
    }

    try {
      const poses = await this.detector.estimatePoses(input, {
        maxPoses: 1,
        flipHorizontal: false,
        scoreThreshold: 0.5
      });
      
      return poses && poses.length > 0 ? poses : [];
    } catch (error) {
      console.error('Error detectando pose:', error);
      return null;
    }
  }

  drawSkeleton(poses, ctx) {
    if (!poses || poses.length === 0) return;

    const pose = poses[0];
    
    // Dibujar puntos
    if (pose.keypoints) {
      pose.keypoints.forEach(keypoint => {
        if (keypoint.score > 0.5) {
          ctx.beginPath();
          ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#FFD700';  // Amarillo
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Conexiones del esqueleto
      const connections = [
        ['left_shoulder', 'right_shoulder'],
        ['left_shoulder', 'left_elbow'],
        ['left_elbow', 'left_wrist'],
        ['right_shoulder', 'right_elbow'],
        ['right_elbow', 'right_wrist'],
        ['left_shoulder', 'left_hip'],
        ['right_shoulder', 'right_hip'],
        ['left_hip', 'right_hip'],
        ['left_hip', 'left_knee'],
        ['left_knee', 'left_ankle'],
        ['right_hip', 'right_knee'],
        ['right_knee', 'right_ankle']
      ];

      connections.forEach(([partA, partB]) => {
        const kpA = pose.keypoints.find(kp => kp.name === partA);
        const kpB = pose.keypoints.find(kp => kp.name === partB);

        if (kpA && kpB && kpA.score > 0.5 && kpB.score > 0.5) {
          ctx.beginPath();
          ctx.moveTo(kpA.x, kpA.y);
          ctx.lineTo(kpB.x, kpB.y);
          ctx.strokeStyle = '#FFD700';  // Amarillo
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      });
    }
  }

  getKeypoint(pose, keypointName) {
    if (!pose || !pose.keypoints) return null;
    return pose.keypoints.find(kp => kp.name === keypointName);
  }

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

  dispose() {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
    this.isInitialized = false;
  }

  isReady() {
    return this.isInitialized && this.detector !== null;
  }
}

export default new PoseDetector();
