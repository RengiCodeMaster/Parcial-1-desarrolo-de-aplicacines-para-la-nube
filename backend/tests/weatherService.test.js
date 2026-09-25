// Suite de Pruebas Unitarias del Servicio Meteorológico y Horizontes Temporales
// Generado por QAAgent según antigravity/agents/qa-agent.md y specs/02-weather-api-spec.md

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getTemporalHorizon,
  getSeasonalClimateFallback,
  WMO_CODE_MAP
} from '../src/services/weatherService.js';

test('QAAgent - Suite de Pruebas Meteorológicas y de Certeza Temporal', async (t) => {

  await t.test('1. Debería clasificar fechas dentro de los 4 días como Pronóstico en Tiempo Real', () => {
    const today = new Date();
    const plusTwoDays = new Date(today);
    plusTwoDays.setDate(today.getDate() + 2);
    const dateStr = plusTwoDays.toISOString().split('T')[0];

    const horizon = getTemporalHorizon(dateStr);
    assert.equal(horizon.type, 'REALTIME_FORECAST');
    assert.equal(horizon.confidence_pct, 92);
    assert.match(horizon.badge_text, /Alta Precisión/i);
  });

  await t.test('2. Debería clasificar fechas pasadas como Registro Histórico Real', () => {
    const pastDate = '2024-06-24';
    const horizon = getTemporalHorizon(pastDate);
    assert.equal(horizon.type, 'HISTORICAL_RECORD');
    assert.equal(horizon.confidence_pct, 100);
    assert.match(horizon.badge_text, /Histórico/i);
  });

  await t.test('3. Debería clasificar fechas a más de 14 días como Proyección Estacional', () => {
    const farFutureDate = '2027-01-15';
    const horizon = getTemporalHorizon(farFutureDate);
    assert.equal(horizon.type, 'SEASONAL_PROJECTION');
    assert.match(horizon.badge_text, /Estacional/i);
  });

  await t.test('4. El fallback estacional debe diferenciar temporada seca (Mayo) de temporada de lluvia (Enero)', () => {
    const dryMonth = getSeasonalClimateFallback('2026-06-15'); // Junio (Seca)
    const rainyMonth = getSeasonalClimateFallback('2026-01-15'); // Enero (Lluvias)

    assert.ok(dryMonth.temperature_max_c > rainyMonth.temperature_max_c, 'Junio debe ser más caluroso');
    assert.ok(dryMonth.precipitation_mm < rainyMonth.precipitation_mm, 'Junio debe tener menos lluvia que Enero');
    assert.equal(dryMonth.is_favorable_for_bathing, true);
  });

  await t.test('5. El mapa de códigos WMO debe calificar tormenta (95) como desaconsejable para baño', () => {
    const stormInfo = WMO_CODE_MAP[95];
    assert.ok(stormInfo);
    assert.equal(stormInfo.favorable, false);
    assert.ok(stormInfo.multiplier <= 0.15);
  });
});
