// Configuración y Constantes del Sistema de Aguas Sulfurosas de Jacintillo
// Generado por BackendAgent según specs/01, specs/02 y specs/03

export const SYSTEM_CONFIG = {
  LOCATION: {
    NAME: 'Aguas Sulfurosas de Jacintillo',
    DISTRICT: 'Rupa-Rupa',
    PROVINCE: 'Leoncio Prado',
    DEPARTMENT: 'Huánuco',
    COUNTRY: 'Perú',
    COORDINATES: {
      LATITUDE: -9.2950,
      LONGITUDE: -75.9980
    },
    TIMEZONE: 'America/Lima',
    ELEVATION_METERS: 660,
    MAX_CAPACITY_PERSONS: 800
  },
  
  PREDICTION_MODEL: {
    BASE_VISITORS: 140,
    MAX_CAPACITY: 800,
    SEASONAL_DRY_MONTHS: [5, 6, 7, 8, 9, 10], // Mayo a Octubre (Temporada Seca)
    MULTIPLIERS: {
      WEEKDAY: 1.0,
      FRIDAY: 1.3,
      SATURDAY: 2.2,
      SUNDAY: 2.6,
      NATIONAL_HOLIDAY: 3.8,
      SAN_JUAN_FESTIVITY: 5.0
    }
  },

  HORIZONS: {
    REALTIME_MAX_DAYS: 4,     // Alta precisión con modelos numéricos Open-Meteo
    EXTENDED_MAX_DAYS: 14     // Tendencia meteorológica
  },

  JWT: {
    SECRET: process.env.JWT_SECRET || 'jacintillo_cloud_jwt_secret_dev_key_2026',
    EXPIRES_IN: '24h'
  }
};
