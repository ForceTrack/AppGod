/**
 * PÁGINA WEB PRINCIPAL (FRONTEND)
 * 
 * Componente principal de React que integra todos los módulos de IA
 * Maneja la cámara, selección de ejercicios, y visualización en tiempo real
 */

import React, { useState, useRef } from 'react';
import './styles/App.css';
import VideoCapture from './components/VideoCapture';
import ExerciseSelector from './components/ExerciseSelector';
import StatsPanel from './components/StatsPanel';
import ResultsPanel from './components/ResultsPanel';
import SplashScreen from './components/SplashScreen';

function App() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stats, setStats] = useState({
    repetitions: 0,
    formScore: 0,
    currentPhase: 'idle',
    framesAnalyzed: 0
  });
  const [results, setResults] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState({
    pose: false,
    segmentation: false,
    analyzer: true // Analyzer no requiere carga
  });
  const [cameraReady, setCameraReady] = useState(false);

  const videoCaptureRef = useRef(null);

  // Manejar actualización de estadísticas
  const handleStatsUpdate = (newStats) => {
    setStats(newStats);
  };

  // Manejar resultados finales
  const handleResultsGenerated = (finalResults) => {
    setResults(finalResults);
    setIsRecording(false);
  };

  // Manejar estado de carga de modelos
  const handleModelsLoaded = (loadedModels) => {
    setModelsLoaded(prev => ({ ...prev, ...loadedModels }));
  };

  // Iniciar grabación
  const handleStartRecording = () => {
    if (!selectedExercise) {
      alert('Por favor selecciona un ejercicio primero');
      return;
    }

    if (videoCaptureRef.current) {
      videoCaptureRef.current.startRecording();
      setIsRecording(true);
      setResults(null);
      setStats({
        repetitions: 0,
        formScore: 0,
        currentPhase: 'idle',
        framesAnalyzed: 0
      });
    }
  };

  // Detener grabación
  const handleStopRecording = () => {
    if (videoCaptureRef.current) {
      videoCaptureRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  // Verificar si al menos el analyzer está cargado (mínimo para funcionar)
  const analyzerReady = modelsLoaded.analyzer;
  const allModelsLoaded = modelsLoaded.pose && modelsLoaded.segmentation && modelsLoaded.analyzer;
  const isSystemReady = allModelsLoaded && cameraReady;

  return (
    <div className="app">
      <SplashScreen isLoaded={isSystemReady} />

      {/* Header */}
      <header className="header">
        <h1>ForceTrack</h1>
      </header>

      {/* Alerta si los modelos no están cargados */}
      {!analyzerReady && (
        <div className="alert alert-warning">
          <div>
            <strong>Inicializando sistema...</strong>
            <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
              Esto solo toma unos segundos. Versión offline (sin descargas).
            </div>
          </div>
        </div>
      )}

      {/* Alerta en modo offline */}
      {/* Alerta en modo offline */}
      {analyzerReady && !allModelsLoaded && (
        <div className="alert alert-info">
          <div>
            <strong>Modo Offline Activo</strong>
            <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
              Sistema funcionando sin descargas de internet. La visualización de esqueleto está deshabilitada pero todas las métricas funcionan.
            </div>
          </div>
        </div>
      )}

      {/* Alerta en modo online */}
      {allModelsLoaded && (
        <div className="alert alert-success" style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
          <div>
            <strong>Sistema Listo (IA Activa)</strong>
            <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
              Todos los modelos de IA cargados correctamente. Visualización de esqueleto habilitada.
            </div>
          </div>
        </div>
      )}

      {/* Selector de ejercicios */}
      <ExerciseSelector
        selectedExercise={selectedExercise}
        onSelectExercise={setSelectedExercise}
        disabled={isRecording}
      />

      {/* Controles principales */}
      <div className="exercise-selector">
        <div className="controls">
          {!isRecording ? (
            <button
              className="btn btn-primary"
              onClick={handleStartRecording}
              disabled={!selectedExercise || !analyzerReady}
              title={!analyzerReady ? 'Esperando que cargue el analizador...' : ''}
            >
              Iniciar Ejercicio
            </button>
          ) : (
            <button
              className="btn btn-danger"
              onClick={handleStopRecording}
            >
              Detener y Analizar
            </button>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="main-content">
        {/* Video y captura */}
        <VideoCapture
          ref={videoCaptureRef}
          selectedExercise={selectedExercise}
          isRecording={isRecording}
          onStatsUpdate={handleStatsUpdate}
          onResultsGenerated={handleResultsGenerated}
          onModelsLoaded={handleModelsLoaded}
          onCameraReady={setCameraReady}
        />

        {/* Panel de estadísticas en tiempo real */}
        <StatsPanel
          stats={stats}
          isRecording={isRecording}
          exercise={selectedExercise}
        />
      </div>

      {/* Panel de resultados */}
      {results && (
        <ResultsPanel
          results={results}
          exercise={selectedExercise}
        />
      )}

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '40px', opacity: 0.7 }}>
        <p>ForceTrack v1.0 - AI Edition</p>
        <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>
          Sistema de análisis de ejercicios con IA en tiempo real
        </p>
      </footer>
    </div>
  );
}

export default App;
