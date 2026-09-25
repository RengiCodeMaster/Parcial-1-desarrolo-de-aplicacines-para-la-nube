# 🌿 Sistema Predictivo de Afluencia Turística - Aguas Sulfurosas de Jacintillo

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?logo=github-actions)](.github/workflows/deploy.yml)
[![Docker](https://img.shields.io/badge/Docker-Multi--Container-2496ED?logo=docker)](specs/08-docker-and-database-spec.md)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Persistent-336791?logo=postgresql)](specs/08-docker-and-database-spec.md)
[![Cloud Provider](https://img.shields.io/badge/Cloud%20Provider-AWS%20(EC2)-FF9900?logo=amazon-aws)](specs/07-aws-deployment-spec.md)
[![Cloud Architecture](https://img.shields.io/badge/Architecture-Clean%20%2F%20Hexagonal-purple)](specs/06-architecture-and-standards-spec.md)
[![Standard](https://img.shields.io/badge/Standard-12--Factor%20App-success)](specs/06-architecture-and-standards-spec.md)
[![Weather API](https://img.shields.io/badge/Weather%20API-Open--Meteo-orange)](specs/02-weather-api-spec.md)
[![Location](https://img.shields.io/badge/Location-Tingo%20Mar%C3%ADa%2C%20Per%C3%BA-green)](https://maps.google.com/?q=-9.2950,-75.9980)

> **Evaluación Parcial 1 - Desarrollo de Aplicaciones para la Nube**  
> **Metodología Oficial:** *Spec-Driven Development (SDD)* con *Agent-Oriented AI Execution*.  
> **Premisa:** 100% desarrollado y orquestado mediante Agentes Autónomos de Inteligencia Artificial guiados por especificaciones técnicas, sin modificación manual de código.

---

## 📍 1. Resumen Ejecutivo del Proyecto
El proyecto implementa un sistema inteligente en la nube que pronostica y estima la **cantidad diaria de personas que visitarán las Aguas Sulfurosas de Jacintillo** (Tingo María, Huánuco, Perú). 

El sistema cruza en tiempo real las variables meteorológicas de la API **Open-Meteo** (temperatura, volumen de lluvia, probabilidad de precipitación, radiación UV) con un **modelo matemático de capacidad de carga turística** calibrado con estadísticas oficiales regionales y el calendario festivo peruano (San Juan, Fiestas Patrias, fines de semana).

---

## 🐳 2. Despliegue en 1 Solo Paso con Docker y Docker Compose
Toda la solución (Frontend, Backend API y Base de Datos) está contenerizada para máxima portabilidad en la nube.

```bash
# Levantar el stack completo (App + Base de Datos + Red interna)
docker compose up -d --build

# Ver el estado de los contenedores
docker compose ps
```
* Acceso a la aplicación: `http://localhost:3000` o `http://localhost` (puerto 80).

---

## 🏗️ 3. Arquitectura Cloud (AWS) y Stack Tecnológico
El proyecto aplica una **Arquitectura Limpia / Hexagonal (Ports & Adapters)** cumpliendo con los principios **12-Factor App** y desplegada en **Amazon Web Services (AWS)**:

* **Contenerización:** **Docker** y **Docker Compose** con volumen persistente (`db_data`) y red aislada.
* **Base de Datos:** **PostgreSQL** (con fallback resiliente en memoria si se ejecuta sin BD).
* **Backend Runtime:** Node.js (v18+ LTS) con Express sirviendo la API REST y los archivos estáticos en un **Monorepo Unificado**.
* **Frontend Web:** HTML5 Semántico + Vanilla CSS con diseño Glassmorphism + JavaScript ES6+ modular (Cero dependencias pesadas, carga instantánea a 60 FPS).
* **Integración Meteorológica:** Open-Meteo Forecast & Archive API (Coordenadas geográficas exactas `-9.2950, -75.9980`).
* **DevOps & CI/CD:** **GitHub Actions** conectado a AWS EC2 mediante SSH seguro ejecutando `docker compose`.

---

## 📑 4. Especificaciones Técnicas (`specs/`)
Todo el diseño de ingeniería de software se encuentra estructurado y desacoplado en la carpeta [`specs/`](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs):

| Archivo de Especificación | Propósito y Contenido Clave |
| :--- | :--- |
| 📋 [**`specs/01-system-spec.md`**](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/01-system-spec.md) | **Requerimientos del Sistema:** Justificación del atractivo, requerimientos funcionales (RF) y no funcionales (RNF), diagramas de flujo integrados. |
| 🌦️ [**`specs/02-weather-api-spec.md`**](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/02-weather-api-spec.md) | **Integración Meteorológica:** Coordenadas exactas (`-9.2950, -75.9980`), horizonte de 4 días de alta precisión en tiempo real vs tendencia vs proyección estacional. |
| 🧠 [**`specs/03-prediction-model-spec.md`**](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/03-prediction-model-spec.md) | **Modelo Predictivo de Afluencia:** Fórmula matemática $V(d)$, factores multiplicadores (calendario, fines de semana, Fiesta de San Juan, lluvia, calor, estacionalidad), capacidad de carga y umbrales de aforo. |
| 🔌 [**`specs/04-backend-api-spec.md`**](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/04-backend-api-spec.md) | **Contratos de API REST:** Definición formal de endpoints (`/api/predict`, `/api/health`, `/api/auth/login`, `/api/visits`), esquemas JSON y códigos HTTP. |
| 🎨 [**`specs/05-ui-ux-spec.md`**](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/05-ui-ux-spec.md) | **Diseño y Experiencia UI/UX:** Paleta amazónica turquesa, Glassmorphism, medidor semicircular de visitantes (Gauge), modal de autenticación con botones Demo y panel de visitas programadas a Jacintillo. |
| 🏛️ [**`specs/06-architecture-and-standards-spec.md`**](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/06-architecture-and-standards-spec.md) | **Arquitectura Cloud y Buenas Prácticas:** Principios SOLID, Clean Code, estándares 12-Factor App, OWASP, accesibilidad WCAG y pirámide de testing. |
| ☁️ [**`specs/07-aws-deployment-spec.md`**](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/07-aws-deployment-spec.md) | **Despliegue Cloud en AWS:** Configuración de EC2, Nginx, PM2, GitHub Secrets y flujo automatizado CI/CD en GitHub Actions. |
| 🐳 [**`specs/08-docker-and-database-spec.md`**](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/08-docker-and-database-spec.md) | **Docker y Base de Datos:** Contenerización multi-contenedor, Dockerfile multi-stage, `docker-compose.yml`, esquemas SQL (`users`, `scheduled_visits`, `predictions_cache`) y persistencia con volúmenes. |

---

## 🤖 5. Agentes Autónomos Especializados (`antigravity/agents/`)
El sistema divide estrictamente sus responsabilidades entre **4 agentes de IA especializados** en la carpeta [`antigravity/agents/`](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/antigravity/agents):

1. ⚙️ [**`BackendAgent`**](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/antigravity/agents/backend-agent.md):
   * Consume la API Open-Meteo de forma asíncrona.
   * Ejecuta el motor matemático de predicción turística y cálculo de intervalos de confianza.
   * Gestiona el pool de la Base de Datos con caché resiliente y endpoints REST.

2. 💻 [**`FrontendAgent`**](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/antigravity/agents/frontend-agent.md):
   * Diseña e implementa la interfaz web responsiva, accesible (WCAG) y moderna con Glassmorphism.
   * Construye el selector de fecha con atajos inteligentes, medidor Gauge y modal de login.
   * Renderiza el panel de visitas programadas a Jacintillo y panel de administración.

3. 🧪 [**`QAAgent`**](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/antigravity/agents/qa-agent.md):
   * Agente independiente encargado exclusivamente de auditar y validar el software.
   * Diseña y ejecuta la suite de **pruebas unitarias automatizadas** (`tests/`) para el motor matemático, API meteorológica y seguridad.

4. 🚀 [**`DeployAgent`**](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/antigravity/agents/deploy-agent.md):
   * Configura `Dockerfile` y `docker-compose.yml` para levantar la solución en 1 solo comando.
   * Configura el pipeline CI/CD en **GitHub Actions** hacia **AWS EC2** ejecutando previamente las pruebas del `QAAgent`.

---

## 🛡️ 6. Guía para la Revisión Docente
1. **Revisión de Especificaciones:** Inspeccionar la carpeta [`specs/`](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs) para verificar la rigurosidad conceptual del modelo, contratos, arquitectura, Docker y despliegue AWS.
2. **Revisión de Roles de Agentes:** Inspeccionar [`antigravity/agents/`](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/antigravity/agents) para comprobar la separación de responsabilidades (Backend, Frontend, QA y DevOps).
3. **Ejecución de Pruebas Unitarias:** Ejecutar `npm test` para auditar los tests del `QAAgent`.
4. **Ejecución Local Rápida:** Ejecutar `docker compose up -d` y verificar la aplicación completa en el navegador.
5. **Pipeline CI/CD en AWS:** Verificar en GitHub Actions la ejecución automática de pruebas y el despliegue del stack Docker a la instancia EC2.
