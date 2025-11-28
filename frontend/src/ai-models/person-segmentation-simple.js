/**
 * VERSIÓN SIMPLIFICADA - SIN SEGMENTACIÓN
 * La segmentación es opcional y causa muchos problemas
 */

export class PersonSegmenter {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    // Simular inicialización exitosa sin cargar modelo real
    console.log('⚠️ Segmentación deshabilitada (opcional)');
    this.isInitialized = true;
    return true;
  }

  async segment(input) {
    // No hace nada, es opcional
    return null;
  }

  async drawSegmentation(segmentation, ctx, canvas, mode = 'mask') {
    // No hace nada, es opcional
    return;
  }

  dispose() {
    this.isInitialized = false;
  }

  isReady() {
    return this.isInitialized;
  }
}

export default new PersonSegmenter();
