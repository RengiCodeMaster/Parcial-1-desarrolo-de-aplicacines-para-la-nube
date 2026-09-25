# Especificación 06: Arquitectura Cloud Desacoplada, Stack Tecnológico y Buenas Prácticas

## 1. Arquitectura de Software y Cloud Desacoplada

### 1.1 Patrón Arquitectónico: Microservicios Desacoplados (Frontend React + Backend Express)
El sistema adopta una arquitectura desacoplada en dos aplicaciones independientes comunicadas mediante HTTP REST:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React SPA + Vite)                      │
│        (Componentes Funcionales, Hooks, Estado Reactivo, Glassmorphism)     │
│                 Servido con Nginx en Producción (Puerto 80)                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST / JSON (Proxy /api)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND API (Node.js LTS / Express)                   │
│        Router Express (/api/predict, /api/auth, /api/visits) (Puerto 3000)   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────────┐
│     ADAPTADOR DE INFRAESTRUCTURA      │ │       PERSISTENCIA EN NUBE        │
│ Cliente HTTP Open-Meteo (Resiliente)  │ │      PostgreSQL (Docker Compose)  │
└───────────────────────────────────────┘ └───────────────────────────────────┘
```

---

## 2. Stack Tecnológico Seleccionado y Justificación

| Capa | Tecnología Seleccionada | Justificación Técnica |
| :--- | :--- | :--- |
| **Frontend Web** | **React 18/19 + Vite** | Arquitectura reactiva basada en componentes y Virtual DOM. Permite renderizado ultra-rápido, gestión de estado limpia con Hooks y hot-reloading instantáneo. Servido con Nginx en contenedor Docker. |
| **Backend Runtime** | **Node.js (v18+ LTS) / Express** | Microservicio API REST independiente en `/backend` con modelo I/O no bloqueante. |
| **Persistencia** | **PostgreSQL 15 (Docker) + Memory Fallback** | Base de datos relacional para usuarios y visitas agendadas con volumen Docker persistente. |
| **Testing** | **Node Test Runner (QAAgent)** | 17 pruebas unitarias automatizadas independientes en `backend/tests/`. |
| **CI/CD Cloud** | **GitHub Actions** | Validación de tests de backend y compilación de React antes de desplegar en AWS EC2. |

---

## 3. Estructura de Directorios Desacoplada
```
PARCIAL1/
├── backend/                      <-- ⚙️ MICROSERVICIO BACKEND (Node.js / Express)
│   ├── src/                      (Lógica de negocio, Open-Meteo, BD, JWT)
│   ├── tests/                    (Pruebas unitarias de QAAgent)
│   ├── Dockerfile                (Contenedor Node.js)
│   └── package.json
│
├── frontend/                     <-- 💻 MICROSERVICIO FRONTEND (React SPA)
│   ├── src/                      (App.jsx, App.css, main.jsx)
│   ├── public/
│   ├── Dockerfile                (Contenedor React + Nginx)
│   ├── vite.config.js            (Configuración Vite y proxy)
│   └── package.json
│
├── specs/                        <-- 📋 8 Especificaciones Técnicas
├── antigravity/agents/           <-- 🤖 4 Agentes Especializados
└── docker-compose.yml            <-- 🐳 Orquestador Multi-Contenedor (Frontend + Backend + DB)
```
