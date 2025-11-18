// routes/kpis.js
import express from 'express';
import kpiController from '../controllers/kpiController.js';

const router = express.Router();

/**
 * Rutas para gestión de KPIs
 * Base: /api/kpis
 */

// CREAR Y OBTENER KPIs
router.post('/', kpiController.registrarKpi);
router.get('/', kpiController.obtenerTodosKpis);
router.get('/resumen', kpiController.obtenerResumenKpis);

// REPORTES Y KPIs POR ÁREA (rutas específicas primero)
router.get('/report/:area/:periodo', kpiController.generarInformeAreaPeriodo);
router.get('/area/:area/ultimos', kpiController.obtenerUltimosKpisPorArea);
router.get('/estadisticas/:area', kpiController.obtenerEstadisticasArea);
router.get('/area/:area', kpiController.obtenerKpisPorArea);

// HISTÓRICO Y TENDENCIAS
router.get('/historico/:area/:indicador', kpiController.obtenerHistoricoKpi);

// ACTUALIZAR Y ELIMINAR
router.put('/:id/observaciones', kpiController.actualizarObservaciones);
router.delete('/:id', kpiController.eliminarKpi);

// OBTENER POR ID (debe quedar al final)
router.get('/:id', kpiController.obtenerKpiPorId);

export default router;
