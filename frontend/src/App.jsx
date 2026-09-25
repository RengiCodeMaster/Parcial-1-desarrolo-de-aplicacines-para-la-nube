import React, { useState, useEffect } from 'react';
import './App.css';

export function App() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [activePreset, setActivePreset] = useState('today');
  const [predictionData, setPredictionData] = useState(null);
  const [weeklyForecast, setWeeklyForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  // Autenticación
  const [token, setToken] = useState(() => localStorage.getItem('jacintillo_token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authError, setAuthError] = useState('');

  // Visitas Agendadas
  const [userVisits, setUserVisits] = useState([]);

  useEffect(() => {
    fetchPrediction(selectedDate);
    fetchWeeklyTrend();
    if (token) {
      loadUserVisits(token);
    }
  }, []);

  const fetchPrediction = async (date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/predict?date=${date}`);
      const data = await res.json();
      if (data && data.success) {
        setPredictionData(data);
      }
    } catch (err) {
      console.error('Error al obtener predicción:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyTrend = async () => {
    try {
      const res = await fetch('/api/weekly-forecast');
      const data = await res.json();
      if (data && data.success && data.forecast) {
        setWeeklyForecast(data.forecast);
      }
    } catch (err) {
      console.error('Error al obtener tendencia semanal:', err);
    }
  };

  const loadUserVisits = async (authToken) => {
    try {
      const res = await fetch('/api/visits', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data && data.success && data.visits) {
        setUserVisits(data.visits);
      }
    } catch (err) {
      console.error('Error al cargar visitas:', err);
    }
  };

  const handlePresetClick = (preset) => {
    setActivePreset(preset);
    const now = new Date();
    let target = '';

    if (preset === 'today') {
      target = now.toISOString().split('T')[0];
    } else if (preset === 'tomorrow') {
      now.setDate(now.getDate() + 1);
      target = now.toISOString().split('T')[0];
    } else if (preset === 'next-weekend') {
      const day = now.getDay();
      const diff = (7 - day) % 7 || 7;
      now.setDate(now.getDate() + diff);
      target = now.toISOString().split('T')[0];
    } else if (preset === 'san-juan') {
      target = `${now.getFullYear()}-06-24`;
    } else if (preset === 'fiestas-patrias') {
      target = `${now.getFullYear()}-07-28`;
    }

    setSelectedDate(target);
    fetchPrediction(target);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegisterMode 
      ? { email: authEmail, password: authPassword, full_name: authFullName }
      : { email: authEmail, password: authPassword };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al autenticar');
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('jacintillo_token', data.token);
      setShowAuthModal(false);
      loadUserVisits(data.token);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('jacintillo_token');
    setUserVisits([]);
  };

  const handleSaveVisit = async () => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    if (!predictionData) return;

    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          visit_date: selectedDate,
          expected_visitors: predictionData.prediction?.estimated_visitors || 150,
          weather_notes: `${predictionData.weather?.temperature_max_c || 28}°C - ${predictionData.weather?.condition_text || 'Despejado'}`
        })
      });
      const data = await res.json();
      if (data && data.success) {
        alert(`✅ ¡Visita del ${selectedDate} agendada en tu itinerario a Aguas Sulfurosas de Jacintillo!`);
        loadUserVisits(token);
      }
    } catch (err) {
      alert('Error guardando la visita.');
    }
  };

  const handleDeleteVisit = async (id) => {
    try {
      await fetch(`/api/visits/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadUserVisits(token);
    } catch (err) {
      console.error(err);
    }
  };

  // Safe destructuring con valores por defecto
  const weather = predictionData?.weather || {
    temperature_max_c: 30.5,
    temperature_min_c: 21.8,
    precipitation_mm: 0.5,
    precipitation_probability: 15,
    wind_speed_kmh: 8.5,
    uv_index: 9.2,
    condition_text: 'Mayormente soleado y caluroso',
    temporal_horizon: {
      badge_text: 'Pronóstico en Tiempo Real',
      badge_color: '#10b981'
    }
  };

  const prediction = predictionData?.prediction || {
    estimated_visitors: 450,
    confidence_interval: { min_visitors: 414, max_visitors: 486 },
    crowd_level: 'Moderada',
    occupancy_percentage: 56.2,
    theme_color: '#06b6d4',
    crowd_description: 'Afluencia habitual equilibrada, ambiente agradable para baño'
  };

  const advisory = predictionData?.travel_advisory || {
    verdict: 'Clima tropical óptimo en Jacintillo. Ideal para una estadía agradable en contacto con el manantial medicinal.',
    recommended_arrival_hours: '08:30 AM a 11:30 AM',
    sun_protection_advice: 'Usar bloqueador solar biodegradable para preservar los minerales del azufre.',
    packing_recommendations: [
      'Ropa de baño y toalla',
      'Calzado antideslizante para rocas húmedas',
      'Repelente orgánico para insectos de selva'
    ]
  };

  return (
    <div className="jacintillo-shell">
      {/* BARRA SUPERIOR EDITORIAL */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-leaf-badge">♨️</div>
          <div>
            <h1 className="topbar-title">Aguas Sulfurosas <span>Jacintillo</span></h1>
            <div className="topbar-meta">
              <span>Leoncio Prado, Huánuco</span>
              <span>•</span>
              <span className="status-pill-live">
                <span className="pulse-dot"></span>
                Poza Abierta al Baño
              </span>
            </div>
          </div>
        </div>

        <div className="topbar-user">
          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem' }}>
                👤 <strong>{currentUser ? currentUser.full_name : 'Turista Registrado'}</strong>
              </span>
              <button onClick={handleLogout} className="preset-chip-btn" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                Salir
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="btn-action" style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}>
              <span>🔑 Iniciar Sesión</span>
            </button>
          )}
        </div>
      </header>

      {/* HERO TERRITORIAL */}
      <section className="hero-territory">
        <div className="hero-tag">
          <span>🌿 Microclima y Aforo Turístico en Selva Alta</span>
        </div>
        <h2 className="hero-heading">
          Planifica tu visita al manantial medicinal de Tingo María
        </h2>
        <p className="hero-subheading">
          El balneario de <strong>Aguas Sulfurosas de Jacintillo</strong> es una piscina natural de ~30m de diámetro alimentada por aguas subterráneas azufradas. Selecciona una fecha para predecir las condiciones climáticas y el volumen estimado de bañistas.
        </p>

        <div className="search-banner">
          <div className="input-capsule">
            <label htmlFor="react-date-field" style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
              FECHA:
            </label>
            <input
              type="date"
              id="react-date-field"
              className="native-date-input"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                fetchPrediction(e.target.value);
              }}
            />
            <button onClick={() => fetchPrediction(selectedDate)} className="btn-action" disabled={loading}>
              <span>{loading ? 'Consultando...' : 'Calcular Afluencia'}</span>
            </button>
          </div>

          <div className="preset-bar">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Atajos rápidos:</span>
            <button className={`preset-chip-btn ${activePreset === 'today' ? 'active' : ''}`} onClick={() => handlePresetClick('today')}>Hoy</button>
            <button className={`preset-chip-btn ${activePreset === 'tomorrow' ? 'active' : ''}`} onClick={() => handlePresetClick('tomorrow')}>Mañana</button>
            <button className={`preset-chip-btn ${activePreset === 'next-weekend' ? 'active' : ''}`} onClick={() => handlePresetClick('next-weekend')}>Domingo Próximo</button>
            <button className={`preset-chip-btn ${activePreset === 'san-juan' ? 'active' : ''}`} onClick={() => handlePresetClick('san-juan')}>San Juan (24 Jun)</button>
            <button className={`preset-chip-btn ${activePreset === 'fiestas-patrias' ? 'active' : ''}`} onClick={() => handlePresetClick('fiestas-patrias')}>Fiestas Patrias (28 Jul)</button>
          </div>
        </div>
      </section>

      {/* DASHBOARD DUAL PRINCIPAL */}
      <section className="metrics-dual-grid">
        {/* PANEL METEOROLÓGICO */}
        <article className="metric-panel">
          <div>
            <div className="panel-header">
              <div className="panel-title-wrapper">
                <h3>🌦️ Clima en la Poza</h3>
                <p>Coordenadas: Lat -9.295°, Lon -75.998°</p>
              </div>
              {weather.temporal_horizon && (
                <span
                  className="confidence-badge"
                  style={{
                    backgroundColor: `${weather.temporal_horizon.badge_color || '#10b981'}22`,
                    color: weather.temporal_horizon.badge_color || '#10b981',
                    border: `1px solid ${weather.temporal_horizon.badge_color || '#10b981'}44`
                  }}
                >
                  {weather.temporal_horizon.badge_text}
                </span>
              )}
            </div>

            <div className="weather-hero-row">
              <div>
                <div className="temperature-display">
                  {weather.temperature_max_c}°C
                </div>
                <div className="temp-subtext">
                  Mínima nocturna: {weather.temperature_min_c}°C • Humedad de selva
                </div>
              </div>
              <div className="weather-symbol">
                {weather.precipitation_mm > 5 ? '🌧️' : weather.precipitation_mm > 0.5 ? '🌦️' : '☀️'}
              </div>
            </div>

            <div className="weather-condition-pill">
              {weather.condition_text}
            </div>
          </div>

          <div className="quad-metrics">
            <div className="quad-item">
              <div className="quad-label">💧 Prob. Precipitación</div>
              <div className="quad-value">{weather.precipitation_probability}%</div>
            </div>
            <div className="quad-item">
              <div className="quad-label">🌧️ Volumen Lluvia</div>
              <div className="quad-value">{weather.precipitation_mm} mm</div>
            </div>
            <div className="quad-item">
              <div className="quad-label">💨 Brisa de Selva</div>
              <div className="quad-value">{weather.wind_speed_kmh} km/h</div>
            </div>
            <div className="quad-item">
              <div className="quad-label">☀️ Radiación UV</div>
              <div className="quad-value">{weather.uv_index}</div>
            </div>
          </div>
        </article>

        {/* PANEL DE AFLUENCIA Y CAPACIDAD */}
        <article className="metric-panel">
          <div>
            <div className="panel-header">
              <div className="panel-title-wrapper">
                <h3>👥 Proyección de Afluencia</h3>
                <p>Modelo de Capacidad de Carga Física</p>
              </div>
              <span
                className="confidence-badge"
                style={{
                  backgroundColor: `${prediction.theme_color || '#00f5d4'}22`,
                  color: prediction.theme_color || '#00f5d4',
                  border: `1px solid ${prediction.theme_color || '#00f5d4'}55`
                }}
              >
                {prediction.crowd_level}
              </span>
            </div>

            <div className="visitor-counter-zone">
              <div className="big-visitor-number" style={{ color: prediction.theme_color || '#00f5d4' }}>
                {prediction.estimated_visitors}
              </div>
              <div className="visitor-caption">Bañistas Estimados en Jacintillo</div>
              <div className="stat-confidence">
                {prediction.confidence_interval
                  ? `Margen Probable: ${prediction.confidence_interval.min_visitors} a ${prediction.confidence_interval.max_visitors} personas`
                  : 'Calculando...'}
              </div>
            </div>

            <div className="pool-capacity-track">
              <div className="track-labels">
                <span>Ocupación de Poza: <strong>{prediction.occupancy_percentage}%</strong></span>
                <span>Límite Seguro: 800 pers.</span>
              </div>
              <div className="track-bg">
                <div
                  className="track-fill"
                  style={{
                    width: `${Math.min(100, prediction.occupancy_percentage || 0)}%`,
                    backgroundColor: prediction.theme_color || '#00f5d4'
                  }}
                />
              </div>
            </div>

            <div className="crowd-status-banner">
              <div
                className="status-dot-pulse"
                style={{
                  background: prediction.theme_color || '#00f5d4',
                  boxShadow: `0 0 10px ${prediction.theme_color || '#00f5d4'}`
                }}
              />
              <div className="status-banner-text">
                <h4>Concurrencia {prediction.crowd_level}</h4>
                <p>{prediction.crowd_description}</p>
              </div>
            </div>
          </div>

          <button onClick={handleSaveVisit} className="btn-action" style={{ width: '100%', justifyContent: 'center' }}>
            <span>⭐ Agendar esta Visita en mi Itinerario</span>
          </button>
        </article>
      </section>

      {/* RECOMENDACIONES DE SELVA */}
      <section className="jungle-advisory-card">
        <h3 className="advisory-title">🌿 Guía Práctica para Visitar Aguas Sulfurosas</h3>
        <div className="verdict-callout">{advisory.verdict}</div>
        <div className="tips-tri-grid">
          <div className="tip-block">
            <h5>⏰ Horario Óptimo de Ingreso</h5>
            <p>{advisory.recommended_arrival_hours}</p>
          </div>
          <div className="tip-block">
            <h5>🧴 Protección Solar y Composición</h5>
            <p>{advisory.sun_protection_advice}</p>
          </div>
          <div className="tip-block">
            <h5>🎒 Equipamiento para el Balneario</h5>
            <ul>
              {advisory.packing_recommendations?.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* LÍNEA DE TIEMPO DE 7 DÍAS */}
      <section className="timeline-section">
        <h3 className="timeline-title">📈 Proyección de los Próximos 7 Días en Jacintillo</h3>
        <p className="timeline-caption">Compara el mejor día de la semana para viajar:</p>
        <div className="timeline-row">
          {weeklyForecast.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando tendencia semanal...</div>
          ) : (
            weeklyForecast.map((day) => (
              <div
                key={day.date}
                className={`timeline-cell ${day.date === selectedDate ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedDate(day.date);
                  fetchPrediction(day.date);
                }}
              >
                <div className="cell-day-name">{day.day_name}</div>
                <div className="cell-date-short">{day.date.substring(5)}</div>
                <div className="cell-icon">{day.precipitation_mm > 5 ? '🌧️' : day.precipitation_prob > 35 ? '⛅' : '☀️'}</div>
                <div className="cell-temp">{day.temperature_max}°C</div>
                <div className="cell-crowd-pill" style={{ backgroundColor: day.theme_color || '#00f5d4' }}>
                  {day.estimated_visitors} pers.
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* MIS VISITAS AGENDADAS */}
      {token && (
        <section className="timeline-section">
          <h3 className="timeline-title">📅 Mis Visitas Programadas a Aguas Sulfurosas</h3>
          <p className="timeline-caption">Fechas guardadas en tu cuenta:</p>
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Fecha</th>
                  <th style={{ padding: '0.75rem' }}>Afluencia Estimada</th>
                  <th style={{ padding: '0.75rem' }}>Pronóstico</th>
                  <th style={{ padding: '0.75rem' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {userVisits.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No tienes visitas agendadas. Consulta una fecha y haz clic en "Agendar esta Visita".
                    </td>
                  </tr>
                ) : (
                  userVisits.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem' }}><strong>{v.visit_date.substring(0, 10)}</strong></td>
                      <td style={{ padding: '0.75rem', color: 'var(--jacintillo-turquoise)', fontWeight: 700 }}>{v.expected_visitors} personas</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{v.weather_notes}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          onClick={() => handleDeleteVisit(v.id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(255, 77, 109, 0.4)',
                            color: 'var(--danger-crimson)',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="app-end-footer">
        <p><strong>Aguas Sulfurosas de Jacintillo</strong> • Desarrollo de Aplicaciones para la Nube</p>
        <p style={{ marginTop: '0.35rem' }}>
          Tingo María, Distrito de Rupa-Rupa, Provincia de Leoncio Prado, Huánuco, Perú.
        </p>
      </footer>

      {/* MODAL DE AUTENTICACIÓN */}
      {showAuthModal && (
        <div className="backdrop-modal" onClick={() => setShowAuthModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{isRegisterMode ? 'Crear Cuenta de Turista' : 'Iniciar Sesión'}</h3>
              <button onClick={() => setShowAuthModal(false)} className="btn-dismiss">&times;</button>
            </div>

            <div className="demo-credentials-banner">
              <strong>Acceso Rápido de Evaluación para el Docente:</strong>
              <div className="demo-buttons-flex">
                <button
                  type="button"
                  onClick={() => { setAuthEmail('turista@demo.com'); setAuthPassword('turista123'); }}
                  className="btn-demo-pill"
                >
                  👤 Turista Demo
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthEmail('admin@tingomaria.gob.pe'); setAuthPassword('admin123'); }}
                  className="btn-demo-pill"
                >
                  🛡️ Admin DIRCETUR
                </button>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit}>
              {isRegisterMode && (
                <div className="form-field">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="Ej: Carlos Silva"
                    required
                  />
                </div>
              )}
              <div className="form-field">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
              <div className="form-field">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {authError && <div style={{ color: 'var(--danger-crimson)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{authError}</div>}

              <button type="submit" className="btn-action" style={{ width: '100%', justifyContent: 'center' }}>
                <span>{isRegisterMode ? 'Registrarse' : 'Ingresar al Sistema'}</span>
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>{isRegisterMode ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}</span>{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                style={{ background: 'none', border: 'none', color: 'var(--jacintillo-turquoise)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isRegisterMode ? 'Iniciar Sesión' : 'Registrarse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
