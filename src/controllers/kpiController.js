// controllers/kpiController.js
import kpiService from '../services/kpiService.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controlador para gestión de KPIs
 */
const kpiController = {
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

    // Validaciones mínimas
    const missing = [];
    if (!area) missing.push({ field: 'area', message: 'El área es requerida' });
    if (!indicador) missing.push({ field: 'indicador', message: 'El indicador es requerido' });
    if (valor === undefined || valor === null) missing.push({ field: 'valor', message: 'El valor es requerido' });
    if (!datos_entrada || typeof datos_entrada !== 'object' || Array.isArray(datos_entrada)) {
      missing.push({ field: 'datos_entrada', message: 'Los datos de entrada son requeridos y deben ser un objeto' });
    }

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos',
        errors: missing
      });
    }

    const kpiData = {
      area: String(area).trim(),
      indicador: String(indicador).trim(),
      valor: parseFloat(valor),
      unidad: unidad || '',
      cumple_meta: (cumple_meta === true || cumple_meta === 'true') ? true : (cumple_meta === false || cumple_meta === 'false' ? false : null),
      meta: meta !== undefined && meta !== null && meta !== '' ? parseFloat(meta) : null,
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

  obtenerTodosKpis: asyncHandler(async (req, res) => {
    const { area, direccion, limit = 100, offset = 0 } = req.query;

    const filtros = {
      area: area || null,
      direccion: direccion || null,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    };

    const kpis = await kpiService.obtenerKpis(filtros);

    res.status(200).json({
      success: true,
      count: Array.isArray(kpis) ? kpis.length : 0,
      data: kpis
    });
  }),

  obtenerKpisPorArea: asyncHandler(async (req, res) => {
    const { area } = req.params;
    const { limit = 50 } = req.query;

    if (!area) {
      return res.status(400).json({
        success: false,
        message: 'El área es requerida'
      });
    }

    const kpis = await kpiService.obtenerKpisPorArea(area, parseInt(limit, 10));

    res.status(200).json({
      success: true,
      area,
      count: Array.isArray(kpis) ? kpis.length : 0,
      data: kpis
    });
  }),

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
      count: Array.isArray(kpis) ? kpis.length : 0,
      data: kpis
    });
  }),

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
      parseInt(dias, 10)
    );

    res.status(200).json({
      success: true,
      area,
      indicador,
      dias: parseInt(dias, 10),
      count: Array.isArray(historico) ? historico.length : 0,
      data: historico
    });
  }),

  obtenerResumenKpis: asyncHandler(async (req, res) => {
    const { area } = req.query;

    const resumen = await kpiService.obtenerResumenKpis(area || null);

    res.status(200).json({
      success: true,
      count: Array.isArray(resumen) ? resumen.length : 0,
      data: resumen
    });
  }),

  obtenerKpiPorId: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const kpi = await kpiService.obtenerKpiPorId(parseInt(id, 10));

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
      parseInt(id, 10),
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

  eliminarKpi: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const eliminado = await kpiService.eliminarKpi(parseInt(id, 10));

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
      parseInt(dias, 10)
    );

    res.status(200).json({
      success: true,
      area,
      dias: parseInt(dias, 10),
      data: estadisticas
    });
  }),

  /**
   * Generar informe agregado por área y periodo
   * GET /api/kpis/report/:area/:periodo
   * periodo: 'YYYY-MM'
   */
  generarInformeAreaPeriodo: asyncHandler(async (req, res) => {
    const { area, periodo } = req.params;

    if (!area || !periodo) {
      return res.status(400).json({
        success: false,
        message: 'Area y periodo son requeridos (formato YYYY-MM)'
      });
    }

    // Validar formato YYYY-MM
    const match = periodo.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'Periodo inválido. Use formato YYYY-MM (ej. 2025-10)'
      });
    }

    const agg = await kpiService.aggregateKpisForArea(area, periodo);

    // Transformar al formato esperado por el frontend
    const informe = {
      area: agg.area,
      periodo: agg.periodo,
      fecha_generado: new Date().toISOString(),
      resumen_ejecutivo: agg.analisis && agg.analisis.length > 0 
        ? agg.analisis.join('\n\n') 
        : 'Sin datos suficientes para generar resumen ejecutivo.',
      indicadores: (agg.kpis || []).map(k => ({
        indicador: k.label || k.id,
        meta: k.meta,
        resultado_mes: k.valor_mes,
        resultado_acumulado: k.valor_acumulado,
        unidad: k.unidad,
        porcentaje_cumplimiento: k.cumple_meta !== null 
          ? (k.cumple_meta ? 100 : 0) 
          : null
      })),
      total_registros: agg.meta?.total_registros_mes || 0,
      total_indicadores: agg.meta?.total_indicadores_mes || 0,
      cumplimiento_promedio_indicadores: agg.meta?.porcentaje_cumplimiento || null,
      proyectos: agg.proyectos || [],
      plan_accion: agg.plan_accion || []
    };

    res.status(200).json({
      success: true,
      data: informe
    });
  })
};

export default kpiController;
