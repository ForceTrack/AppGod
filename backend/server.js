/**
 * BACKEND SERVER - Integración con OpenAI
 * 
 * Servidor Express que recibe datos de ejercicios y genera
 * feedback personalizado usando OpenAI API
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Verificar que existe la API key
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️ ADVERTENCIA: OPENAI_API_KEY no está configurada en el archivo .env');
  console.warn('El servidor funcionará pero no podrá generar feedback con IA');
}

// Inicializar cliente de OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend de Reni funcionando',
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Ruta principal para análisis con OpenAI
app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt, metadata } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt es requerido' 
      });
    }

    // Si no hay API key, devolver feedback genérico
    if (!openai) {
      console.log('Generando feedback sin OpenAI (API key no configurada)');
      const genericFeedback = generateGenericFeedback(metadata);
      return res.json({ 
        feedback: genericFeedback,
        source: 'generic'
      });
    }

    // Generar feedback con OpenAI
    console.log('Generando feedback con OpenAI para:', metadata.exercise);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Puedes usar "gpt-4" si tienes acceso
      messages: [
        {
          role: "system",
          content: `Eres un entrenador personal profesional y motivador. 
          Analizas el rendimiento de ejercicios físicos y proporcionas feedback constructivo, 
          específico y alentador. Usa un tono amigable pero profesional. 
          Enfócate en aspectos prácticos y accionables.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const feedback = completion.choices[0].message.content;

    res.json({ 
      feedback,
      source: 'openai',
      metadata
    });

  } catch (error) {
    console.error('Error al generar feedback:', error);
    
    // Si falla OpenAI, devolver feedback genérico
    const genericFeedback = generateGenericFeedback(req.body.metadata);
    
    res.json({ 
      feedback: genericFeedback,
      source: 'generic_fallback',
      error: 'Error al contactar OpenAI, se generó feedback alternativo'
    });
  }
});

// Función para generar feedback genérico sin IA
function generateGenericFeedback(metadata) {
  const { exercise, repetitions, averageScore } = metadata;

  const exerciseNames = {
    squat: 'Sentadillas',
    pushup: 'Flexiones',
    plank: 'Plancha',
    deadlift: 'Peso Muerto'
  };

  const exerciseName = exerciseNames[exercise] || 'Ejercicio';

  let feedback = `**Resumen de tu sesión de ${exerciseName}**\n\n`;

  // Evaluación de puntuación
  if (averageScore >= 80) {
    feedback += `🌟 **¡Excelente trabajo!** Tu puntuación promedio de ${averageScore}/100 demuestra una técnica sólida.\n\n`;
  } else if (averageScore >= 60) {
    feedback += `👍 **Buen esfuerzo.** Con una puntuación de ${averageScore}/100, vas por buen camino. Hay algunos aspectos que mejorar.\n\n`;
  } else {
    feedback += `💪 **Sigue trabajando.** Una puntuación de ${averageScore}/100 indica que necesitas ajustar tu técnica. ¡No te desanimes, todos empezamos desde algún lugar!\n\n`;
  }

  // Evaluación de repeticiones
  if (repetitions > 0) {
    feedback += `Completaste **${repetitions} repeticiones**. `;
    if (repetitions >= 10) {
      feedback += `¡Impresionante resistencia!\n\n`;
    } else if (repetitions >= 5) {
      feedback += `Buen comienzo. Intenta aumentar gradualmente.\n\n`;
    } else {
      feedback += `Comienza con pocas repeticiones es perfecto. La calidad es más importante que la cantidad.\n\n`;
    }
  }

  // Consejos generales por ejercicio
  const tips = {
    squat: `**Consejos para Sentadillas:**
- Mantén los pies a la anchura de los hombros
- Baja hasta que tus muslos estén paralelos al suelo
- Mantén la espalda recta y el pecho arriba
- Las rodillas no deben pasar las puntas de los pies`,

    pushup: `**Consejos para Flexiones:**
- Mantén el cuerpo en línea recta
- Los codos deben formar un ángulo de 45° con el cuerpo
- Baja hasta que el pecho casi toque el suelo
- Mantén el core activado todo el tiempo`,

    plank: `**Consejos para Plancha:**
- Mantén una línea recta desde cabeza hasta talones
- No dejes caer las caderas
- Mantén el core bien contraído
- Respira de manera constante`,

    deadlift: `**Consejos para Peso Muerto:**
- Mantén la espalda neutral y recta
- Empuja las caderas hacia atrás
- Las rodillas deben estar ligeramente flexionadas
- Levanta con las piernas, no con la espalda`
  };

  feedback += `\n${tips[exercise] || ''}\n\n`;

  feedback += `**Próximos pasos:**
1. Revisa las áreas de mejora identificadas
2. Practica frente a un espejo para autocorregirte
3. Aumenta las repeticiones gradualmente
4. Mantén la constancia - la técnica mejora con la práctica

¡Sigue así! 💪`;

  return feedback;
}

// Ruta para guardar historial (opcional, para futuras mejoras)
app.post('/api/save-session', async (req, res) => {
  try {
    const { userId, sessionData } = req.body;
    
    // Aquí podrías guardar en una base de datos
    // Por ahora solo devolvemos confirmación
    
    console.log('Sesión guardada para usuario:', userId);
    
    res.json({ 
      success: true,
      message: 'Sesión guardada correctamente',
      sessionId: Date.now()
    });

  } catch (error) {
    console.error('Error al guardar sesión:', error);
    res.status(500).json({ 
      error: 'Error al guardar la sesión' 
    });
  }
});

// Ruta para obtener historial (opcional, para futuras mejoras)
app.get('/api/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Aquí podrías consultar una base de datos
    // Por ahora devolvemos array vacío
    
    res.json({ 
      sessions: [],
      message: 'Historial no implementado aún'
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ 
      error: 'Error al obtener el historial' 
    });
  }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend de Reni iniciado en http://localhost:${PORT}`);
  console.log(`📊 Estado de OpenAI: ${openai ? '✅ Configurado' : '⚠️ No configurado'}`);
  console.log(`\n💡 Para configurar OpenAI:`);
  console.log(`   1. Crea un archivo .env en la carpeta backend`);
  console.log(`   2. Agrega: OPENAI_API_KEY=tu_clave_aqui`);
  console.log(`\n🔗 Endpoints disponibles:`);
  console.log(`   GET  /api/health - Estado del servidor`);
  console.log(`   POST /api/analyze - Análisis con IA`);
  console.log(`   POST /api/save-session - Guardar sesión`);
  console.log(`   GET  /api/history/:userId - Obtener historial\n`);
});

module.exports = app;
