# Especificación 08: Contenerización Docker, Autenticación (Login) y Persistencia en Base de Datos

## 1. Justificación y Propósito Realista de la Base de Datos
El sistema está enfocado **única y exclusivamente** en el atractivo turístico **Aguas Sulfurosas de Jacintillo (Tingo María)**. Por lo tanto, no existen múltiples atractivos turísticos en la plataforma.

La base de datos y la autenticación se justifican en dos necesidades operativas reales:

### 1.1 Perspectiva Turista / Usuario Visitante
El turista que planea viajar a las Aguas Sulfurosas necesita planificar qué fecha específica le conviene acudir:
- **Mis Fechas / Visitas Programadas a Aguas Sulfurosas (`my_scheduled_visits`):**
  - El usuario puede agendar una fecha prevista para ir a las Aguas Sulfurosas (ej. *"Mi visita del 24 de Junio por San Juan"* o *"Mi visita de este domingo"*).
  - El sistema guarda esa fecha en la base de datos asociada a su cuenta.
  - Al volver a iniciar sesión, el sistema refresca automáticamente el pronóstico del clima y la afluencia de esa fecha guardada para verificar si las condiciones siguen siendo favorables.

### 1.2 Perspectiva Administrador / Fiscalizador Local
- **Panel de Control de Capacidad de Carga de Aguas Sulfurosas:**
  - Consulta de auditoría de las fechas que la gente está buscando para ir a Jacintillo.
  - Monitoreo de alertas de sobreaforo en la poza natural (>800 personas simultáneas).

### 1.3 Caché Compartido de Clima y Predicciones (`predictions_cache`)
- Guarda las consultas climáticas de Open-Meteo para las coordenadas de Jacintillo (`-9.2950, -75.9980`), reduciendo llamadas externas redundantes.

---

## 2. Esquema Relacional de la Base de Datos (PostgreSQL)

```
┌─────────────────────────┐          ┌───────────────────────────────────┐
│          users          │          │        scheduled_visits           │
├─────────────────────────┤          ├───────────────────────────────────┤
│ id (PK, SERIAL)         │ 1      N │ id (PK, SERIAL)                   │
│ email (VARCHAR, UNIQUE) │──────────│ user_id (FK -> users.id)          │
│ password_hash (VARCHAR) │          │ visit_date (DATE)                 │
│ full_name (VARCHAR)     │          │ expected_visitors (INT)           │
│ role (VARCHAR)          │          │ weather_notes (VARCHAR)           │
│ created_at (TIMESTAMP)  │          │ created_at (TIMESTAMP)            │
└─────────────────────────┘          └───────────────────────────────────┘
             │
             │ (Auditoría / Caché del Sistema)
             ▼
┌─────────────────────────────────────┐
│          predictions_cache          │
├─────────────────────────────────────┤
│ id (PK, SERIAL)                     │
│ query_date (DATE, UNIQUE)           │
│ temperature_max (NUMERIC)           │
│ precipitation_mm (NUMERIC)          │
│ estimated_visitors (INT)            │
│ crowd_level (VARCHAR)               │
│ created_at (TIMESTAMP)              │
└─────────────────────────────────────┘
```

### 2.1 Sentencias DDL (`scripts/init-db.sql`)
```sql
-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(20) DEFAULT 'TURISTA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Fechas de Visita Programadas a Aguas Sulfurosas
CREATE TABLE IF NOT EXISTS scheduled_visits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    expected_visitors INTEGER NOT NULL,
    weather_notes VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Caché Meteorológico y de Afluencia de Aguas Sulfurosas
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

-- Usuarios de Demostración
INSERT INTO users (email, password_hash, full_name, role)
VALUES 
  ('admin@tingomaria.gob.pe', '$2b$10$EP3tYq560N4L.j9Kqm0bKu42r8fG0KzJ3aMbmhCgU5T7sP0N3U9eK', 'Administrador Jacintillo', 'ADMIN'),
  ('turista@demo.com', '$2b$10$EP3tYq560N4L.j9Kqm0bKu42r8fG0KzJ3aMbmhCgU5T7sP0N3U9eK', 'Juan Turista', 'TURISTA')
ON CONFLICT (email) DO NOTHING;
```

---

## 3. Endpoints de la API (`/api/auth` y `/api/visits`)
1. `POST /api/auth/register`: Registro de usuario (`email`, `password`, `full_name`).
2. `POST /api/auth/login`: Autenticación con generación de token JWT.
3. `GET /api/visits`: Obtiene la lista de fechas agendadas por el usuario para visitar Aguas Sulfurosas.
4. `POST /api/visits`: Permite agendar una fecha consultada en su lista de visitas personales.
5. `DELETE /api/visits/:id`: Cancela una fecha agendada.
