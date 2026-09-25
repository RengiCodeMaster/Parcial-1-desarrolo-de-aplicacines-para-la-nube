# Especificación 05: Interfaz de Usuario y Experiencia (UI/UX) - Edición Turismo Amazónico

## 1. Dirección de Arte: Adiós al "Look Genérico de IA"
Las plantillas típicas de IA suelen abusar de tarjetas genéricas violeta/verde fosforescente sin alma ni identidad local. En esta especificación, la dirección de arte se fundamenta en la **Selva Alta de Huánuco** y la identidad única de **Jacintillo**:

- **Fondo Atmosférico:** Oscuro profundo de noche amazónica (`#030d09`), no negro puro plano, con sutiles halos de neblina de selva.
- **Color Clave de Identidad (Turquesa Azufrado):** `#00F5D4` y `#05B292` (el color mineral distintivo de las pozas de Jacintillo cuando les da el sol).
- **Acento Solar:** Dorado cálido de atardecer en el Valle del Huallaga (`#FFB703`).
- **Tipografía Editorial:** Encabezados con carácter (*Plus Jakarta Sans* y *Outfit* con tracking ceñido `-0.5px`), números tabulares para datos meteorológicos legibles y métricas limpias.
- **Micro-datos Locales Reales:**
  - Altitud oficial: `660 m.s.n.m.`
  - Río cercano: *Río Monzón*
  - Cerro guardián: *Cerro Cotomono*
  - Advertencias por lluvia: Mención al caudal del manantial y arcilla de selva resbaladiza.

---

## 2. Jerarquía de Componentes Visuales

### 2.1 Hero Territorial de Jacintillo (No una tarjeta genérica)
- Título con jerarquía editorial: **"Aguas Sulfurosas de Jacintillo"** con sub-tag: *"Tingo María, Puerta de la Amazonía"*.
- Indicador en vivo de estado del atractivo: Badge pulsante *"Poza Abierta al Baño Medicinal"*.
- Pestañas rápidas con identidad cultural:
  - 🌿 **Hoy**
  - ☀️ **Mañana**
  - 🏖️ **Fin de Semana**
  - 🦜 **Fiesta de San Juan (24 Jun)** (La fecha más icónica de Tingo María)
  - 🇵🇪 **Fiestas Patrias (28 Jul)**

### 2.2 Dashboard Dual: Meteorología de Selva vs. Concurrencia Humana
- **Tarjeta Izquierda (Meteorología en Vivo):**
  - Temperatura grande nítida con badge de sensación térmica por humedad.
  - Indicadores detallados: Radiación solar UV con advertencia dermatológica, milímetros de lluvia pluvial y probabilidad de tormenta.
  - Badge de certeza meteorológica científica:
    - 🟢 *Pronóstico en Tiempo Real (< 4 días)*
    - 🟡 *Tendencia Meteorológica (< 14 días)*
    - 🔵 *Proyección Climatológica Estacional (> 14 días)*

- **Tarjeta Derecha (Capacidad de Carga y Visitantes):**
  - Contador numérico prominente con intervalo de confianza estadístico.
  - Barra de densidad humana con referencia al aforo físico de la poza (~800 personas máx.).
  - Semáforo de congestión:
    - 🟢 *Tranquilo (Baja)*
    - 🔵 *Equilibrado (Moderada)*
    - 🟡 *Concurrido (Alta)*
    - 🔴 *Al Límite (Saturación de Poza)*
  - Botón interactivo: *"Agendar esta Visita en mi Itinerario"*.

### 2.3 Guía de Selva y Recomendaciones para el Turista
- Alertas dinámicas sobre el uso de bloqueador solar biodegradable para no alterar los minerales de azufre del agua.
- Horarios sugeridos para encontrar el agua turquesa con mayor transparencia y menor turbidez.

### 2.4 Línea de Tiempo de 7 Días
- Tarjetas horizontales de lunes a domingo para comparar cuál es el mejor día de la semana para viajar a Jacintillo.

### 2.5 Modal de Acceso con Credenciales de Demostración
- Login y Registro con accesos de prueba para el evaluador:
  - `turista@demo.com` (Juan Turista)
  - `admin@tingomaria.gob.pe` (Admin DIRCETUR)
