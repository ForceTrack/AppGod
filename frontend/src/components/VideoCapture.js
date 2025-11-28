/**
 * Componente de captura de video y visualización
 * Integra los módulos de IA de forma independiente
 */

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

// Simulación offline mejorada (sin descargas)
let PoseDetector, PersonSegmenter, ExerciseAnalyzer;
let modelsAvailable = false;

try {
  // Usar modelos reales de IA
  const poseModule = require('../ai-models/pose-detection');
  const segmentModule = require('../ai-models/person-segmentation');
  const analyzerModule = require('../ai-models/exercise-analyzer');

  PoseDetector = poseModule.PoseDetector;
  PersonSegmenter = segmentModule.PersonSegmenter;
  ExerciseAnalyzer = analyzerModule.ExerciseAnalyzer;
  modelsAvailable = true;
  console.log('✅ Módulos cargados (TensorFlow.js + MediaPipe)');
} catch (error) {
  console.error('❌ Error crítico cargando módulos:', error);
  modelsAvailable = false;
}

const VideoCapture = forwardRef(({
  selectedExercise,
  isRecording,
  onStatsUpdate,
  onResultsGenerated,
  onModelsLoaded,
  onCameraReady
}, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [modelsInitialized, setModelsInitialized] = useState(false);
  const [modelStatus, setModelStatus] = useState('checking');

  // Instancias de los modelos
  const poseDetectorRef = useRef(null);
  const personSegmenterRef = useRef(null);
  const exerciseAnalyzerRef = useRef(null);
  const animationRef = useRef(null);

  // Inicializar cámara
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setError(null);
          if (onCameraReady) onCameraReady(true);
        }
      } catch (err) {
        console.error('Error al acceder a la cámara:', err);
        setError('No se pudo acceder a la cámara. Verifica los permisos.');
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Inicializar modelos de IA (solo una vez)
  const initializingRef = useRef(false);
  useEffect(() => {
    if (modelsInitialized || initializingRef.current) return; // Evitar reinicios múltiples
    initializingRef.current = true;

    const initModels = async () => {
      setModelStatus('checking');

      if (!modelsAvailable) {
        setModelStatus('unavailable');
        setError('Módulos de IA no disponibles. Funcionando en MODO DEMO sin detección.');
        setModelsInitialized(false);
        onModelsLoaded({ pose: false, segmentation: false, analyzer: false });
        console.log('Modo DEMO activado - la página funciona sin IA');
        initializingRef.current = false;
        return;
      }

      try {
        setModelStatus('loading');
        console.log('🚀 Inicializando (TensorFlow.js + MediaPipe)...');

        // Limpiar instancias previas (por seguridad)
        if (poseDetectorRef.current) poseDetectorRef.current.dispose();
        if (personSegmenterRef.current) personSegmenterRef.current.dispose();

        // Inicializar PoseDetector (Real)
        poseDetectorRef.current = new PoseDetector();
        await poseDetectorRef.current.initialize();
        onModelsLoaded({ pose: true });
        console.log('✅ Detector listo (MediaPipe)');

        // Inicializar PersonSegmenter (Real)
        personSegmenterRef.current = new PersonSegmenter();
        await personSegmenterRef.current.initialize();
        onModelsLoaded({ segmentation: true });
        console.log('✅ Segmentador listo (BodyPix)');

        // Inicializar ExerciseAnalyzer
        exerciseAnalyzerRef.current = new ExerciseAnalyzer();
        onModelsLoaded({ analyzer: true });
        console.log('✅ Analizador listo');

        setModelsInitialized(true);
        setModelStatus('ready');
        setError(null);
        setModelsInitialized(true);
        setModelStatus('ready');
        setError(null);
        console.log('✅ Sistema completamente listo (IA Activa)');
      } catch (err) {
        console.error('❌ Error inesperado:', err.message);
        setModelStatus('error');
        setError('Error al inicializar. Por favor recarga la página.');
        setModelsInitialized(false);
      } finally {
        initializingRef.current = false;
      }
    };

    initModels();

    return () => {
      if (poseDetectorRef.current) poseDetectorRef.current.dispose();
      if (personSegmenterRef.current) personSegmenterRef.current.dispose();
    };
  }, []); // Vacío: solo una vez

  // Loop de detección en tiempo real
  const detectFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isRecording) {
      animationRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const video = videoRef.current;

    // Verificar si el video está listo y tiene dimensiones válidas
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      animationRef.current = requestAnimationFrame(detectFrame);
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Ajustar tamaño del canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar video
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);



    // MODO DEMO - Si no hay modelos disponibles
    if (!modelsAvailable || modelStatus === 'unavailable' || !modelsInitialized) {
      // Dibujar indicador de modo demo
      ctx.fillStyle = 'rgba(255, 152, 0, 0.9)';
      ctx.fillRect(canvas.width / 2 - 250, canvas.height / 2 - 80, 500, 160);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🎭 MODO DEMO', canvas.width / 2, canvas.height / 2 - 20);

      ctx.font = '18px Arial';
      ctx.fillText('Módulos de IA no disponibles', canvas.width / 2, canvas.height / 2 + 20);
      ctx.fillText('La página funciona correctamente', canvas.width / 2, canvas.height / 2 + 50);

      onStatsUpdate({
        repetitions: 0,
        formScore: 0,
        currentPhase: 'Demo Mode',
        framesAnalyzed: 0
      });

      animationRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    try {
      // 1. Detección de pose (REAL)
      let poses = null;
      if (poseDetectorRef.current && poseDetectorRef.current.isReady()) {
        poses = await poseDetectorRef.current.detectPose(canvas, selectedExercise || 'squat');

        // Dibujar esqueleto simulado (líneas amarillas)
        if (poses && poses.length > 0) {
          poseDetectorRef.current.drawSkeleton(poses, ctx);
        } else {
          // Feedback: No se detecta pose
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('⚠️ No se detecta cuerpo. Por favor aléjate de la cámara.', canvas.width / 2, canvas.height - 25);
        }
      }

      // 2. Segmentación (opcional, puede ser pesado)
      // if (personSegmenterRef.current && personSegmenterRef.current.isReady()) {
      //   const segmentation = await personSegmenterRef.current.segment(video);
      //   // Dibujar segmentación si se desea
      // }

      // 3. Análisis de ejercicio
      if (exerciseAnalyzerRef.current && poses && poses.length > 0) {
        const frameData = exerciseAnalyzerRef.current.analyzeFrame(poses);

        if (frameData && !frameData.error) {
          // Actualizar estadísticas en tiempo real
          onStatsUpdate({
            repetitions: frameData.repetitions,
            formScore: frameData.formScore,
            currentPhase: frameData.phase,
            framesAnalyzed: frameData.frameNumber
          });

          // Dibujar información en el canvas
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.fillRect(10, 10, 280, 130);

          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 3;
          ctx.strokeRect(10, 10, 280, 130);

          ctx.fillStyle = '#4ade80';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(`Repeticiones: ${frameData.repetitions}`, 25, 45);
          ctx.fillText(`Forma: ${frameData.formScore}/100`, 25, 80);
          ctx.fillText(`Fase: ${frameData.phase}`, 25, 115);
        }
      }

    } catch (err) {
      console.error('Error en detección:', err);
      // Dibujar error en canvas
      ctx.fillStyle = 'rgba(244, 67, 54, 0.9)';
      ctx.fillRect(10, 10, canvas.width - 20, 80);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Error en procesamiento', canvas.width / 2, 50);
    }

    animationRef.current = requestAnimationFrame(detectFrame);
  };

  // Iniciar/detener loop de detección
  useEffect(() => {
    if (isRecording && modelsInitialized) {
      animationRef.current = requestAnimationFrame(detectFrame);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, modelsInitialized]);

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    startRecording: () => {
      if (exerciseAnalyzerRef.current && selectedExercise) {
        exerciseAnalyzerRef.current.startExercise(selectedExercise);
      }
    },
    stopRecording: async () => {
      if (exerciseAnalyzerRef.current) {
        const report = exerciseAnalyzerRef.current.finishExercise();

        // Intentar obtener feedback de OpenAI
        try {
          const openAIData = exerciseAnalyzerRef.current.prepareForOpenAI();
          const response = await axios.post('http://localhost:3001/api/analyze', openAIData);

          report.aiFeedback = response.data.feedback;
        } catch (err) {
          console.error('Error al obtener feedback de IA:', err);
          report.aiFeedback = 'No se pudo generar feedback automático. El análisis local está completo.';
        }

        onResultsGenerated(report);
        exerciseAnalyzerRef.current.reset();
      }
    }
  }));

  return (
    <div className="video-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className="video-element"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="canvas-element"
        />

        {/* Indicadores de estado */}
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 100
        }}>
          <div style={{
            padding: '10px 15px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
            backgroundColor: modelStatus === 'ready' ? 'rgba(76, 175, 80, 0.95)' :
              modelStatus === 'loading' ? 'rgba(255, 193, 7, 0.95)' :
                modelStatus === 'basic' ? 'rgba(33, 150, 243, 0.95)' :
                  modelStatus === 'partial' ? 'rgba(33, 150, 243, 0.95)' :
                    modelStatus === 'unavailable' ? 'rgba(255, 152, 0, 0.95)' :
                      'rgba(244, 67, 54, 0.95)',
            color: modelStatus === 'loading' ? '#000' : '#fff'
          }}>
            {modelStatus === 'checking' && 'Verificando modelos...'}
            {modelStatus === 'loading' && 'Cargando IA... (máx 15 seg)'}
            {modelStatus === 'ready' && 'IA Lista'}
            {modelStatus === 'basic' && 'Modo Básico'}
            {modelStatus === 'partial' && 'Modo Limitado'}
            {modelStatus === 'unavailable' && 'Modo Demo'}
            {modelStatus === 'error' && 'Modo Básico Activo'}
          </div>
        </div>

        {error && (
          <div className="video-placeholder">
            <div className="alert alert-error">
              {error}
            </div>
          </div>
        )}

        {!stream && !error && (
          <div className="video-placeholder">
            <p>Cargando cámara...</p>
          </div>
        )}
      </div>

      {modelStatus === 'loading' && stream && (
        <div className="loading" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.9)',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '15px', fontSize: '16px' }}>Cargando modelos de IA...</p>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>Esto puede tardar unos segundos</p>
        </div>
      )}
    </div>
  );
});

export default VideoCapture;
