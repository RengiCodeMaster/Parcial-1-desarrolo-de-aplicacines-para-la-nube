-- Script de Inicialización de Base de Datos PostgreSQL
-- Generado por BackendAgent y DeployAgent según specs/08-docker-and-database-spec.md

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(20) DEFAULT 'TURISTA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Fechas de Visita Programadas a Aguas Sulfurosas de Jacintillo
CREATE TABLE IF NOT EXISTS scheduled_visits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    expected_visitors INTEGER NOT NULL,
    weather_notes VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Caché Meteorológico y de Afluencia
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

-- 4. Sembrado de Usuarios Demo para Evaluación
-- Contraseña de admin@tingomaria.gob.pe: admin123
-- Contraseña de turista@demo.com: turista123
INSERT INTO users (email, password_hash, full_name, role)
VALUES 
  ('admin@tingomaria.gob.pe', '$2b$10$EP3tYq560N4L.j9Kqm0bKu42r8fG0KzJ3aMbmhCgU5T7sP0N3U9eK', 'Administrador Jacintillo', 'ADMIN'),
  ('turista@demo.com', '$2b$10$EP3tYq560N4L.j9Kqm0bKu42r8fG0KzJ3aMbmhCgU5T7sP0N3U9eK', 'Juan Turista', 'TURISTA')
ON CONFLICT (email) DO NOTHING;

-- Visita de Demostración
INSERT INTO scheduled_visits (user_id, visit_date, expected_visitors, weather_notes)
SELECT id, '2026-06-24', 1250, 'Fiesta de San Juan - Baño tradicional en Jacintillo'
FROM users WHERE email = 'turista@demo.com'
ON CONFLICT DO NOTHING;
