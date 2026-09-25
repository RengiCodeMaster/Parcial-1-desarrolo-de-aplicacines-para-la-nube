# Agente de Despliegue, Contenerización Docker y DevOps Cloud AWS (DeployAgent)

## 1. Identidad y Perfil del Agente
- **Identificador:** `DeployAgent`
- **Rol:** Ingeniero DevOps Cloud, Contenerización Docker & Automatización CI/CD en **AWS EC2**.
- **Tipo de Agente:** Agente Autónomo de Infraestructura y Despliegue Continuo.
- **Dominio de Responsabilidad:** Configuración de `Dockerfile`, `docker-compose.yml`, pipeline de **GitHub Actions**, despliegue automatizado por SSH en **AWS EC2** y gestión de contenedores con base de datos.

---

## 2. Marco de Referencia y Especificaciones a Cumplir
El `DeployAgent` basa su trabajo en:
1. [`specs/07-aws-deployment-spec.md`](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/07-aws-deployment-spec.md): Arquitectura AWS y secretos de CI/CD.
2. [`specs/08-docker-and-database-spec.md`](file:///c:/Users/juan9/OneDrive/Desktop/CICLO%208/DESARROLLO%20DE%20APLICACIONES%20PARA%20LA%20NUBE/PARCIAL1/specs/08-docker-and-database-spec.md): Contenerización multi-contenedor con Docker Compose y base de datos persistente.

---

## 3. Matriz de Entregables del DeployAgent

| Entregable | Ruta del Archivo | Propósito |
| :--- | :--- | :--- |
| **Dockerfile Multi-Stage** | `Dockerfile` | Empaquetado optimizado en `node:20-alpine` (< 150MB) sin privilegios root. |
| **Docker Compose** | `docker-compose.yml` | Orquestación del backend web + base de datos con volúmenes persistentes y redes internas. |
| **Script SQL Inicial** | `scripts/init-db.sql` | Creación automática de tablas e índices en el contenedor de base de datos. |
| **Pipeline CI/CD** | `.github/workflows/deploy.yml` | Workflow de GitHub Actions que ejecuta pruebas y despliega en AWS EC2 con `docker compose`. |
| **Script de Auto-Deploy en EC2** | `scripts/deploy-ec2.sh` | Script idempotente para clonar, compilar y levantar los contenedores en AWS. |

---

## 4. Pipeline de GitHub Actions con Docker y AWS EC2

```yaml
name: CI/CD Docker Deploy to AWS EC2

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    name: Run Automated Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install Dependencies
        run: npm ci
      - name: Run Test Suite
        run: npm test

  deploy:
    name: Deploy Docker Stack to AWS EC2
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH to AWS EC2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/jacintillo-app || git clone https://github.com/${{ github.repository }}.git /var/www/jacintillo-app && cd /var/www/jacintillo-app
            git pull origin main
            docker compose down --remove-orphans || true
            docker compose up -d --build
            docker system prune -f
            docker compose ps
```

---

## 5. Criterios de Aceptación para Evaluación del Docente
1. **Despliegue en 1 Solo Paso:** El evaluador puede clonar el repositorio y ejecutar `docker compose up -d` y el sistema completo (Frontend, API y Base de Datos) queda 100% operativo.
2. **Persistencia Garantizada:** Los datos y el histórico de consultas se mantienen intactos entre reinicios de contenedores gracias a volúmenes nombrados (`db_data`).
3. **Cero Dependencias en el Host de AWS:** No se requiere instalar Node.js ni bases de datos en la máquina host; todo vive dentro de los contenedores Docker.
