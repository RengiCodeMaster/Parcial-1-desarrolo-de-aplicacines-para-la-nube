# Especificación 04: Backend API REST y Orquestación de Microservicios

## 1. Arquitectura y Stack Tecnológico
- **Entorno de Ejecución:** Node.js (v18+ LTS) con Express / ES Modules.
- **Patrón de Diseño:** Service-Repository Pattern desacoplado con Inyección de Dependencias.
- **Protocolo de Comunicación:** HTTP/1.1 y HTTP/2 sobre JSON RESTful.
- **Políticas CORS:** Habilitadas para consumo seguro desde el frontend web y entornos de prueba.
- **Resiliencia:** Timeout de cliente HTTP (Open-Meteo) configurado a 4,000 ms con fallback determinista.
- **Seguridad:** Autenticación JWT y hasheo de contraseñas con bcrypt.

---

## 2. Catálogo Detallado de Endpoints

### 2.1 `GET /api/health`
Verifica la disponibilidad del servicio, la base de datos y la conectividad con la red externa.
- **Código de Respuesta:** `200 OK`
- **Cuerpo JSON:**
  ```json
  {
    "status": "online",
    "uptime_seconds": 1420.5,
    "timestamp": "2026-09-25T15:00:00.000Z",
    "database": "connected (PostgreSQL / SQLite fallback)",
    "location": "Aguas Sulfurosas de Jacintillo (-9.2950, -75.9980)",
    "environment": "production"
  }
  ```

---

### 2.2 `GET /api/predict`
Calcula la predicción de afluencia turística para una fecha específica cruzando Open-Meteo y el modelo de capacidad de carga.

- **Parámetros de Query:**
  - `date` *(Obligatorio, string)*: Fecha en formato ISO 8601 (`YYYY-MM-DD`). Ejemplo: `2026-09-27`.

- **Manejo de Respuestas HTTP:**
  - `200 OK`: Petición procesada exitosamente.
  - `400 Bad Request`: Formato de fecha inválido o fuera del rango soportado.
  - `503 Service Unavailable`: Si el proveedor meteorológico falla y no hay caché disponible.

- **Ejemplo de Payload Completo (200 OK):**
```json
{
  "success": true,
  "metadata": {
    "generated_at": "2026-09-25T15:00:00.000Z",
    "target_date": "2026-09-27",
    "day_name_es": "Domingo",
    "is_weekend": true,
    "is_holiday": false,
    "holiday_name": null,
    "season": "Seca (Mayo - Octubre)"
  },
  "destination": {
    "name": "Aguas Sulfurosas de Jacintillo",
    "district": "Rupa-Rupa",
    "province": "Leoncio Prado",
    "department": "Huánuco",
    "country": "Perú",
    "coordinates": {
      "latitude": -9.2950,
      "longitude": -75.9980
    },
    "pool_max_capacity_reference": 800
  },
  "weather": {
    "temperature_max_c": 31.4,
    "temperature_min_c": 22.0,
    "precipitation_sum_mm": 0.2,
    "precipitation_probability_pct": 12,
    "wind_speed_kmh": 8.5,
    "uv_index_max": 9.5,
    "wmo_code": 1,
    "condition_text": "Mayormente soleado y caluroso",
    "is_favorable_for_bathing": true
  },
  "prediction": {
    "estimated_visitors": 670,
    "confidence_interval": {
      "min_visitors": 616,
      "max_visitors": 724
    },
    "crowd_level": "Alta",
    "crowd_level_code": "HIGH",
    "capacity_occupancy_pct": 83.8,
    "theme_color": "#F59E0B"
  },
  "factors_applied": {
    "calendar_multiplier": 2.6,
    "temperature_multiplier": 1.5,
    "precipitation_multiplier": 1.2,
    "seasonal_multiplier": 1.15
  },
  "travel_advisory": {
    "verdict": "Día muy propicio para baño en pozas, se prevé alta concurrencia por ser domingo caluroso.",
    "recommended_arrival_hours": "07:30 AM - 10:30 AM",
    "sun_protection_advice": "Extrema: Radiación UV 9.5. Usar bloqueador biodegradable y gorro.",
    "packing_recommendations": [
      "Ropa de baño y toalla",
      "Calzado con suela antideslizante para rocas húmedas",
      "Repelente para mosquitos de selva",
      "Bolsas herméticas para dispositivos móviles"
    ]
  }
}
```

---

### 2.3 `GET /api/weekly-forecast`
Devuelve el arreglo ordenado de predicciones para los siguientes 7 días a partir de la fecha actual.

---

### 2.4 Endpoints de Autenticación y Usuarios (`/api/auth` y `/api/user`)

#### `POST /api/auth/register`
- **Body:** `{ "email": "turista@ejemplo.com", "password": "miPassword123", "full_name": "Carlos Pérez" }`
- **Respuesta 201 Created:** `{ "success": true, "token": "jwt...", "user": { "id": 1, "email": "...", "full_name": "...", "role": "TURISTA" } }`

#### `POST /api/auth/login`
- **Body:** `{ "email": "admin@tingomaria.gob.pe", "password": "admin123Password" }`
- **Respuesta 200 OK:** `{ "success": true, "token": "jwt...", "user": { "id": 1, "email": "...", "full_name": "...", "role": "ADMIN" } }`

#### `GET /api/user/saved-trips` (Requiere Header `Authorization: Bearer <token>`)
- **Respuesta 200 OK:** Retorna la lista de fechas guardadas por el usuario logueado con su resumen de clima y visitantes.

#### `POST /api/user/save-trip` (Requiere Header `Authorization: Bearer <token>`)
- **Body:** `{ "trip_date": "2026-06-24", "expected_visitors": 1250, "weather_summary": "San Juan Soleado 32°C" }`

---

## 3. Matriz de Errores y Códigos de Estado
| Código | Tipo de Error | Estructura JSON |
| :---: | :--- | :--- |
| `400` | Formato de fecha no válido o campos faltantes | `{"success": false, "error": "Formato de fecha inválido. Utilice YYYY-MM-DD"}` |
| `401` | Credenciales incorrectas o token ausente | `{"success": false, "error": "Credenciales inválidas o token expirado."}` |
| `409` | Conflicto de registro | `{"success": false, "error": "El correo electrónico ya está registrado."}` |
| `500` | Excepción no controlada del servidor | `{"success": false, "error": "Error interno del servidor."}` |
