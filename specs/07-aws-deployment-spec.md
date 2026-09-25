# Especificación 07: Despliegue en AWS (EC2 / S3 / CloudFront) y Pipeline de CI/CD con GitHub Actions

## 1. Arquitectura Cloud en AWS
El sistema se desplegará en la nube de **Amazon Web Services (AWS)** bajo un esquema optimizado para aplicaciones web escalables y de alta disponibilidad:

```
                              [ Internet / Turistas ]
                                         │
                                         ▼
                            [ AWS CloudFront (CDN Edge) ]
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
     [ Frontend Estático en S3 ]               [ Backend API en AWS EC2 ]
     (HTML5, CSS Glassmorphism, JS)            (Node.js / Express Service con PM2)
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         ▼
                             [ API Open-Meteo Cloud ]
```

### 1.1 Componentes de AWS
1. **AWS EC2 (Elastic Compute Cloud):**
   - Instancia: `t2.micro` o `t3.micro` (Capa Gratuita de AWS).
   - Sistema Operativo: Ubuntu Server 22.04 LTS.
   - Gestor de Procesos: **PM2** para mantener el servidor Node.js/Express activo 24/7 y reiniciar automáticamente ante fallos.
   - Reverse Proxy: **Nginx** como terminador de tráfico web, gestión de certificados SSL y proxy inverso hacia el puerto local de la aplicación (`3000`).
2. **AWS S3 & CloudFront (Opcional/Híbrido):**
   - Almacenamiento seguro de activos web estáticos distribuidos globalmente con latencia mínima en Sudamérica (`sa-east-1`).
3. **AWS Security Groups (Firewall de Red):**
   - Inbound Rules: Puerto 80 (HTTP), Puerto 443 (HTTPS), Puerto 22 (SSH restringido a GitHub Actions / IP de administración).

---

## 2. Pipeline de CI/CD con GitHub Actions (`.github/workflows/deploy.yml`)

### 2.1 Secretos Requeridos en GitHub Secrets
Para que el pipeline de GitHub Actions despliegue automáticamente en AWS sin exponer credenciales:
- `EC2_HOST`: Dirección IP pública o DNS pública de la instancia EC2.
- `EC2_USER`: Usuario SSH de la instancia (típicamente `ubuntu`).
- `EC2_SSH_KEY`: Clave privada SSH (`.pem` o clave generada para CI/CD).
- `PORT`: Puerto de ejecución de la aplicación (por defecto `3000`).

### 2.2 Fases del Workflow de GitHub Actions
1. **Trigger:** Disparo automático en cada `push` o `pull_request` a la rama `main`.
2. **Stage 1 - Test & Lint (Ubuntu Runner):**
   - Checkout del código fuente.
   - Configuración de Node.js LTS.
   - Instalación limpia con `npm ci`.
   - Ejecución de pruebas unitarias (`npm test`) del modelo matemático predictivo.
3. **Stage 2 - Deploy to AWS EC2 (SSH Action):**
   - Conexión segura SSH mediante `appleboy/ssh-action`.
   - Clonación / Pull de la última versión del repositorio en `/var/www/jacintillo-app`.
   - Instalación de dependencias de producción.
   - Reinicio sin tiempo de inactividad (*Zero-Downtime Reload*) mediante PM2 (`pm2 reload ecosystem.config.js || pm2 start server.js --name jacintillo-app`).
4. **Stage 3 - Health Check:**
   - Consulta `curl -f http://localhost:3000/api/health` para validar que el servicio está online.

---

## 3. Configuración de PM2 (`ecosystem.config.js`)
```javascript
module.exports = {
  apps: [{
    name: 'jacintillo-app',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```
