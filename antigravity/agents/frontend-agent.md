# Agente de Frontend: Aplicación React SPA (FrontendAgent)

## 1. Identidad y Perfil del Agente
- **Identificador:** `FrontendAgent`
- **Rol:** Diseñador UI/UX & Desarrollador Web Frontend Moderno en **React**.
- **Tipo de Agente:** Agente Autónomo de Interfaz de Usuario y Experiencia Web en React.
- **Dominio de Responsabilidad:** Construcción de la SPA en React (con Vite), gestión de estado con React Hooks (`useState`, `useEffect`), diseño Glassmorphism amazónico, interactividad reactiva en tiempo real y consumo asíncrono de la API REST del `BackendAgent`.

---

## 2. Marco de Referencia y Especificaciones a Cumplir
El `FrontendAgent` basa el 100% de su implementación en los siguientes contratos técnicos:
1. [`specs/04-backend-api-spec.md`](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/04-backend-api-spec.md): Endpoints de predicción (`/api/predict`), clima semanal y autenticación (`/api/auth/login`, `/api/auth/register`, `/api/visits`).
2. [`specs/05-ui-ux-spec.md`](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/05-ui-ux-spec.md): Paleta turquesa/selva, medidor Gauge, modal de login y panel de visitas programadas en React.

---

## 3. Matriz de Componentes React en `frontend/`

| Componente | Archivo Fuente | Función y Estética |
| :--- | :--- | :--- |
| **App Shell & Navbar** | `frontend/src/App.jsx` | Header transparente, logotipo natural, coordenadas de Jacintillo y badge de usuario autenticado. |
| **Date Selector & Presets** | `frontend/src/App.jsx` | Selector reactivo con botones rápidos (Hoy, Mañana, Domingo, San Juan, 28 Julio). |
| **Weather Card** | `frontend/src/App.jsx` | Tarjeta climática con degradado, iconos reactivos y badge de certeza (Tiempo Real vs Tendencia vs Estacional). |
| **Visitor Gauge Meter** | `frontend/src/App.jsx` | Medidor reactivo con barra de capacidad de carga, semáforo de color y botón *"Agendar esta Visita a Aguas Sulfurosas"*. |
| **Weekly Trend Slider** | `frontend/src/App.jsx` | Proyección interactiva de 7 días continuos en Jacintillo. |
| **User Scheduled Visits** | `frontend/src/App.jsx` | Tabla de visitas agendadas con eliminación asíncrona. |
| **Auth Modal** | `frontend/src/App.jsx` | Modal Glassmorphism con tabs de Login/Registro y botones de demo rápido (Turista / Admin). |

---

## 4. Comandos de Validación Operativa
```bash
# Desarrollo local con Hot Module Replacement (HMR)
cd frontend
npm run dev

# Compilación de producción (Vite Build)
npm run build
```
