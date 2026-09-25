// Suite de Pruebas Unitarias del Motor Predictivo y Capacidad de Carga
// Generado por QAAgent según antigravity/agents/qa-agent.md y specs/03-prediction-model-spec.md

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateVisitorPrediction,
  getCalendarFactor,
  getTemperatureFactor,
  getPrecipitationFactor,
  getSeasonalFactor
} from '../src/services/predictionEngine.js';

test('QAAgent - Suite de Pruebas del Motor Matemático de Jacintillo', async (t) => {

  await t.test('1. Debería aplicar el multiplicador festivo máximo (x5.0) el 24 de Junio (San Juan)', () => {
    const calendar = getCalendarFactor('2026-06-24');
    assert.equal(calendar.is_holiday, true);
    assert.equal(calendar.multiplier, 5.0);
    assert.match(calendar.holiday_name, /San Juan/i);
  });

  await t.test('2. Debería proyectar mayor afluencia un Domingo que un Martes bajo el mismo clima', () => {
    // 2026-09-27 es Domingo, 2026-09-29 es Martes
    const mockWeather = {
      temperature_max_c: 30.0,
      precipitation_mm: 0.0,
      precipitation_probability: 10
    };

    const predSunday = calculateVisitorPrediction('2026-09-27', mockWeather);
    const predTuesday = calculateVisitorPrediction('2026-09-29', mockWeather);

    assert.ok(predSunday.estimated_visitors > predTuesday.estimated_visitors, 
      `El domingo (${predSunday.estimated_visitors}) debe superar al martes (${predTuesday.estimated_visitors})`);
  });

  await t.test('3. Debería reducir drásticamente la afluencia ante lluvias torrenciales tropicales (>10mm)', () => {
    const dryWeather = {
      temperature_max_c: 30.0,
      precipitation_mm: 0.0,
      precipitation_probability: 5
    };

    const stormWeather = {
      temperature_max_c: 30.0,
      precipitation_mm: 15.0,
      precipitation_probability: 90
    };

    const predDry = calculateVisitorPrediction('2026-09-27', dryWeather);
    const predStorm = calculateVisitorPrediction('2026-09-27', stormWeather);

    assert.ok(predStorm.estimated_visitors < predDry.estimated_visitors * 0.3,
      'La lluvia torrencial debe reducir la afluencia a menos del 30% del día soleado');
    assert.ok(predStorm.crowd_level === 'Baja' || predStorm.crowd_level === 'Moderada');
  });

  await t.test('4. El intervalo de confianza debe respetar el rango teórico ±8%', () => {
    const weather = {
      temperature_max_c: 28.0,
      precipitation_mm: 1.0,
      precipitation_probability: 20
    };

    const result = calculateVisitorPrediction('2026-09-25', weather);
    const est = result.estimated_visitors;
    const { min_visitors, max_visitors } = result.confidence_interval;

    assert.equal(min_visitors, Math.round(est * 0.92));
    assert.equal(max_visitors, Math.round(est * 1.08));
    assert.ok(min_visitors <= est && est <= max_visitors);
  });

  await t.test('5. Debería categorizar como Saturación si supera la capacidad de 800 personas', () => {
    // Día de San Juan con calor radiante en domingo
    const optimalWeather = {
      temperature_max_c: 33.0,
      precipitation_mm: 0.0,
      precipitation_probability: 0
    };

    const result = calculateVisitorPrediction('2026-06-24', optimalWeather);
    assert.ok(result.estimated_visitors >= 800, 'San Juan soleado debe desbordar los 800 visitantes');
    assert.equal(result.crowd_level, 'Saturación');
    assert.equal(result.crowd_level_code, 'SATURATED');
    assert.equal(result.theme_color, '#EF4444');
  });
});
