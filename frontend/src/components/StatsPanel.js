/**
 * Panel de estadísticas en tiempo real
 */

import React from 'react';

function StatsPanel({ stats, isRecording, exercise }) {
  const getExerciseName = (exerciseId) => {
    const names = {
      squat: 'Sentadillas',
      pushup: 'Flexiones',
      plank: 'Plancha',
      deadlift: 'Peso Muerto'
    };
    return names[exerciseId] || 'Ninguno';
  };

  const getPhaseLabel = (phase) => {
    const labels = {
      standing: 'De Pie',
      descending: 'Bajando',
      bottom: 'Abajo',
      ascending: 'Subiendo',
      up: 'Arriba',
      holding: 'Manteniendo',
      idle: 'Inactivo',
      unknown: 'Desconocido'
    };
    return labels[phase] || phase;
  };

  return (
    <div className="stats-panel">
      <h2>
        <span className={`status-indicator ${isRecording ? 'active' : 'inactive'}`}></span>
        Estadísticas en Tiempo Real
      </h2>

      <div className="stat-item">
        <h3>Ejercicio Actual</h3>
        <div className="value" style={{ fontSize: '1.5rem' }}>
          {exercise ? getExerciseName(exercise) : 'Ninguno'}
        </div>
      </div>

      <div className="stat-item">
        <h3>Repeticiones</h3>
        <div className="value">{stats.repetitions}</div>
        <div className="label">Completadas</div>
      </div>

      <div className="stat-item">
        <h3>Calidad de Forma</h3>
        <div className="value">{stats.formScore}</div>
        <div className="label">de 100</div>
      </div>

      <div className="stat-item">
        <h3>Fase Actual</h3>
        <div className="value" style={{ fontSize: '1.5rem' }}>
          {getPhaseLabel(stats.currentPhase)}
        </div>
      </div>

      <div className="stat-item">
        <h3>Frames Analizados</h3>
        <div className="value" style={{ fontSize: '1.2rem' }}>
          {stats.framesAnalyzed}
        </div>
        <div className="label">Total procesados</div>
      </div>

      {!isRecording && (
        <div className="alert alert-info" style={{ marginTop: '20px' }}>
          <span>Selecciona un ejercicio e inicia para ver estadísticas</span>
        </div>
      )}
    </div>
  );
}

export default StatsPanel;
