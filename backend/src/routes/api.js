// Rutas de la API REST - Aguas Sulfurosas de Jacintillo
// Generado por BackendAgent según specs/04-backend-api-spec.md

import { Router } from 'express';
import { SYSTEM_CONFIG } from '../config/constants.js';
import { db } from '../config/db.js';
import { fetchWeatherData, getTemporalHorizon } from '../services/weatherService.js';
import { calculateVisitorPrediction } from '../services/predictionEngine.js';
import { generateTravelAdvisory } from '../services/advisoryService.js';
import { authService } from '../services/authService.js';

export const apiRouter = Router();

// Regex para validar formato ISO 8601 (YYYY-MM-DD)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 1. GET /api/health
 * Estado del sistema, base de datos y conectividad
 */
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'online',
    uptime_seconds: process.uptime(),
    timestamp: new Date().toISOString(),
    database: db.isPostgres() ? 'connected (PostgreSQL)' : 'active (In-Memory Fallback)',
    location: `${SYSTEM_CONFIG.LOCATION.NAME} (${SYSTEM_CONFIG.LOCATION.COORDINATES.LATITUDE}, ${SYSTEM_CONFIG.LOCATION.COORDINATES.LONGITUDE})`,
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * 2. GET /api/predict?date=YYYY-MM-DD
 * Consulta el clima y calcula la estimación de personas para Aguas Sulfurosas
 */
apiRouter.get('/predict', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || !DATE_REGEX.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de fecha inválido. Debe utilizar YYYY-MM-DD (ej: 2026-09-27).'
      });
    }

    // Verificar si existe en caché de BD
    const cached = await db.getCachedPrediction(date);
    if (cached && cached.weather && cached.estimated_visitors) {
      const advisory = generateTravelAdvisory(cached.weather, {
        crowd_level: cached.crowd_level
      });
      const minV = Math.round(cached.estimated_visitors * 0.92);
      const maxV = Math.round(cached.estimated_visitors * 1.08);
      return res.json({
        success: true,
        cached: true,
        destination: SYSTEM_CONFIG.LOCATION,
        query_date: date,
        weather: cached.weather,
        prediction: {
          estimated_visitors: cached.estimated_visitors,
          confidence_interval: { min_visitors: minV, max_visitors: maxV },
          crowd_level: cached.crowd_level,
          occupancy_percentage: Number(((cached.estimated_visitors / SYSTEM_CONFIG.PREDICTION_MODEL.MAX_CAPACITY) * 100).toFixed(1)),
          theme_color: cached.crowd_level === 'Saturación' ? '#EF4444' : cached.crowd_level === 'Alta' ? '#F59E0B' : '#00f5d4',
          crowd_description: 'Afluencia calculada según factores meteorológicos registrados'
        },
        travel_advisory: advisory
      });
    }

    // 1. Obtener datos meteorológicos (Open-Meteo o Fallback Estacional)
    const weather = await fetchWeatherData(date);

    // 2. Calcular predicción matemática
    const prediction = calculateVisitorPrediction(date, weather);

    // 3. Generar recomendaciones de viaje
    const advisory = generateTravelAdvisory(weather, prediction);

    // 4. Guardar en caché asíncronamente
    db.saveCachedPrediction(date, weather, prediction.estimated_visitors, prediction.crowd_level, prediction.factors);

    // 5. Retornar payload normalizado según specs/04
    res.json({
      success: true,
      cached: false,
      destination: SYSTEM_CONFIG.LOCATION,
      query_date: date,
      weather,
      prediction,
      travel_advisory: advisory
    });
  } catch (error) {
    console.error('❌ [API /predict] Error procesando predicción:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno calculando la afluencia turística.'
    });
  }
});

/**
 * 3. GET /api/weekly-forecast
 * Retorna pronóstico y afluencia de los siguientes 7 días consecutivos
 */
apiRouter.get('/weekly-forecast', async (req, res) => {
  try {
    const forecastList = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const weather = await fetchWeatherData(dateStr);
      const prediction = calculateVisitorPrediction(dateStr, weather);

      forecastList.push({
        date: dateStr,
        day_name: prediction.calendar_meta.day_name || 'Día',
        temperature_max: weather.temperature_max_c,
        precipitation_mm: weather.precipitation_mm,
        precipitation_prob: weather.precipitation_probability,
        condition_text: weather.condition_text,
        estimated_visitors: prediction.estimated_visitors,
        crowd_level: prediction.crowd_level,
        theme_color: prediction.theme_color
      });
    }

    res.json({
      success: true,
      destination: SYSTEM_CONFIG.LOCATION.NAME,
      forecast: forecastList
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error generando tendencia semanal' });
  }
});

/**
 * 4. AUTENTICACIÓN (LOGIN / REGISTRO)
 */
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    const result = await authService.register(email, password, full_name);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 401).json({ success: false, error: err.message });
  }
});

/**
 * 5. VISITAS PROGRAMADAS A AGUAS SULFUROSAS (Rutas Protegidas)
 */
apiRouter.get('/visits', authService.requireAuth, async (req, res) => {
  try {
    const visits = await db.getVisitsByUserId(req.user.userId);
    res.json({ success: true, visits });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error consultando visitas agendadas' });
  }
});

apiRouter.post('/visits', authService.requireAuth, async (req, res) => {
  try {
    const { visit_date, expected_visitors, weather_notes } = req.body;
    if (!visit_date || !DATE_REGEX.test(visit_date)) {
      return res.status(400).json({ success: false, error: 'Fecha de visita inválida' });
    }
    const newVisit = await db.addScheduledVisit(req.user.userId, visit_date, expected_visitors || 150, weather_notes || 'Visita agendada');
    res.status(201).json({ success: true, visit: newVisit });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error guardando visita programada' });
  }
});

apiRouter.delete('/visits/:id', authService.requireAuth, async (req, res) => {
  try {
    const success = await db.deleteScheduledVisit(req.user.userId, req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Visita no encontrada o no pertenece al usuario' });
    }
    res.json({ success: true, message: 'Visita eliminada de su itinerario' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error eliminando visita' });
  }
});

/**
 * 6. PANEL ADMIN: MÉTRICAS Y CAPACIDAD DE CARGA (Solo rol ADMIN)
 */
apiRouter.get('/admin/metrics', authService.requireAuth, authService.requireAdmin, (req, res) => {
  res.json({
    success: true,
    location: SYSTEM_CONFIG.LOCATION.NAME,
    max_physical_capacity: SYSTEM_CONFIG.LOCATION.MAX_CAPACITY_PERSONS,
    optimal_bath_capacity: 200,
    critical_threshold_pct: 85,
    metrics_summary: {
      total_registered_visits: 14,
      high_occupancy_alerts_next_30_days: 3,
      most_searched_festivity: 'Fiesta Patronal de San Juan (24 de Junio)'
    }
  });
});
