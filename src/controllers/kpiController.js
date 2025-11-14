import kpiService from '../services/kpiService.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controlador para gestión de KPIs
 */
const kpiController = {
    /**
     * Registrar un nuevo valor de KPI
     * POST /api/kpis
     */
    registrarKpi: asyncHandler(async (req, res) => {
        const {
            area,
            indicador,
            valor,
            unidad,
            cumple_meta,
            meta,
            datos_entrada,
            direccion,
            usuario,
            observaciones
        } = req.body;

        // Validaciones
        if (!area || !indicador || valor === undefined || !datos_entrada) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos',
                errors: [
                    { field: 'area', message: 'El área es requerida' },
                    { field: 'indicador', message: 'El indicador es requerido' },
                    { field: 'valor', message: 'El valor es requerido' },
                    { field: 'datos_entrada', message: 'Los datos de entrada son requeridos' }
                ].filter(err => !req.body[err.field] && req.body[err.field] !== 0)
            });
        }

        // Validar que datos_entrada sea un objeto
        if (typeof datos_entrada !== 'object' || Array.isArray(datos_entrada)) {
            return res.status(400).json({
                success: false,
                message: 'datos_entrada debe ser un objeto JSON válido'
            });
        }

        const kpiData = {
            area: area.trim(),
            indicador: indicador.trim(),
            valor: parseFloat(valor),
            unidad: unidad || '',
            cumple_meta: cumple_meta !== undefined ? cumple_meta : null,
            meta: meta !== undefined ? parseFloat(meta) : null,
            datos_entrada,
            direccion: direccion || null,
            usuario: usuario || null,
            observaciones: observaciones || null
        };

        const nuevoKpi = await kpiService.crearKpi(kpiData);

        res.status(201).json({
            success: true,
            message: 'KPI registrado exitosamente',
            data: nuevoKpi
        });
    }),

    /**
     * Obtener todos los KPIs
     * GET /api/kpis
     */
    obtenerTodosKpis: asyncHandler(async (req, res) => {
        const { area, direccion, limit = 100, offset = 0 } = req.query;

        const filtros = {
            area: area || null,
            direccion: direccion || null,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };

        const kpis = await kpiService.obtenerKpis(filtros);

        res.status(200).json({
            success: true,
            count: kpis.length,
            data: kpis
        });
    }),

    /**
     * Obtener KPIs por área
     * GET /api/kpis/area/:area
     */
    obtenerKpisPorArea: asyncHandler(async (req, res) => {
        const { area } = req.params;
        const { limit = 50 } = req.query;

        if (!area) {
            return res.status(400).json({
                success: false,
                message: 'El área es requerida'
            });
        }

        const kpis = await kpiService.obtenerKpisPorArea(area, parseInt(limit));

        res.status(200).json({
            success: true,
            area,
            count: kpis.length,
            data: kpis
        });
    }),

    /**
     * Obtener el último valor de cada KPI por área
     * GET /api/kpis/area/:area/ultimos
     */
    obtenerUltimosKpisPorArea: asyncHandler(async (req, res) => {
        const { area } = req.params;

        if (!area) {
            return res.status(400).json({
                success: false,
                message: 'El área es requerida'
            });
        }

        const kpis = await kpiService.obtenerUltimosKpisPorArea(area);

        res.status(200).json({
            success: true,
            area,
            count: kpis.length,
            data: kpis
        });
    }),

    /**
     * Obtener histórico de un KPI específico
     * GET /api/kpis/historico/:area/:indicador
     */
    obtenerHistoricoKpi: asyncHandler(async (req, res) => {
        const { area, indicador } = req.params;
        const { dias = 30 } = req.query;

        if (!area || !indicador) {
            return res.status(400).json({
                success: false,
                message: 'El área y el indicador son requeridos'
            });
        }

        const historico = await kpiService.obtenerHistoricoKpi(
            area,
            indicador,
            parseInt(dias)
        );

        res.status(200).json({
            success: true,
            area,
            indicador,
            dias: parseInt(dias),
            count: historico.length,
            data: historico
        });
    }),

    /**
     * Obtener resumen de KPIs (últimos valores con estadísticas)
     * GET /api/kpis/resumen
     */
    obtenerResumenKpis: asyncHandler(async (req, res) => {
        const { area } = req.query;

        const resumen = await kpiService.obtenerResumenKpis(area || null);

        res.status(200).json({
            success: true,
            count: resumen.length,
            data: resumen
        });
    }),

    /**
     * Obtener un KPI por ID
     * GET /api/kpis/:id
     */
    obtenerKpiPorId: asyncHandler(async (req, res) => {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const kpi = await kpiService.obtenerKpiPorId(parseInt(id));

        if (!kpi) {
            return res.status(404).json({
                success: false,
                message: 'KPI no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: kpi
        });
    }),

    /**
     * Actualizar observaciones de un KPI
     * PUT /api/kpis/:id/observaciones
     */
    actualizarObservaciones: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { observaciones } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        if (observaciones === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Las observaciones son requeridas'
            });
        }

        const kpiActualizado = await kpiService.actualizarObservaciones(
            parseInt(id),
            observaciones
        );

        if (!kpiActualizado) {
            return res.status(404).json({
                success: false,
                message: 'KPI no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Observaciones actualizadas exitosamente',
            data: kpiActualizado
        });
    }),

    /**
     * Eliminar un KPI
     * DELETE /api/kpis/:id
     */
    eliminarKpi: asyncHandler(async (req, res) => {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const eliminado = await kpiService.eliminarKpi(parseInt(id));

        if (!eliminado) {
            return res.status(404).json({
                success: false,
                message: 'KPI no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'KPI eliminado exitosamente'
        });
    }),

    /**
     * Obtener estadísticas de KPIs por área
     * GET /api/kpis/estadisticas/:area
     */
    obtenerEstadisticasArea: asyncHandler(async (req, res) => {
        const { area } = req.params;
        const { dias = 30 } = req.query;

        if (!area) {
            return res.status(400).json({
                success: false,
                message: 'El área es requerida'
            });
        }

        const estadisticas = await kpiService.obtenerEstadisticasArea(
            area,
            parseInt(dias)
        );

        res.status(200).json({
            success: true,
            area,
            dias: parseInt(dias),
            data: estadisticas
        });
    })
};

export default kpiController;
