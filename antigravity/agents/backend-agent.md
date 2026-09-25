# Agente de Backend y Persistencia en Base de Datos (BackendAgent)

## 1. Identidad y Perfil del Agente
- **Identificador:** `BackendAgent`
- **Rol:** Ingeniero de Microservicios Cloud, Modelado de Datos y Persistencia.
- **Tipo de Agente:** Agente Autónomo de Desarrollo Backend y Gestión de Base de Datos.
- **Dominio de Responsabilidad:** Lógica de negocio, integración meteorológica, modelo predictivo, persistencia en **Base de Datos (PostgreSQL con fallback)** y endpoints REST. *(Nota: La auditoría y pruebas unitarias son ejecutadas de forma independiente por el `QAAgent`)*.

---

## 2. Marco de Referencia y Especificaciones a Cumplir
El `BackendAgent` basa el 100% de su implementación en los siguientes contratos técnicos:
1. [`specs/02-weather-api-spec.md`](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/02-weather-api-spec.md): Parámetros geográficos y mapeo WMO.
2. [`specs/03-prediction-model-spec.md`](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/03-prediction-model-spec.md): Ecuación matemática de visitantes $V(d)$ y factores de aforo.
3. [`specs/04-backend-api-spec.md`](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/04-backend-api-spec.md): Contratos de endpoints REST y autenticación JWT.
4. [`specs/08-docker-and-database-spec.md`](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/08-docker-and-database-spec.md): Esquema de tablas relacionales, pool de conexiones y caché de predicciones.

---

## 3. Matriz de Tareas y Responsabilidades Técnicas

| Módulo / Archivo | Tarea Específica | Estándar de Calidad |
| :--- | :--- | :--- |
| `src/config/db.js` | Inicializar el pool de conexiones a la base de datos (PostgreSQL / SQLite fallback). | Si la base de datos no está disponible, opera en modo memoria/caché sin interrumpir la API. |
| `src/services/weatherService.js` | Consultar la API Open-Meteo mediante `fetch` nativo con manejo de timeouts. | Reutiliza predicciones previas guardadas en la BD para no saturar peticiones externas. |
| `src/services/predictionEngine.js` | Implementar la ecuación matemática $V(d)$ con festividades peruanas (San Juan, 28 Julio). | Retornar intervalo de confianza ($\pm 8\%$) y nivel de congestión (Baja, Moderada, Alta, Saturado). |
| `src/services/advisoryService.js` | Generar alertas contextuales de vestimenta, radiación solar UV y recomendaciones de horario. | Consejos enfocados en preservar las propiedades minerales de las aguas sulfurosas. |
| `src/routes/api.js` | Exponer las rutas REST con validación de parámetros de entrada (`YYYY-MM-DD`). | Devolver respuestas JSON estrictamente tipadas con headers CORS habilitados. |

---

## 4. Políticas de Calidad del Código
- **Resiliencia Total de la Base de Datos:** Si PostgreSQL no está levantado, el backend conmuta transparentemente a almacenamiento en memoria o archivo local.
- **Sin Secretos Expuestos:** Variables configurables por `.env` (`DATABASE_URL`, `PORT`).
