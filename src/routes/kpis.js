import express from 'express';
import kpiController from '../controllers/kpiController.js';

const router = express.Router();

/**
 * Rutas para gestión de KPIs
 * Base: /api/kpis
 */

// ====================================
// CREAR Y OBTENER KPIs
// ====================================

/**
 * @route   POST /api/kpis
 * @desc    Registrar un nuevo valor de KPI
 * @access  Private
 * @body    { area, indicador, valor, unidad, cumple_meta, meta, datos_entrada, direccion, usuario, observaciones }
 */
router.post('/', kpiController.registrarKpi);

/**
 * @route   GET /api/kpis
 * @desc    Obtener todos los KPIs con filtros opcionales
 * @access  Private
 * @query   ?area=Inventario&direccion=Operaciones&limit=100&offset=0
 */
router.get('/', kpiController.obtenerTodosKpis);

/**
 * @route   GET /api/kpis/resumen
 * @desc    Obtener resumen de KPIs con estadísticas
 * @access  Private
 * @query   ?area=Inventario
 */
router.get('/resumen', kpiController.obtenerResumenKpis);

/**
 * @route   GET /api/kpis/:id
 * @desc    Obtener un KPI específico por ID
 * @access  Private
 */
router.get('/:id', kpiController.obtenerKpiPorId);

// ====================================
// KPIs POR ÁREA
// ====================================

/**
 * @route   GET /api/kpis/area/:area
 * @desc    Obtener todos los KPIs de un área específica
 * @access  Private
 * @params  area - Nombre del área (Inventario, Logística, etc.)
 * @query   ?limit=50
 */
router.get('/area/:area', kpiController.obtenerKpisPorArea);

/**
 * @route   GET /api/kpis/area/:area/ultimos
 * @desc    Obtener el último valor de cada KPI por área
 * @access  Private
 * @params  area - Nombre del área
 */
router.get('/area/:area/ultimos', kpiController.obtenerUltimosKpisPorArea);

/**
 * @route   GET /api/kpis/estadisticas/:area
 * @desc    Obtener estadísticas de KPIs por área
 * @access  Private
 * @params  area - Nombre del área
 * @query   ?dias=30
 */
router.get('/estadisticas/:area', kpiController.obtenerEstadisticasArea);

// ====================================
// HISTÓRICO Y TENDENCIAS
// ====================================

/**
 * @route   GET /api/kpis/historico/:area/:indicador
 * @desc    Obtener histórico de un KPI específico
 * @access  Private
 * @params  area - Nombre del área
 * @params  indicador - Nombre del indicador
 * @query   ?dias=30
 */
router.get('/historico/:area/:indicador', kpiController.obtenerHistoricoKpi);

// ====================================
// ACTUALIZAR Y ELIMINAR
// ====================================

/**
 * @route   PUT /api/kpis/:id/observaciones
 * @desc    Actualizar observaciones de un KPI
 * @access  Private
 * @body    { observaciones }
 */
router.put('/:id/observaciones', kpiController.actualizarObservaciones);

/**
 * @route   DELETE /api/kpis/:id
 * @desc    Eliminar un KPI
 * @access  Private
 */
router.delete('/:id', kpiController.eliminarKpi);

export default router;
