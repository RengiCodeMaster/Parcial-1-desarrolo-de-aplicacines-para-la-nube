// Servidor Principal de Aplicación Cloud - Aguas Sulfurosas de Jacintillo
// Generado por BackendAgent bajo principios 12-Factor App y Arquitectura Monorepo Unificada

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares Globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir Archivos Estáticos del Frontend desde la carpeta /public
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Rutas API
app.use('/api', apiRouter);

// Fallback SPA para cualquier otra ruta
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Manejo Global de Errores
app.use((err, req, res, next) => {
  console.error('💥 [Server Error]:', err.stack || err.message);
  res.status(500).json({
    success: false,
    error: 'Ocurrió un error inesperado en el servidor cloud.'
  });
});

// Iniciar Servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🌿 SISTEMA PREDICTIVO - AGUAS SULFUROSAS DE JACINTILLO`);
  console.log(`📍 Tingo María, Huánuco, Perú (-9.2950, -75.9980)`);
  console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});

export default app;
