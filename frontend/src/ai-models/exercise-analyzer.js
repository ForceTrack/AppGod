/**
 * MÓDULO 4: ANALIZADOR DE EJERCICIOS
 * 
 * Este módulo analiza ejercicios en tiempo real, compara con referencias,
 * calcula métricas y prepara datos para OpenAI.
 * 
 * Puede funcionar de forma independiente.
 */

export class ExerciseAnalyzer {
  constructor() {
    this.currentExercise = null;
    this.exerciseData = [];
    this.frameCount = 0;
    this.repetitionCount = 0;
    this.isInRepetition = false;
    this.lastPhase = null;
    
    // Definición de ejercicios con rangos ideales
    this.exerciseDefinitions = {
      squat: {
        name: 'Sentadilla',
        keyAngles: {
          hip: { min: 80, max: 120, ideal: 90 },
          knee: { min: 80, max: 120, ideal: 90 },
          ankle: { min: 65, max: 90, ideal: 75 }
        },
        keypoints: {
          hip: ['left_hip', 'left_knee', 'left_shoulder'],
          knee: ['left_hip', 'left_knee', 'left_ankle'],
          ankle: ['left_knee', 'left_ankle', 'left_heel']
        },
        phases: ['standing', 'descending', 'bottom', 'ascending']
      },
      pushup: {
        name: 'Flexión',
        keyAngles: {
          elbow: { min: 70, max: 110, ideal: 90 },
          shoulder: { min: 60, max: 100, ideal: 80 },
          back: { min: 160, max: 180, ideal: 170 }
        },
        keypoints: {
          elbow: ['left_shoulder', 'left_elbow', 'left_wrist'],
          shoulder: ['left_hip', 'left_shoulder', 'left_elbow'],
          back: ['left_hip', 'left_shoulder', 'nose']
        },
        phases: ['up', 'descending', 'bottom', 'ascending']
      },
      plank: {
        name: 'Plancha',
        keyAngles: {
          back: { min: 160, max: 180, ideal: 170 },
          hip: { min: 160, max: 180, ideal: 170 },
          shoulder: { min: 80, max: 100, ideal: 90 }
        },
        keypoints: {
          back: ['left_hip', 'left_shoulder', 'left_elbow'],
          hip: ['left_knee', 'left_hip', 'left_shoulder'],
          shoulder: ['left_hip', 'left_shoulder', 'left_elbow']
        },
        phases: ['holding']
      },
      deadlift: {
        name: 'Peso Muerto',
        keyAngles: {
          back: { min: 160, max: 180, ideal: 170 },
          hip: { min: 80, max: 140, ideal: 110 },
          knee: { min: 150, max: 180, ideal: 165 }
        },
        keypoints: {
          back: ['left_hip', 'left_shoulder', 'nose'],
          hip: ['left_knee', 'left_hip', 'left_shoulder'],
          knee: ['left_ankle', 'left_knee', 'left_hip']
        },
        phases: ['standing', 'descending', 'bottom', 'ascending']
      }
    };
  }

  /**
   * Inicia el análisis de un ejercicio
   * @param {String} exerciseName - Nombre del ejercicio (squat, pushup, plank, deadlift)
   */
  startExercise(exerciseName) {
    if (!this.exerciseDefinitions[exerciseName]) {
      throw new Error(`Ejercicio no reconocido: ${exerciseName}`);
    }

    this.currentExercise = exerciseName;
    this.exerciseData = [];
    this.frameCount = 0;
    this.repetitionCount = 0;
    this.isInRepetition = false;
    this.lastPhase = null;

    console.log(`✅ Iniciado análisis de: ${this.exerciseDefinitions[exerciseName].name}`);
  }

  /**
   * Analiza un frame del ejercicio
   * @param {Array} poses - Poses detectadas en el frame
   * @returns {Object} Métricas del frame actual
   */
  analyzeFrame(poses) {
    if (!this.currentExercise) {
      console.warn('⚠️ No hay ejercicio activo. Usa startExercise() primero.');
      return null;
    }

    if (!poses || poses.length === 0) {
      return { error: 'No se detectó persona en el frame' };
    }

    const pose = poses[0]; // Tomar la primera persona detectada
    const definition = this.exerciseDefinitions[this.currentExercise];

    // DEBUG: Verificar si tiene keypoints
    if (!pose.keypoints || pose.keypoints.length === 0) {
      console.error('❌ Pose sin keypoints:', pose);
      return { error: 'Pose sin keypoints' };
    }

    // Calcular ángulos actuales
    const currentAngles = {};
    const angleDeviations = {};
    let totalDeviation = 0;
    let angleCount = 0;

    for (const [angleName, angleConfig] of Object.entries(definition.keyAngles)) {
      const keypointNames = definition.keypoints[angleName];
      const angle = this.calculateAngleFromKeypoints(pose, keypointNames);

      if (angle !== null) {
        currentAngles[angleName] = angle;
        
        // Calcular desviación del ángulo ideal
        const deviation = Math.abs(angle - angleConfig.ideal);
        angleDeviations[angleName] = deviation;
        totalDeviation += deviation;
        angleCount++;

        // Verificar si está fuera del rango aceptable
        if (angle < angleConfig.min || angle > angleConfig.max) {
          angleDeviations[angleName + '_status'] = 'fuera_de_rango';
        } else {
          angleDeviations[angleName + '_status'] = 'correcto';
        }
      }
    }

    // Calcular puntuación de forma (0-100)
    const formScore = angleCount > 0 
      ? Math.max(0, 100 - (totalDeviation / angleCount) * 2) 
      : 0;

    // Detectar fase del ejercicio
    const phase = this.detectPhase(currentAngles);
    
    // Detectar repeticiones
    if (phase !== this.lastPhase) {
      if (this.currentExercise === 'plank') {
        // Plancha: frameCount usado como aproximación de tiempo
        this.frameCount++;
      } else {
        // Definir fase final que representa una repetición completa
        const completionPhaseMap = {
          squat: 'standing',
          deadlift: 'standing',
          pushup: 'up'
        };
        const completionPhase = completionPhaseMap[this.currentExercise];
        if (completionPhase && phase === completionPhase && this.lastPhase === 'ascending') {
          this.repetitionCount++;
          console.log(`Repetición completada (${this.currentExercise}): ${this.repetitionCount}`);
        }
      }
      this.lastPhase = phase;
    }

    // Crear registro del frame
    const frameData = {
      frameNumber: this.frameCount++,
      timestamp: Date.now(),
      angles: currentAngles,
      deviations: angleDeviations,
      formScore: formScore.toFixed(2),
      phase: phase,
      repetitions: this.repetitionCount
    };

    // Guardar datos
    this.exerciseData.push(frameData);

    return frameData;
  }

  /**
   * Calcula un ángulo desde nombres de keypoints
   * @param {Object} pose - Pose detectada
   * @param {Array} keypointNames - Array de 3 nombres de keypoints
   * @returns {Number} Ángulo en grados
   */
  calculateAngleFromKeypoints(pose, keypointNames) {
    if (!pose || !keypointNames || keypointNames.length !== 3) {
      return null;
    }

    const keypoints = pose.keypoints;
    const kp1 = keypoints.find(kp => kp.name === keypointNames[0]);
    const kp2 = keypoints.find(kp => kp.name === keypointNames[1]);
    const kp3 = keypoints.find(kp => kp.name === keypointNames[2]);

    if (!kp1 || !kp2 || !kp3 || kp1.score < 0.3 || kp2.score < 0.3 || kp3.score < 0.3) {
      return null;
    }

    return this.calculateAngle(kp1, kp2, kp3);
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
   * Detecta la fase actual del ejercicio basado en los ángulos
   * @param {Object} angles - Ángulos actuales
   * @returns {String} Fase del ejercicio
   */
  detectPhase(angles) {
    const definition = this.exerciseDefinitions[this.currentExercise];
    
    if (this.currentExercise === 'plank') {
      return 'holding';
    }

    // Lógica para sentadilla y peso muerto
    if (this.currentExercise === 'squat' || this.currentExercise === 'deadlift') {
      const kneeAngle = angles.knee || 180;
      
      if (kneeAngle > 150) return 'standing';
      if (kneeAngle < 100) return 'bottom';
      if (this.lastPhase === 'standing' || this.lastPhase === 'descending') return 'descending';
      return 'ascending';
    }

    // Lógica para flexiones
    if (this.currentExercise === 'pushup') {
      const elbowAngle = angles.elbow || 180;
      
      if (elbowAngle > 150) return 'up';
      if (elbowAngle < 100) return 'bottom';
      if (this.lastPhase === 'up' || this.lastPhase === 'descending') return 'descending';
      return 'ascending';
    }

    return 'unknown';
  }

  /**
   * Finaliza el análisis y genera un reporte completo
   * @returns {Object} Reporte completo del ejercicio
   */
  finishExercise() {
    if (!this.currentExercise) {
      return { error: 'No hay ejercicio activo' };
    }

    // Calcular estadísticas
    const avgFormScore = this.exerciseData.reduce((sum, frame) => 
      sum + parseFloat(frame.formScore), 0) / this.exerciseData.length;

    // Identificar errores comunes
    const commonErrors = this.identifyCommonErrors();

    // Calcular tiempo total (para plancha)
    const totalTime = this.currentExercise === 'plank' 
      ? (this.frameCount / 30).toFixed(1) // Asumiendo 30 fps
      : null;

    const report = {
      exercise: this.exerciseDefinitions[this.currentExercise].name,
      exerciseType: this.currentExercise,
      repetitions: this.repetitionCount,
      totalTime: totalTime,
      averageFormScore: avgFormScore.toFixed(2),
      totalFrames: this.frameCount,
      commonErrors: commonErrors,
      detailedData: this.exerciseData,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Reporte de ejercicio generado:', report);
    return report;
  }

  /**
   * Identifica errores comunes durante el ejercicio
   * @returns {Array} Lista de errores encontrados
   */
  identifyCommonErrors() {
    const errors = [];
    const definition = this.exerciseDefinitions[this.currentExercise];

    // Analizar cada ángulo
    for (const [angleName, angleConfig] of Object.entries(definition.keyAngles)) {
      const deviationKey = angleName + '_status';
      const outOfRangeCount = this.exerciseData.filter(frame => 
        frame.deviations[deviationKey] === 'fuera_de_rango'
      ).length;

      const percentage = (outOfRangeCount / this.exerciseData.length) * 100;

      if (percentage > 30) { // Si más del 30% de los frames tienen error
        errors.push({
          angle: angleName,
          frequency: percentage.toFixed(1) + '%',
          description: this.getErrorDescription(this.currentExercise, angleName)
        });
      }
    }

    return errors;
  }

  /**
   * Obtiene descripción de un error específico
   * @param {String} exercise - Tipo de ejercicio
   * @param {String} angleName - Nombre del ángulo problemático
   * @returns {String} Descripción del error
   */
  getErrorDescription(exercise, angleName) {
    const descriptions = {
      squat: {
        knee: 'Rodillas no alcanzan el ángulo adecuado. Baja más o revisa tu postura.',
        hip: 'Caderas muy altas o muy bajas. Ajusta la profundidad.',
        ankle: 'Tobillos con ángulo incorrecto. Revisa la posición de tus pies.'
      },
      pushup: {
        elbow: 'Codos no flexionan lo suficiente. Baja más el pecho.',
        shoulder: 'Hombros desalineados. Mantén los brazos a 45° del cuerpo.',
        back: 'Espalda no está recta. Mantén core activado.'
      },
      plank: {
        back: 'Espalda curvada. Mantén línea recta desde cabeza a talones.',
        hip: 'Caderas muy altas o muy bajas. Alinea tu cuerpo.',
        shoulder: 'Hombros desalineados con los codos.'
      },
      deadlift: {
        back: 'Espalda encorvada. Mantén espalda neutral y recta.',
        hip: 'Movimiento de cadera incorrecto. Empuja caderas hacia atrás.',
        knee: 'Rodillas muy flexionadas. Mantén piernas casi rectas.'
      }
    };

    return descriptions[exercise]?.[angleName] || 'Error en la forma del ejercicio';
  }

  /**
   * Prepara datos para enviar a OpenAI
   * @returns {Object} Datos formateados para OpenAI
   */
  prepareForOpenAI() {
    const report = this.finishExercise();

    return {
      prompt: `Analiza el siguiente rendimiento de ejercicio y proporciona feedback constructivo:
      
Ejercicio: ${report.exercise}
Repeticiones completadas: ${report.repetitions}
Puntuación promedio de forma: ${report.averageFormScore}/100
${report.totalTime ? `Tiempo total: ${report.totalTime} segundos` : ''}

Errores comunes detectados:
${report.commonErrors.map(err => `- ${err.angle}: ${err.description} (${err.frequency} del tiempo)`).join('\n')}

Por favor, proporciona:
1. Evaluación general del rendimiento
2. Puntos fuertes
3. Áreas de mejora específicas
4. Consejos prácticos para corregir los errores
5. Recomendaciones para la próxima sesión`,
      
      metadata: {
        exercise: report.exerciseType,
        repetitions: report.repetitions,
        averageScore: report.averageFormScore,
        totalFrames: report.totalFrames
      }
    };
  }

  /**
   * Obtiene estadísticas en tiempo real
   * @returns {Object} Estadísticas actuales
   */
  getCurrentStats() {
    return {
      exercise: this.currentExercise,
      repetitions: this.repetitionCount,
      currentPhase: this.lastPhase,
      framesAnalyzed: this.frameCount
    };
  }

  /**
   * Reinicia el analizador
   */
  reset() {
    this.currentExercise = null;
    this.exerciseData = [];
    this.frameCount = 0;
    this.repetitionCount = 0;
    this.isInRepetition = false;
    this.lastPhase = null;
    console.log('ExerciseAnalyzer reiniciado');
  }
}

// Exportar una instancia singleton
export default new ExerciseAnalyzer();
