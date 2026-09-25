// Servicio de Integración Meteorológica (Open-Meteo) para Aguas Sulfurosas de Jacintillo
// Generado por BackendAgent según specs/02-weather-api-spec.md

import { SYSTEM_CONFIG } from '../config/constants.js';

/**
 * Mapeo oficial de códigos meteorológicos WMO adaptados al microclima de selva de Jacintillo
 */
export const WMO_CODE_MAP = {
  0: { description: 'Cielo completamente despejado y radiante', multiplier: 1.35, icon: 'sun', favorable: true },
  1: { description: 'Mayormente despejado con sol radiante', multiplier: 1.25, icon: 'sun', favorable: true },
  2: { description: 'Parcialmente nublado y cálido', multiplier: 1.15, icon: 'cloud-sun', favorable: true },
  3: { description: 'Nublado con bochorno de selva', multiplier: 1.00, icon: 'cloud', favorable: true },
  45: { description: 'Neblina matutina de ceja de selva', multiplier: 0.90, icon: 'smog', favorable: true },
  48: { description: 'Neblina densa con alta humedad', multiplier: 0.85, icon: 'smog', favorable: false },
  51: { description: 'Llovizna ligera intermitente', multiplier: 0.80, icon: 'cloud-rain', favorable: true },
  53: { description: 'Llovizna moderada', multiplier: 0.70, icon: 'cloud-rain', favorable: false },
  55: { description: 'Garúa continua de selva', multiplier: 0.65, icon: 'cloud-rain', favorable: false },
  61: { description: 'Lluvia ligera tropical', multiplier: 0.50, icon: 'cloud-showers-heavy', favorable: false },
  63: { description: 'Lluvia moderada continua', multiplier: 0.40, icon: 'cloud-showers-heavy', favorable: false },
  65: { description: 'Lluvia torrencial de selva', multiplier: 0.20, icon: 'cloud-showers-heavy', favorable: false },
  80: { description: 'Chubascos breves intermitentes', multiplier: 0.55, icon: 'cloud-sun-rain', favorable: false },
  81: { description: 'Chubascos moderados', multiplier: 0.40, icon: 'cloud-rain', favorable: false },
  82: { description: 'Chubascos violentos', multiplier: 0.25, icon: 'cloud-showers-heavy', favorable: false },
  95: { description: 'Tormenta eléctrica con truenos', multiplier: 0.10, icon: 'bolt', favorable: false },
  96: { description: 'Tormenta eléctrica severa', multiplier: 0.08, icon: 'bolt', favorable: false }
};

/**
 * Determina el horizonte temporal y nivel de certeza científica de la fecha consultada
 * (specs/02: 4 días de alta precisión en vivo vs tendencia vs proyección estacional)
 */
export function getTemporalHorizon(targetDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = targetDateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      type: 'HISTORICAL_RECORD',
      days_from_now: diffDays,
      confidence_pct: 100,
      badge_text: 'Registro Histórico Real Ocurrido',
      badge_color: '#8B5CF6' // Púrpura
    };
  } else if (diffDays <= SYSTEM_CONFIG.HORIZONS.REALTIME_MAX_DAYS) {
    return {
      type: 'REALTIME_FORECAST',
      days_from_now: diffDays,
      confidence_pct: 92,
      badge_text: 'Pronóstico en Tiempo Real (Alta Precisión)',
      badge_color: '#10B981' // Verde
    };
  } else if (diffDays <= SYSTEM_CONFIG.HORIZONS.EXTENDED_MAX_DAYS) {
    return {
      type: 'EXTENDED_TREND',
      days_from_now: diffDays,
      confidence_pct: 70,
      badge_text: 'Tendencia Meteorológica Probable',
      badge_color: '#F59E0B' // Ámbar
    };
  } else {
    return {
      type: 'SEASONAL_PROJECTION',
      days_from_now: diffDays,
      confidence_pct: 80,
      badge_text: 'Proyección Estacional Histórica (Tingo María)',
      badge_color: '#06B6D4' // Turquesa
    };
  }
}

/**
 * Generador Climatológico Estacional de Fallback para Tingo María
 */
export function getSeasonalClimateFallback(dateStr) {
  const month = parseInt(dateStr.split('-')[1], 10);
  const isDrySeason = SYSTEM_CONFIG.PREDICTION_MODEL.SEASONAL_DRY_MONTHS.includes(month);

  if (isDrySeason) {
    return {
      temperature_max_c: 30.5,
      temperature_min_c: 21.8,
      precipitation_mm: 0.8,
      precipitation_probability: 20,
      wind_speed_kmh: 8.2,
      uv_index: 9.2,
      wmo_code: 1,
      condition_text: 'Mayormente soleado y caluroso (Temporada Seca)',
      is_favorable_for_bathing: true,
      source: 'Modelo Climatológico Estacional de Tingo María (DIRCETUR)'
    };
  } else {
    return {
      temperature_max_c: 27.4,
      temperature_min_c: 21.0,
      precipitation_mm: 8.5,
      precipitation_probability: 70,
      wind_speed_kmh: 11.5,
      uv_index: 6.8,
      wmo_code: 61,
      condition_text: 'Lluvia tropical probable (Temporada de Lluvias)',
      is_favorable_for_bathing: false,
      source: 'Modelo Climatológico Estacional de Tingo María (DIRCETUR)'
    };
  }
}

/**
 * Consulta el clima exacto a Open-Meteo para las coordenadas de Jacintillo
 */
export async function fetchWeatherData(dateStr) {
  const horizon = getTemporalHorizon(dateStr);
  const { LATITUDE, LONGITUDE } = SYSTEM_CONFIG.LOCATION.COORDINATES;
  const { TIMEZONE } = SYSTEM_CONFIG.LOCATION;

  // Si es fecha lejana a más de 14 días, aplicar directamente la proyección estacional
  if (horizon.type === 'SEASONAL_PROJECTION') {
    const seasonalData = getSeasonalClimateFallback(dateStr);
    return {
      ...seasonalData,
      temporal_horizon: horizon
    };
  }

  let apiUrl = '';
  const tzParam = encodeURIComponent(TIMEZONE);
  if (horizon.type === 'HISTORICAL_RECORD') {
    apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=${tzParam}&start_date=${dateStr}&end_date=${dateStr}`;
  } else {
    apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=${tzParam}&start_date=${dateStr}&end_date=${dateStr}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    console.log('DEBUG API URL:', apiUrl);
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error('OPEN-METEO 400 ERROR DETAIL:', errText);
      throw new Error(`Open-Meteo respondió con estado HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const daily = data.daily;

    if (!daily || !daily.time || daily.time.length === 0) {
      throw new Error('Respuesta meteorológica vacía');
    }

    const wmoCode = (daily.weather_code && daily.weather_code[0] !== undefined) ? daily.weather_code[0] : (daily.weathercode ? daily.weathercode[0] : 1);
    const wmoInfo = WMO_CODE_MAP[wmoCode] || WMO_CODE_MAP[1];

    const tempMax = daily.temperature_2m_max ? daily.temperature_2m_max[0] : 29.0;
    const tempMin = daily.temperature_2m_min ? daily.temperature_2m_min[0] : 21.0;
    const precipSum = daily.precipitation_sum ? daily.precipitation_sum[0] : 0.0;
    const precipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : (precipSum > 2 ? 65 : 15);
    const windSpeed = daily.wind_speed_10m_max ? daily.wind_speed_10m_max[0] : (daily.windspeed_10m_max ? daily.windspeed_10m_max[0] : 8.0);
    const uvIndex = daily.uv_index_max ? daily.uv_index_max[0] : 8.5;

    return {
      temperature_max_c: Number(tempMax.toFixed(1)),
      temperature_min_c: Number(tempMin.toFixed(1)),
      precipitation_mm: Number(precipSum.toFixed(1)),
      precipitation_probability: Math.round(precipProb),
      wind_speed_kmh: Number(windSpeed.toFixed(1)),
      uv_index: Number(uvIndex.toFixed(1)),
      wmo_code: wmoCode,
      condition_text: wmoInfo.description,
      is_favorable_for_bathing: wmoInfo.favorable && precipSum < 3,
      source: horizon.type === 'HISTORICAL_RECORD' ? 'Open-Meteo Archive API' : 'Open-Meteo Forecast API',
      temporal_horizon: horizon
    };
  } catch (err) {
    console.warn(`⚠️ [WeatherService] Falló consulta a Open-Meteo (${err.message}). Activando Fallback Estacional.`);
    const fallback = getSeasonalClimateFallback(dateStr);
    return {
      ...fallback,
      temporal_horizon: horizon,
      source: 'Fallback Climatológico Resiliente (Conexión offline)'
    };
  }
}
