# Especificación 02: Integración con la API Meteorológica (Open-Meteo) y Gestión de Horizontes Temporales

## 1. Justificación del Proveedor Meteorológico
Para el proyecto se selecciona **Open-Meteo** debido a:
1. **Acceso Gratuito y Abierto:** No requiere API Key para peticiones académicas no comerciales.
2. **Alta Precisión Geográfica:** Permite geolocalización milimétrica por latitud y longitud (`-9.2950, -75.9980`) modelada a partir de los centros meteorológicos ECMWF y GFS.
3. **Manejo Dual de Horizontes:** Soporta tanto pronóstico numérico en vivo como series históricas.

---

## 2. Parámetros de Ubicación Geográfica
- **Recurso Turístico:** Aguas Sulfurosas de Jacintillo
- **Distrito / Provincia:** Rupa-Rupa / Leoncio Prado
- **Departamento:** Huánuco, Perú
- **Latitud:** `-9.2950`
- **Longitud:** `-75.9980`
- **Zona Horaria Oficial:** `America/Lima` (UTC-5)
- **Elevación:** 660 m.s.n.m.

---

## 3. Estrategia de Horizontes Temporales y Niveles de Certeza (CRÍTICO)

La meteorología científica tiene límites físicos de predictibilidad en la selva tropical. Por lo tanto, el sistema clasifica la consulta del usuario en **3 horizontes temporales claramente diferenciados en la UI y en la API**:

| Horizonte Temporal | Rango de Fechas | Fuente de Datos | Nivel de Certeza del Clima | Etiqueta / Badge en la UI | Comportamiento del Sistema |
| :--- | :---: | :--- | :---: | :---: | :--- |
| **1. Alta Precisión (En Vivo)** | **Hoy hasta +4 días** | Modelos numéricos de alta resolución (GFS/ECMWF en Open-Meteo) | **90% - 95% (Alta)** | 🟢 `Pronóstico en Tiempo Real` | Datos horarios precisos de lluvia, temperatura, viento y radiación UV. |
| **2. Tendencia Extendida** | **De +5 a +14 días** | Pronóstico de ensamble meteorológico a mediano plazo | **65% - 75% (Moderada)** | 🟡 `Tendencia Meteorológica` | Muestra rangos probables (mín/máx) indicando que el clima puede variar al acercarse la fecha. |
| **3. Proyección Estacional / Climatológica** | **Más de 14 días a futuro** (ej. dentro de varios meses) | Modelo Climatológico de Selva Alta de Tingo María (Open-Meteo Archive + DIRCETUR) | **Estimación Estacional** | 🔵 `Proyección Estacional Histórica` | Informa al usuario: *"Para fechas lejanas, el sistema proyecta basándose en la temporada climática de Tingo María (Seca vs. Lluviosa) y el calendario festivo."* |
| **4. Histórico Real** | **Fechas Pasadas** | Open-Meteo Archive API | **100% (Dato Real Ocurrido)** | 🟣 `Registro Histórico Registrado` | Consulta los valores climáticos que ocurrieron exactamente ese día en Jacintillo. |

---

## 4. Endpoints y Parámetros de Consulta

### 4.1 Endpoint de Pronóstico (Hasta 14-16 días)
- **URL Base:** `https://api.open-meteo.com/v1/forecast`
- **Query Parameters:**
  ```text
  latitude=-9.2950
  longitude=-75.9980
  daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,uv_index_max
  timezone=America/Lima
  start_date={YYYY-MM-DD}
  end_date={YYYY-MM-DD}
  ```

### 4.2 Endpoint de Archivo Histórico (Fechas Pasadas)
- **URL Base:** `https://archive-api.open-meteo.com/v1/archive`
- **Query Parameters:**
  ```text
  latitude=-9.2950
  longitude=-75.9980
  daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max
  timezone=America/Lima
  start_date={YYYY-MM-DD}
  end_date={YYYY-MM-DD}
  ```

---

## 5. Tabla de Clasificación de Códigos Meteorológicos (WMO)

| Código WMO | Descripción Técnica | Interpretación en Jacintillo | Factor Clima ($F_{\text{clima}}$) | Icono UI Sugerido |
| :---: | :--- | :--- | :---: | :---: |
| `0` | Clear sky | Cielo despejado y radiante | `1.35` | ☀️ Sol despejado |
| `1, 2` | Mainly clear / Partly cloudy | Parcialmente nublado, calor agradable | `1.20` | ⛅ Sol entre nubes |
| `3` | Overcast | Cielo completamente cubierto, bochorno | `1.00` | ☁️ Nublado |
| `45, 48` | Fog / Depositing rime fog | Niebla matutina de ceja de selva | `0.90` | 🌫️ Niebla |
| `51, 53, 55` | Drizzle (Light, Moderate, Dense) | Garúa o llovizna suave | `0.75` | 🌦️ Llovizna |
| `61, 63` | Rain (Slight, Moderate) | Lluvia regular de selva | `0.45` | 🌧️ Lluvia moderada |
| `65` | Heavy rain | Lluvia torrencial continua | `0.25` | 🌧️ Torrencial |
| `80, 81, 82` | Rain showers | Chubascos intermitentes | `0.40` | 🌦️ Chubascos |
| `95, 96, 99` | Thunderstorm with/without hail | Tormenta eléctrica tropical con truenos | `0.10` | ⛈️ Tormenta eléctrica |

---

## 6. Estructura de Respuesta Normalizada por BackendAgent con Horizon Metadata
```json
{
  "query_date": "2026-09-27",
  "temporal_horizon": {
    "type": "REALTIME_FORECAST",
    "days_from_now": 2,
    "confidence_level": "ALTA (92%)",
    "badge_text": "Pronóstico en Tiempo Real (Alta Precisión)"
  },
  "temperature": {
    "max_celsius": 31.2,
    "min_celsius": 21.8
  },
  "precipitation": {
    "total_mm": 0.5,
    "probability_percent": 15
  },
  "wind": {
    "max_speed_kmh": 9.4
  },
  "uv_index": {
    "max_value": 9.8
  },
  "wmo_code": 1,
  "condition_description": "Mayormente soleado y caluroso",
  "source": "Open-Meteo High-Resolution Forecast"
}
```

---

## 7. Estrategia de Resiliencia y Fallback (Alta Disponibilidad)
1. **Cache en Base de Datos / Memoria:** TTL de 3 horas para la misma fecha.
2. **Modelo Estacional Automático:** Si la fecha solicitada supera los 14 días o la API experimenta fallos de conectividad, se aplican los perfiles climáticos históricos de Tingo María:
   - *Mayo a Octubre (Temporada Seca):* Media 30.5°C, Lluvia 1.0 mm, Probabilidad 15%.
   - *Noviembre a Abril (Temporada de Lluvias):* Media 27.2°C, Lluvia 7.8 mm, Probabilidad 70%.
