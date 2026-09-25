// Adaptador de Base de Datos con Resiliencia Cloud (PostgreSQL + In-Memory Fallback)
// Generado por BackendAgent según specs/08-docker-and-database-spec.md

import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

// Almacenamiento en memoria para Fallback si PostgreSQL no está levantado
const memoryStore = {
  users: [
    {
      id: 1,
      email: 'admin@tingomaria.gob.pe',
      password_hash: bcrypt.hashSync('admin123', 10),
      full_name: 'Administrador Jacintillo',
      role: 'ADMIN',
      created_at: new Date()
    },
    {
      id: 2,
      email: 'turista@demo.com',
      password_hash: bcrypt.hashSync('turista123', 10),
      full_name: 'Juan Turista',
      role: 'TURISTA',
      created_at: new Date()
    }
  ],
  scheduled_visits: [
    {
      id: 1,
      user_id: 2,
      visit_date: '2026-06-24',
      expected_visitors: 1250,
      weather_notes: 'Fiesta de San Juan - Soleado y caluroso',
      created_at: new Date()
    }
  ],
  predictions_cache: new Map()
};

let pool = null;
let isPostgresAvailable = false;

// Intentar conexión a PostgreSQL si DATABASE_URL existe
const connectionString = process.env.DATABASE_URL;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000
    });
    
    // Probar conexión inicial
    pool.query('SELECT NOW()')
      .then(() => {
        isPostgresAvailable = true;
        console.log('✅ [Database] Conectado exitosamente a PostgreSQL.');
        initDatabaseTables();
      })
      .catch((err) => {
        console.warn('⚠️ [Database] PostgreSQL no disponible, activando Fallback en Memoria. Razón:', err.message);
        isPostgresAvailable = false;
      });
  } catch (err) {
    console.warn('⚠️ [Database] Error inicializando Pool de PG. Usando modo memoria.');
    isPostgresAvailable = false;
  }
} else {
  console.log('ℹ️ [Database] DATABASE_URL no provista. Operando en modo Local In-Memory (Ideal para testing/evaluación rápida).');
}

// Inicialización de tablas en PostgreSQL si está disponible
async function initDatabaseTables() {
  if (!isPostgresAvailable || !pool) return;
  const ddl = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(120) NOT NULL,
      role VARCHAR(20) DEFAULT 'TURISTA',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scheduled_visits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      visit_date DATE NOT NULL,
      expected_visitors INTEGER NOT NULL,
      weather_notes VARCHAR(150),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS predictions_cache (
      id SERIAL PRIMARY KEY,
      query_date DATE UNIQUE NOT NULL,
      temperature_max NUMERIC(4,1) NOT NULL,
      temperature_min NUMERIC(4,1) NOT NULL,
      precipitation_mm NUMERIC(5,2) NOT NULL,
      precipitation_prob INTEGER NOT NULL,
      uv_index NUMERIC(3,1) NOT NULL,
      wmo_code INTEGER NOT NULL,
      estimated_visitors INTEGER NOT NULL,
      crowd_level VARCHAR(20) NOT NULL,
      factors_json JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Asegurar cuentas demo con hashes bcrypt válidos
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES 
      ('admin@tingomaria.gob.pe', '$2a$10$nwBtRkAlNsVb33ubC52dxuq4dAc34H6we75TMfc4Fr9hwJcqBiYXy', 'Administrador Jacintillo', 'ADMIN'),
      ('turista@demo.com', '$2a$10$VUxgc4waeHf4bHtLEMzOuefEJWjdBMMZ4zAWYKBv2wjn/v1dMSOAK', 'Juan Turista', 'TURISTA')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
  `;
  try {
    await pool.query(ddl);
    console.log('✅ [Database] Tablas, índices y cuentas demo verificados en PostgreSQL.');
  } catch (err) {
    console.error('❌ [Database] Error creando tablas en PostgreSQL:', err.message);
  }
}

// Métodos de acceso a datos unificados con Fallback
export const db = {
  isPostgres: () => isPostgresAvailable,

  // --- USUARIOS ---
  findUserByEmail: async (email) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return res.rows[0] || null;
    }
    return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  findUserById: async (id) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query('SELECT id, email, full_name, role, created_at FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    const user = memoryStore.users.find(u => u.id === Number(id));
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  createUser: async (email, password_hash, full_name, role = 'TURISTA') => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role, created_at',
        [email, password_hash, full_name, role]
      );
      return res.rows[0];
    }
    const newUser = {
      id: memoryStore.users.length + 1,
      email,
      password_hash,
      full_name,
      role,
      created_at: new Date()
    };
    memoryStore.users.push(newUser);
    const { password_hash: _, ...safeUser } = newUser;
    return safeUser;
  },

  // --- VISITAS PROGRAMADAS A AGUAS SULFUROSAS ---
  getVisitsByUserId: async (userId) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        'SELECT * FROM scheduled_visits WHERE user_id = $1 ORDER BY visit_date ASC',
        [userId]
      );
      return res.rows;
    }
    return memoryStore.scheduled_visits.filter(v => v.user_id === Number(userId));
  },

  addScheduledVisit: async (userId, visitDate, expectedVisitors, weatherNotes) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        'INSERT INTO scheduled_visits (user_id, visit_date, expected_visitors, weather_notes) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, visitDate, expectedVisitors, weatherNotes]
      );
      return res.rows[0];
    }
    const newVisit = {
      id: memoryStore.scheduled_visits.length + 1,
      user_id: Number(userId),
      visit_date: visitDate,
      expected_visitors: expectedVisitors,
      weather_notes: weatherNotes,
      created_at: new Date()
    };
    memoryStore.scheduled_visits.push(newVisit);
    return newVisit;
  },

  deleteScheduledVisit: async (userId, visitId) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query(
        'DELETE FROM scheduled_visits WHERE id = $1 AND user_id = $2 RETURNING id',
        [visitId, userId]
      );
      return res.rowCount > 0;
    }
    const initialLen = memoryStore.scheduled_visits.length;
    memoryStore.scheduled_visits = memoryStore.scheduled_visits.filter(
      v => !(v.id === Number(visitId) && v.user_id === Number(userId))
    );
    return memoryStore.scheduled_visits.length < initialLen;
  },

  // --- CACHÉ DE PREDICCIONES ---
  getCachedPrediction: async (dateStr) => {
    if (isPostgresAvailable && pool) {
      const res = await pool.query('SELECT * FROM predictions_cache WHERE query_date = $1', [dateStr]);
      return res.rows[0] || null;
    }
    return memoryStore.predictions_cache.get(dateStr) || null;
  },

  saveCachedPrediction: async (dateStr, weather, visitors, crowdLevel, factors) => {
    if (isPostgresAvailable && pool) {
      try {
        await pool.query(
          `INSERT INTO predictions_cache 
           (query_date, temperature_max, temperature_min, precipitation_mm, precipitation_prob, uv_index, wmo_code, estimated_visitors, crowd_level, factors_json)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (query_date) DO NOTHING`,
          [
            dateStr,
            weather.temperature_max_c,
            weather.temperature_min_c,
            weather.precipitation_mm,
            weather.precipitation_probability,
            weather.uv_index,
            weather.wmo_code,
            visitors,
            crowdLevel,
            JSON.stringify(factors)
          ]
        );
      } catch (e) {
        // Silencioso para no frenar la respuesta
      }
      return;
    }
    memoryStore.predictions_cache.set(dateStr, {
      query_date: dateStr,
      weather,
      estimated_visitors: visitors,
      crowd_level: crowdLevel,
      factors,
      created_at: new Date()
    });
  }
};
