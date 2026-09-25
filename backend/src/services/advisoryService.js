// Servicio de Recomendaciones Turísticas y Consejos para Aguas Sulfurosas de Jacintillo
// Generado por BackendAgent según specs/03 y specs/04

export function generateTravelAdvisory(weather, prediction) {
  const isRainy = weather.precipitation_mm > 2.0 || weather.precipitation_probability > 50;
  const isHeavyRain = weather.precipitation_mm > 10.0;
  const isHot = weather.temperature_max_c >= 30.0;
  const isCrowded = prediction.crowd_level === 'Alta' || prediction.crowd_level === 'Saturación';

  let verdict = '';
  let recommendedHours = '';
  let sunAdvice = '';
  const packingList = [
    'Ropa de baño y toalla de secado rápido',
    'Sandalias o calzado acuático antideslizante para rocas húmedas',
    'Repelente orgánico para insectos de selva',
    'Bolsa hermética contra agua para teléfono móvil'
  ];

  if (isHeavyRain) {
    verdict = '⚠️ Alerta: Se prevén lluvias torrenciales o chubascos en Tingo María. El caudal del manantial puede aumentar y las rocas estarán resbaladizas. Se aconseja precaución extrema o postergar el baño.';
    recommendedHours = 'Visita no recomendada durante las horas pico de tormenta pluvial.';
  } else if (isRainy) {
    verdict = '🌧️ Clima lluvioso moderado de selva: El agua conserva su temperatura termal agradable, pero los senderos de acceso a Jacintillo tendrán lodo. Afluencia reducida.';
    recommendedHours = '10:00 AM a 01:00 PM (horas de menor probabilidad de chubasco)';
    packingList.push('Poncho impermeable o paraguas');
  } else if (isHot && isCrowded) {
    verdict = '☀️ Día espectacular, muy caluroso y soleado: Clima óptimo para refrescarse en las pozas turquesas. Al ser fecha de alta demanda, se espera gran cantidad de bañistas.';
    recommendedHours = '07:30 AM a 10:30 AM (para disfrutar de las aguas cristalinas con poco público)';
  } else if (isHot) {
    verdict = '🌴 Clima ideal de selva: Día cálido y despejado con afluencia moderada. Excelente oportunidad para fotografías y baño medicinal prolongado.';
    recommendedHours = '08:30 AM a 11:30 AM o 03:00 PM a 05:00 PM';
  } else {
    verdict = '🌿 Clima templado y agradable en Jacintillo. Ideal para una estadía tranquila en contacto con la naturaleza de la selva alta.';
    recommendedHours = '09:00 AM a 02:00 PM';
  }

  // Recomendación de Radiación UV
  if (weather.uv_index >= 9.0) {
    sunAdvice = `Extrema (Índice UV ${weather.uv_index}): Imprescindible bloqueador solar biodegradable (para proteger la composición azufrada del manantial), sombrero y gafas de sol.`;
  } else if (weather.uv_index >= 6.0) {
    sunAdvice = `Alta (Índice UV ${weather.uv_index}): Usar protección solar y mantenerse hidratado con agua o cocos locales.`;
  } else {
    sunAdvice = `Moderada o Baja (Índice UV ${weather.uv_index}): Radiación solar suave.`;
  }

  return {
    verdict,
    recommended_arrival_hours: recommendedHours,
    sun_protection_advice: sunAdvice,
    packing_recommendations: packingList
  };
}
