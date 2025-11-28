/**
 * MÓDULO 3: SEGMENTACIÓN DE PERSONAS
 * 
 * Este módulo separa a las personas del fondo y otros objetos
 * usando TensorFlow.js Body Segmentation.
 * 
 * Puede funcionar de forma independiente.
 */

import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import * as tf from '@tensorflow/tfjs';

export class PersonSegmenter {
  constructor() {
    this.segmenter = null;
    this.isInitialized = false;
    this.isLoading = false;
  }

  /**
   * Inicializa el modelo de segmentación
   * Usa MediaPipe SelfieSegmentation o BodyPix
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('PersonSegmenter ya está inicializado');
      return true;
    }

    if (this.isLoading) {
      console.log('PersonSegmenter ya se está cargando...');
      return false;
    }

    try {
      this.isLoading = true;
      console.log('Inicializando PersonSegmenter...');

      // Asegurar que TensorFlow.js está listo
      await tf.ready();

      // Intentar primero con BodyPix (más confiable, no requiere MediaPipe CDN)
      console.log('Inicializando con BodyPix (más estable)...');
      
      const bodyPixConfig = {
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2
      };

      // Crear el segmentador con timeout
      this.segmenter = await Promise.race([
        bodySegmentation.createSegmenter(
          bodySegmentation.SupportedModels.BodyPix,
          bodyPixConfig
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout descargando modelo')), 30000)
        )
      ]);

      this.isInitialized = true;
      this.isLoading = false;
      console.log('PersonSegmenter inicializado correctamente con BodyPix');
      return true;

    } catch (error) {
      console.error('Error al inicializar PersonSegmenter:', error);
      this.isLoading = false;
      this.isInitialized = false;
      throw new Error(`Error al cargar modelo de segmentación: ${error.message}`);
    }
  }

  /**
   * Segmenta personas en un video o imagen
   * @param {HTMLVideoElement|HTMLImageElement} input - Elemento de video o imagen
   * @returns {Object} Máscara de segmentación
   */
  async segment(input) {
    if (!this.isInitialized) {
      console.warn('⚠️ PersonSegmenter no está inicializado. Llama a initialize() primero.');
      return null;
    }

    try {
      // Realizar segmentación
      const segmentation = await this.segmenter.segmentPeople(input);
      return segmentation;

    } catch (error) {
      console.error('Error al segmentar persona:', error);
      return null;
    }
  }

  /**
   * Dibuja la máscara de segmentación en un canvas
   * @param {Array} segmentation - Resultado de segmentación
   * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
   * @param {String} mode - Modo de visualización: 'mask', 'blur', 'bokeh'
   */
  async drawSegmentation(segmentation, ctx, canvas, mode = 'mask') {
    if (!segmentation || segmentation.length === 0) return;

    const foregroundColor = { r: 0, g: 255, b: 0, a: 128 }; // Verde semi-transparente
    const backgroundColor = { r: 0, g: 0, b: 0, a: 255 }; // Negro

    switch (mode) {
      case 'mask':
        // Dibujar máscara de color
        await bodySegmentation.drawMask(
          canvas,
          canvas,
          segmentation,
          1.0, // opacidad
          0, // desenfoque
          false // flip horizontal
        );
        break;

      case 'blur':
        // Desenfocar el fondo
        await bodySegmentation.drawBokehEffect(
          canvas,
          canvas,
          segmentation,
          5, // intensidad de desenfoque
          3, // margen de desenfoque
          false // flip horizontal
        );
        break;

      case 'pixelate':
        // Efecto pixelado en el fondo
        await bodySegmentation.drawPixelatedMask(
          canvas,
          canvas,
          segmentation,
          0.7, // opacidad de la máscara
          0, // desenfoque del borde
          false, // flip horizontal
          10 // tamaño del pixel
        );
        break;

      default:
        // Modo de máscara simple
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const mask = segmentation[0].mask;

        for (let i = 0; i < mask.width * mask.height; i++) {
          const pixelIndex = i * 4;
          const maskValue = mask.data[i];

          if (maskValue === 0) {
            // Fondo - oscurecer
            pixels[pixelIndex] = pixels[pixelIndex] * 0.3;
            pixels[pixelIndex + 1] = pixels[pixelIndex + 1] * 0.3;
            pixels[pixelIndex + 2] = pixels[pixelIndex + 2] * 0.3;
          }
          // Persona - mantener original
        }

        ctx.putImageData(imageData, 0, 0);
    }
  }

  /**
   * Extrae solo la persona del fondo
   * @param {HTMLVideoElement|HTMLImageElement} input - Elemento de entrada
   * @param {HTMLCanvasElement} outputCanvas - Canvas de salida
   */
  async extractPerson(input, outputCanvas) {
    if (!this.isInitialized) {
      console.warn('⚠️ PersonSegmenter no está inicializado.');
      return null;
    }

    try {
      const segmentation = await this.segment(input);
      
      if (!segmentation || segmentation.length === 0) {
        return null;
      }

      const ctx = outputCanvas.getContext('2d');
      ctx.drawImage(input, 0, 0, outputCanvas.width, outputCanvas.height);

      const imageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
      const pixels = imageData.data;
      const mask = segmentation[0].mask;

      // Hacer transparente el fondo
      for (let i = 0; i < mask.width * mask.height; i++) {
        const maskValue = mask.data[i];
        if (maskValue === 0) {
          // Fondo - hacer transparente
          pixels[i * 4 + 3] = 0; // Canal alpha
        }
      }

      ctx.putImageData(imageData, 0, 0);
      return outputCanvas;

    } catch (error) {
      console.error('Error al extraer persona:', error);
      return null;
    }
  }

  /**
   * Calcula el porcentaje de la imagen que es persona
   * @param {Array} segmentation - Resultado de segmentación
   * @returns {Number} Porcentaje (0-100)
   */
  calculatePersonPercentage(segmentation) {
    if (!segmentation || segmentation.length === 0) return 0;

    const mask = segmentation[0].mask;
    let personPixels = 0;

    for (let i = 0; i < mask.data.length; i++) {
      if (mask.data[i] === 1) {
        personPixels++;
      }
    }

    return (personPixels / mask.data.length) * 100;
  }

  /**
   * Detecta si hay una persona en el frame
   * @param {Array} segmentation - Resultado de segmentación
   * @param {Number} threshold - Umbral mínimo de porcentaje (default: 5%)
   * @returns {Boolean}
   */
  hasPersonInFrame(segmentation, threshold = 5) {
    const percentage = this.calculatePersonPercentage(segmentation);
    return percentage >= threshold;
  }

  /**
   * Libera recursos
   */
  dispose() {
    if (this.segmenter) {
      this.segmenter.dispose();
      this.segmenter = null;
    }
    this.isInitialized = false;
    console.log('PersonSegmenter recursos liberados');
  }

  /**
   * Verifica si el modelo está listo
   */
  isReady() {
    return this.isInitialized && this.segmenter !== null;
  }
}

// Exportar una instancia singleton si se desea
export default new PersonSegmenter();
