/**
 * Componente selector de ejercicios
 */

import React from 'react';

const exercises = [
  {
    id: 'squat',
    name: 'Sentadillas',
    description: 'Fortalece piernas y glúteos'
  },
  {
    id: 'pushup',
    name: 'Flexiones',
    description: 'Trabaja pecho, brazos y core'
  },
  {
    id: 'plank',
    name: 'Plancha',
    description: 'Fortalece el core'
  },
  {
    id: 'deadlift',
    name: 'Peso Muerto',
    description: 'Espalda baja y piernas'
  }
];

function ExerciseSelector({ selectedExercise, onSelectExercise, disabled }) {
  return (
    <div className="exercise-selector">
      <h2>Selecciona un Ejercicio</h2>
      <div className="exercise-grid">
        {exercises.map(exercise => (
          <div
            key={exercise.id}
            className={`exercise-card ${selectedExercise === exercise.id ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onSelectExercise(exercise.id)}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
          >
            <h3>{exercise.name}</h3>
            <p>{exercise.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExerciseSelector;
