import express from 'express';
import actividadesRoutes from './actividades.js';

const router = express.Router();

// Health check específico de API
router.get('/status', (req, res) => {
  res.json({
    message: 'API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes
router.use('/actividades-direccion', actividadesRoutes);

export default router;
