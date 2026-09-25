// Motor Matemático Predictivo de Afluencia Turística - Aguas Sulfurosas de Jacintillo
// Generado por BackendAgent según specs/03-prediction-model-spec.md

import { SYSTEM_CONFIG } from '../config/constants.js';

/**
 * Feriados Nacionales Peruanos y Festividades de Tingo María
 */
export const SPECIAL_DATES = {
  '01-01': { name: 'Año Nuevo', multiplier: 3.8 },
  '05-01': { name: 'Día del Trabajo', multiplier: 3.5 },
  '06-24': { name: 'Fiesta Patronal de San Juan (Tingo María)', multiplier: 5.0 }, // La fiesta más grande de la Amazonía
  '07-28': { name: 'Fiestas Patrias (Día 1)', multiplier: 4.2 },
  '07-29': { name: 'Fiestas Patrias (Día 2)', multiplier: 4.0 },
  '10-15': { name: 'Aniversario de Tingo María', multiplier: 3.5 },
  '11-01': { name: 'Día de Todos los Santos', multiplier: 3.0 },
  '12-25': { name: 'Navidad', multiplier: 3.5 }
};

/**
 * Determina el factor calendario de acuerdo al día de la semana y feriados
 */
export function getCalendarFactor(dateStr) {
  const [year, monthStr, dayStr] = dateStr.split('-');
  const monthDay = `${monthStr}-${dayStr}`;

  // Verificar si es fecha festiva o aniversario de Tingo María
  if (SPECIAL_DATES[monthDay]) {
    return {
      multiplier: SPECIAL_DATES[monthDay].multiplier,
      is_holiday: true,
      holiday_name: SPECIAL_DATES[monthDay].name,
      day_type: 'Feriado / Festividad Regional'
    };
  }

  // Verificar día de la semana (0: Domingo, 6: Sábado)
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay();

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayName = dayNames[dayOfWeek];

  let multiplier = 1.0;
  let dayType = 'Día Laborable Ordinario';
  let isWeekend = false;

  if (dayOfWeek === 0) { // Domingo
    multiplier = SYSTEM_CONFIG.PREDICTION_MODEL.MULTIPLIERS.SUNDAY;
    dayType = 'Domingo (Día Pico Semanal)';
    isWeekend = true;
  } else if (dayOfWeek === 6) { // Sábado
    multiplier = SYSTEM_CONFIG.PREDICTION_MODEL.MULTIPLIERS.SATURDAY;
    dayType = 'Sábado (Fin de Semana)';
    isWeekend = true;
  } else if (dayOfWeek === 5) { // Viernes
    multiplier = SYSTEM_CONFIG.PREDICTION_MODEL.MULTIPLIERS.FRIDAY;
    dayType = 'Viernes (Víspera)';
    isWeekend = false;
  } else {
    multiplier = SYSTEM_CONFIG.PREDICTION_MODEL.MULTIPLIERS.WEEKDAY;
  }

  return {
    multiplier,
    is_holiday: false,
    holiday_name: null,
    day_name: dayName,
    day_type: dayType,
    is_weekend: isWeekend
  };
}

/**
 * Factor de temperatura (°C)
 */
export function getTemperatureFactor(tempMax) {
  if (tempMax < 22) return 0.65;
  if (tempMax < 26) return 0.95;
  if (tempMax < 31) return 1.30;
  return 1.50; // Bochorno intenso en selva (>31°C)
}

/**
 * Factor de precipitación y lluvia
 */
export function getPrecipitationFactor(precipitationMm, precipitationProb) {
  if (precipitationMm <= 0.2 && precipitationProb <= 15) return 1.20; // Día radiante
  if (precipitationMm <= 2.0) return 1.00; // Llovizna tolerable
  if (precipitationMm <= 10.0) return 0.50; // Lluvia moderada de selva
  return 0.15; // Lluvia torrencial o tormenta
}

/**
 * Factor de temporada estacional (Seca vs Lluvias en la selva alta)
 */
export function getSeasonalFactor(dateStr) {
  const month = parseInt(dateStr.split('-')[1], 10);
  const isDry = SYSTEM_CONFIG.PREDICTION_MODEL.SEASONAL_DRY_MONTHS.includes(month);
  return {
    multiplier: isDry ? 1.15 : 0.85,
    season_name: isDry ? 'Temporada Seca (Mayo - Octubre)' : 'Temporada de Lluvias (Noviembre - Abril)'
  };
}

/**
 * Calcula la afluencia turística estimada V(d), nivel de congestión y capacidad de carga
 */
export function calculateVisitorPrediction(dateStr, weather) {
  const baseVisitors = SYSTEM_CONFIG.PREDICTION_MODEL.BASE_VISITORS; // 140
  const calendar = getCalendarFactor(dateStr);
  const tempFactor = getTemperatureFactor(weather.temperature_max_c);
  const precipFactor = getPrecipitationFactor(weather.precipitation_mm, weather.precipitation_probability);
  const season = getSeasonalFactor(dateStr);

  // Ecuación matemática V(d)
  const rawVisitors = baseVisitors * calendar.multiplier * tempFactor * precipFactor * season.multiplier;
  const estimatedVisitors = Math.max(30, Math.round(rawVisitors));

  // Intervalo de confianza al 90% (±8%)
  const minVisitors = Math.round(estimatedVisitors * 0.92);
  const maxVisitors = Math.round(estimatedVisitors * 1.08);

  // Porcentaje de Capacidad de Carga respecto a las Aguas Sulfurosas (Aforo Máx: 800 personas)
  const maxCapacity = SYSTEM_CONFIG.PREDICTION_MODEL.MAX_CAPACITY;
  const occupancyPercentage = Number(((estimatedVisitors / maxCapacity) * 100).toFixed(1));

  // Categorización de Afluencia
  let crowdLevel = 'Baja';
  let crowdCode = 'LOW';
  let themeColor = '#10B981'; // Esmeralda
  let crowdDescription = 'Tranquilo y apacible, ideal para relajación medicinal y fotografías';

  if (estimatedVisitors >= 800) {
    crowdLevel = 'Saturación';
    crowdCode = 'SATURATED';
    themeColor = '#EF4444'; // Rojo carmesí
    crowdDescription = 'Aforo al límite de capacidad de carga. Se prevé aglomeración en la poza natural';
  } else if (estimatedVisitors >= 450) {
    crowdLevel = 'Alta';
    crowdCode = 'HIGH';
    themeColor = '#F59E0B'; // Ámbar
    crowdDescription = 'Muy concurrido. Se recomienda llegar temprano para asegurar espacio';
  } else if (estimatedVisitors >= 150) {
    crowdLevel = 'Moderada';
    crowdCode = 'MODERATE';
    themeColor = '#06B6D4'; // Turquesa
    crowdDescription = 'Afluencia habitual equilibrada, ambiente agradable para baño';
  }

  return {
    estimated_visitors: estimatedVisitors,
    confidence_interval: {
      min_visitors: minVisitors,
      max_visitors: maxVisitors
    },
    crowd_level: crowdLevel,
    crowd_level_code: crowdCode,
    occupancy_percentage: occupancyPercentage,
    theme_color: themeColor,
    crowd_description: crowdDescription,
    factors: {
      base_visitors: baseVisitors,
      calendar: calendar.multiplier,
      temperature: tempFactor,
      precipitation: precipFactor,
      season: season.multiplier
    },
    calendar_meta: calendar,
    season_meta: season
  };
}
