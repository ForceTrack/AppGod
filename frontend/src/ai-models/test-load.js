/**
 * Script de prueba para verificar carga de modelos
 */

import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';

export async function testModelLoading() {
  console.log('========================================');
  console.log('PRUEBA DE CARGA DE MODELOS');
  console.log('========================================');

  // Test 1: TensorFlow.js básico
  try {
    await tf.ready();
    console.log('✅ TensorFlow.js funciona correctamente');
    console.log('   Backend:', tf.getBackend());
    console.log('   Versión:', tf.version.tfjs);
  } catch (error) {
    console.error('❌ Error con TensorFlow.js:', error);
    return;
  }

  // Test 2: PoseNet (más confiable)
  console.log('\n--- Probando PoseNet ---');
  try {
    const poseNetConfig = {
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: 257, height: 257 },
      multiplier: 0.75
    };

    console.log('Descargando PoseNet...');
    const poseDetector = await poseDetection.createDetector(
      poseDetection.SupportedModels.PoseNet,
      poseNetConfig
    );
    console.log('✅ PoseNet cargado exitosamente');
    poseDetector.dispose();
  } catch (error) {
    console.error('❌ Error con PoseNet:', error.message);
  }

  // Test 3: MoveNet
  console.log('\n--- Probando MoveNet ---');
  try {
    const moveNetConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
    };

    console.log('Descargando MoveNet Lightning...');
    const moveNetDetector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      moveNetConfig
    );
    console.log('✅ MoveNet cargado exitosamente');
    moveNetDetector.dispose();
  } catch (error) {
    console.error('❌ Error con MoveNet:', error.message);
  }

  // Test 4: BodyPix
  console.log('\n--- Probando BodyPix ---');
  try {
    const bodyPixConfig = {
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2
    };

    console.log('Descargando BodyPix...');
    const segmenter = await bodySegmentation.createSegmenter(
      bodySegmentation.SupportedModels.BodyPix,
      bodyPixConfig
    );
    console.log('✅ BodyPix cargado exitosamente');
    segmenter.dispose();
  } catch (error) {
    console.error('❌ Error con BodyPix:', error.message);
  }

  console.log('\n========================================');
  console.log('PRUEBA COMPLETADA');
  console.log('========================================');
}
