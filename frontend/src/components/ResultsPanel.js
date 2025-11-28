/**
 * Panel de resultados finales
 */

import React from 'react';

function ResultsPanel({ results, exercise }) {
  if (!results) return null;

  const getExerciseName = (exerciseId) => {
    const names = {
      squat: 'Sentadillas',
      pushup: 'Flexiones',
      plank: 'Plancha',
      deadlift: 'Peso Muerto'
    };
    return names[exerciseId] || 'Ejercicio';
  };

  const scoreColor = (score) => {
    if (score >= 80) return '#4ade80';
    if (score >= 60) return '#fbbf24';
    return '#ef4444';
  };

  return (
    <div className="results-panel">
      <h2>Resultados del Ejercicio</h2>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '10px' }}>{results.exercise}</h3>
        <p style={{ opacity: 0.8 }}>{new Date(results.timestamp).toLocaleString('es')}</p>
      </div>

      {/* Puntuación principal */}
      <div 
        className="score-circle" 
        style={{ '--score': results.averageFormScore }}
      >
        <div className="score-value" style={{ color: scoreColor(results.averageFormScore) }}>
          {results.averageFormScore}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h3>Puntuación Promedio de Forma</h3>
      </div>

      {/* Métricas rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div className="stat-item">
          <h3>Repeticiones</h3>
          <div className="value" style={{ fontSize: '1.8rem' }}>{results.repetitions}</div>
        </div>
        
        {results.totalTime && (
          <div className="stat-item">
            <h3>Tiempo Total</h3>
            <div className="value" style={{ fontSize: '1.8rem' }}>{results.totalTime}s</div>
          </div>
        )}

        <div className="stat-item">
          <h3>Frames Analizados</h3>
          <div className="value" style={{ fontSize: '1.2rem' }}>{results.totalFrames}</div>
        </div>
      </div>

      {/* Errores comunes */}
      {results.commonErrors && results.commonErrors.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '15px' }}>Áreas de Mejora</h3>
          <ul className="error-list">
            {results.commonErrors.map((error, index) => (
              <li key={index} className="error-item">
                <strong>{error.angle.toUpperCase()} - {error.frequency}</strong>
                <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                  {error.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {results.commonErrors && results.commonErrors.length === 0 && (
        <div className="alert alert-info">
          <span>¡Excelente! No se detectaron errores significativos en tu forma.</span>
        </div>
      )}

      {/* Feedback de IA */}
      {results.aiFeedback && (
        <div className="ai-feedback">
          <h3 style={{ marginBottom: '15px' }}>
            Feedback del Entrenador IA
          </h3>
          <p style={{ whiteSpace: 'pre-line' }}>
            {results.aiFeedback}
          </p>
        </div>
      )}

      {!results.aiFeedback && (
        <div className="alert alert-warning" style={{ marginTop: '20px' }}>
          <span>No se pudo generar feedback de IA. Asegúrate de que el backend esté corriendo.</span>
        </div>
      )}

      {/* Botón para descargar datos */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          className="btn btn-secondary"
          onClick={() => {
            const dataStr = JSON.stringify(results, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileDefaultName = `reni-${exercise}-${Date.now()}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
          }}
        >
          Descargar Datos Completos
        </button>
      </div>
    </div>
  );
}

export default ResultsPanel;
