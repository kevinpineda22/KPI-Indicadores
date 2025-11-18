import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { connectDB } from './config/supabaseCliente.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// CORS configuration mejorada
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://tu-frontend-url.vercel.app', // Para producción
    process.env.FRONTEND_URL
  ].filter(Boolean), // Filtrar valores undefined
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Para soportar navegadores legacy
};

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false // Para desarrollo
}));
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'KPI Indicadores API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/status',
      kpis: '/api/kpis',
      reports: '/api/kpis/report/:area/:periodo'
    },
    documentation: 'https://github.com/kevinpineda22/KPI-Indicadores'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cors: {
      allowedOrigins: corsOptions.origin,
      currentOrigin: req.get('origin')
    }
  });
});

// Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 CORS enabled for: ${corsOptions.origin.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
