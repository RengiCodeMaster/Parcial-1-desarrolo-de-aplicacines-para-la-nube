# Especificación 01: Visión General del Sistema, Requerimientos y Flujo End-to-End

## 1. Información General del Proyecto
- **Nombre del Proyecto:** Sistema Predictivo de Afluencia Turística Basado en Clima - Aguas Sulfurosas de Jacintillo
- **Ubicación del Recurso Turístico:** Centro Poblado de Jacintillo, Tingo María, Distrito de Rupa-Rupa, Provincia de Leoncio Prado, Región Huánuco, Perú.
- **Coordenadas Geográficas:** Latitud `-9.2950` S, Longitud `-75.9980` W (Altitud ~660 m.s.n.m.).
- **Asignatura:** Desarrollo de Aplicaciones para la Nube - Evaluación Parcial 1.
- **Metodología de Desarrollo:** **Spec-Driven Development (SDD)** con Arquitectura Multi-Agente Autónoma (**Agent-Oriented AI Execution**).
- **Premisa de Ejecución:** El estudiante no interviene manualmente el código; el sistema completo es orquestado por agentes autónomos de Inteligencia Artificial guiados por especificaciones técnicas (`specs/`).

---

## 2. Justificación y Contexto Turístico
Las **Aguas Sulfurosas de Jacintillo** son un manantial subterráneo azufrado de tonalidad turquesa con propiedades medicinales y una poza natural de ~30m de diámetro rodeada de vegetación. 

### El Problema
1. **Sensibilidad Climatológica:** La afluencia de personas colapsa en días de lluvia tropical torrencial o frío, pero desborda la capacidad física en días soleados (>28°C) y feriados (San Juan, 28 Julio).
2. **Inexistencia de Sensores Físicos (IoT):** Al ser una reserva natural abierta, no existe conteo de torniquetes. Se requiere un **modelo matemático de estimación de capacidad de carga** calibrado con estadísticas de MINCETUR y meteorología en tiempo real.
3. **Planificación del Turista y Autoridades:** El turista necesita agendar y planificar sus visitas con antelación, y los administradores locales necesitan monitorear posibles sobreaforos.

---

## 3. Requerimientos Funcionales (RF)

| ID | Módulo | Requerimiento Funcional | Criterio de Aceptación |
| :--- | :--- | :--- | :--- |
| **RF-01** | Selección Temporal | El usuario puede seleccionar cualquier fecha mediante calendario interactivo o accesos rápidos (Hoy, Mañana, Fin de semana, Feriados). | Permite consultar fechas pasadas (análisis histórico) y futuras (pronóstico hasta 14 días y estacional). |
| **RF-02** | Extracción Meteorológica | El sistema consulta Open-Meteo para las coordenadas exactas de Jacintillo (`-9.2950, -75.9980`). | Extrae Temperatura Máx/Mín, Precipitación (mm), Probabilidad de lluvia (%), Viento (km/h) y Radiación UV. |
| **RF-03** | Predicción de Afluencia | El motor algorítmico evalúa las variables climáticas y el calendario para calcular el aforo estimado (número de personas). | Retorna la cantidad estimada con intervalo de confianza ($\pm 8\%$) y nivel de congestión (Bajo, Moderado, Alto, Saturado). |
| **RF-04** | Capacidad de Carga y Alertas | El sistema calcula el porcentaje de ocupación respecto a la capacidad de carga ambiental del sitio natural (~800 a 1,200 personas simultáneas máximas). | Emite advertencias visuales si el aforo proyectado supera el 85% de capacidad. |
| **RF-05** | Autenticación y Roles (Login/JWT) | Sistema de registro e inicio de sesión con contraseñas encriptadas (bcrypt) y tokens JWT. | Roles: `TURISTA` y `ADMIN` (Municipalidad/DIRCETUR). |
| **RF-06** | Agendamiento de Visitas (Turista) | El turista autenticado puede agendar una fecha consultada en su lista de visitas personales a Aguas Sulfurosas. | Persistencia en base de datos PostgreSQL y consulta en panel personal. |
| **RF-07** | Panel de Monitoreo (Admin) | El administrador autenticado visualiza métricas de capacidad de carga, alertas de saturación y consultas de usuarios. | Dashboard analítico exclusivo para el rol `ADMIN`. |
| **RF-08** | Recomendaciones Turísticas IA | Genera recomendaciones contextuales personalizadas según el resultado climático y aforo. | Sugerencias sobre vestimenta, horas óptimas de baño, protección solar y precauciones fluviales. |

---

## 4. Requerimientos No Funcionales (RNF)

| ID | Categoría | Requerimiento No Funcional |
| :--- | :--- | :--- |
| **RNF-01** | **Rendimiento** | Tiempo de respuesta del endpoint de predicción menor a 800 ms bajo condiciones normales de red. |
| **RNF-02** | **Disponibilidad Cloud** | Arquitectura contenerizada con Docker Compose en AWS EC2, con failover local si la API externa o la BD experimenta latencia. |
| **RNF-03** | **Seguridad** | Contraseñas cifradas con bcrypt, tokens de sesión JWT, sanitización de inputs con Regex ISO 8601 y variables de entorno aisladas. |
| **RNF-04** | **Diseño y Estética (UI/UX)** | Interfaz moderna con principios de Glassmorphism amazónico, responsiva Mobile-First. |
| **RNF-05** | **CI/CD Automatizado** | Pipeline continuo gestionado integralmente mediante **GitHub Actions** hacia AWS EC2. |

---

## 5. Diagrama de Flujo General e Integrado del Sistema

```
                        ┌───────────────────────────────────┐
                        │      USUARIO (Público / Turista)  │
                        └─────────────────┬─────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
         [ Consulta Libre ]                               [ Módulo Autenticación ]
  (Selecciona Fecha en Calendario)                        (Registro / Inicio de Sesión)
                  │                                               │
                  │                                               ▼
                  │                                   [ BackendAgent: /api/auth ]
                  │                                   (Verifica Bcrypt / Genera JWT)
                  │                                               │
                  │                                               ▼
                  │                                     [ Token JWT en Cliente ]
                  │                                               │
                  ▼                                               ▼
    [ Solicitud: GET /api/predict ]               [ Opciones Autenticadas Desbloqueadas ]
                  │                                 • Turista: Agendar Visita a Jacintillo
                  ▼                                 • Admin: Panel de Sobreaforo y Métricas
          [ BackendAgent ]                                        │
                  │                                               ▼
       ┌──────────┴────────────────────────┐             [ Base de Datos PostgreSQL ]
       ▼                                   ▼             (scheduled_visits / users)
 [ Caché / BD ]                 [ API Open-Meteo ]
 (¿Existe en BD?)              (Lat: -9.295, Lon: -75.998)
       │                                   │
       └──────────┬────────────────────────┘
                  │
                  ▼
       [ Motor Matemático $V(d)$ ]
       (Specs 03: Calendario + Clima + Aforo)
                  │
                  ▼
       [ Respuesta JSON Unificada ]
                  │
                  ▼
          [ FrontendAgent ]
  (Dashboard, Termómetro, Medidor Gauge,
   Tips de Selva y Botón "Agendar Visita")
```
