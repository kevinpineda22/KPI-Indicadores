// services/kpiService.js
import supabase from '../config/supabaseCliente.js';

/**
 * Servicio para gestión de KPIs
 */
const kpiService = {
  /**
   * Crear un nuevo registro de KPI
   */
  async crearKpi(kpiData) {
    const { data, error } = await supabase
      .from('kpi_registros')
      .insert([kpiData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear KPI: ${error.message}`);
    }

    return data;
  },

  /**
   * Obtener todos los KPIs con filtros opcionales
   */
  async obtenerKpis(filtros = {}) {
    try {
      let query = supabase
        .from('kpi_registros')
        .select('*')
        .order('fecha_registro', { ascending: false });

      // Aplicar filtros
      if (filtros.area) {
        query = query.eq('area', filtros.area);
      }

      if (filtros.direccion) {
        query = query.eq('direccion', filtros.direccion);
      }

      // Paginación
      if (filtros.limit) {
        query = query.limit(filtros.limit);
      }

      if (filtros.offset) {
        query = query.range(filtros.offset, filtros.offset + (filtros.limit || 100) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error al obtener KPIs: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      throw err;
    }
  },

  /**
   * Obtener KPIs por área
   */
  async obtenerKpisPorArea(area, limit = 50) {
    const { data, error } = await supabase
      .from('kpi_registros')
      .select('*')
      .eq('area', area)
      .order('fecha_registro', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Error al obtener KPIs del área: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Obtener el último valor de cada KPI por área
   */
  async obtenerUltimosKpisPorArea(area) {
    // Obtener todos los indicadores únicos del área
    const { data: indicadores, error: errorIndicadores } = await supabase
      .from('kpi_registros')
      .select('indicador')
      .eq('area', area)
      .order('indicador');

    if (errorIndicadores) {
      throw new Error(`Error al obtener indicadores: ${errorIndicadores.message}`);
    }

    // Eliminar duplicados
    const indicadoresUnicos = [...new Set((indicadores || []).map(i => i.indicador))];

    // Obtener el último registro de cada indicador
    const promesas = indicadoresUnicos.map(async (indicador) => {
      const { data, error } = await supabase
        .from('kpi_registros')
        .select('*')
        .eq('area', area)
        .eq('indicador', indicador)
        .order('fecha_registro', { ascending: false })
        .limit(1)
        .single();

      // Si no hay filas, supabase puede regresar error de "no rows"
      if (error && error.code !== 'PGRST116') {
        console.error(`Error al obtener último KPI para ${indicador}:`, error);
        return null;
      }

      return data;
    });

    const resultados = await Promise.all(promesas);
    return resultados.filter(r => r !== null);
  },

  /**
   * Obtener histórico de un KPI específico
   */
  async obtenerHistoricoKpi(area, indicador, dias = 30) {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    const { data, error } = await supabase
      .from('kpi_registros')
      .select('id, fecha_registro, valor, cumple_meta, unidad, observaciones, datos_entrada')
      .eq('area', area)
      .eq('indicador', indicador)
      .gte('fecha_registro', fechaInicio.toISOString())
      .order('fecha_registro', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener histórico del KPI: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Obtener resumen de KPIs (vista con estadísticas)
   */
  async obtenerResumenKpis(area = null) {
    let query = supabase
      .from('vista_kpis_resumen')
      .select('*')
      .order('area')
      .order('indicador');

    if (area) {
      query = query.eq('area', area);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener resumen de KPIs: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Obtener un KPI por ID
   */
  async obtenerKpiPorId(id) {
    const { data, error } = await supabase
      .from('kpi_registros')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al obtener KPI: ${error.message}`);
    }

    return data;
  },

  /**
   * Actualizar observaciones de un KPI
   */
  async actualizarObservaciones(id, observaciones) {
    const { data, error } = await supabase
      .from('kpi_registros')
      .update({ observaciones })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al actualizar observaciones: ${error.message}`);
    }

    return data;
  },

  /**
   * Eliminar un KPI
   */
  async eliminarKpi(id) {
    const { data, error } = await supabase
      .from('kpi_registros')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al eliminar KPI: ${error.message}`);
    }

    return data;
  },

  /**
   * Obtener estadísticas de un área (promedio, cumplimiento, etc.)
   */
  async obtenerEstadisticasArea(area, dias = 30) {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    const { data, error } = await supabase
      .from('kpi_registros')
      .select('indicador, valor, cumple_meta, fecha_registro')
      .eq('area', area)
      .gte('fecha_registro', fechaInicio.toISOString())
      .order('fecha_registro', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        total_registros: 0,
        indicadores_unicos: 0,
        porcentaje_cumplimiento: 0,
        ultimos_registros: []
      };
    }

    // Calcular estadísticas
    const indicadoresUnicos = [...new Set(data.map(k => k.indicador))];
    const registrosConMeta = data.filter(k => k.cumple_meta !== null);
    const cumplimiento = registrosConMeta.filter(k => k.cumple_meta === true).length;
    const porcentajeCumplimiento = registrosConMeta.length > 0
      ? (cumplimiento / registrosConMeta.length) * 100
      : 0;

    // Agrupar por indicador
    const porIndicador = indicadoresUnicos.map(indicador => {
      const registros = data.filter(k => k.indicador === indicador);
      const valores = registros.map(r => parseFloat(r.valor));
      const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;

      const conMeta = registros.filter(r => r.cumple_meta !== null);
      const cumplen = conMeta.filter(r => r.cumple_meta === true).length;
      const porcentajeCumple = conMeta.length > 0
        ? (cumplen / conMeta.length) * 100
        : null;

      return {
        indicador,
        total_registros: registros.length,
        valor_promedio: promedio.toFixed(2),
        porcentaje_cumplimiento: porcentajeCumple !== null
          ? porcentajeCumple.toFixed(2)
          : 'N/A',
        ultimo_valor: registros[0].valor,
        ultima_fecha: registros[0].fecha_registro
      };
    });

    return {
      area,
      periodo_dias: dias,
      total_registros: data.length,
      indicadores_unicos: indicadoresUnicos.length,
      porcentaje_cumplimiento_general: porcentajeCumplimiento.toFixed(2),
      indicadores: porIndicador
    };
  },

  /**
   * Obtener tendencia de un KPI (últimos N registros)
   */
  async obtenerTendenciaKpi(area, indicador, cantidadRegistros = 10) {
    const { data, error } = await supabase
      .from('kpi_registros')
      .select('fecha_registro, valor, cumple_meta')
      .eq('area', area)
      .eq('indicador', indicador)
      .order('fecha_registro', { ascending: false })
      .limit(cantidadRegistros);

    if (error) {
      throw new Error(`Error al obtener tendencia: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        tendencia: 'sin_datos',
        registros: []
      };
    }

    // Calcular tendencia (ascendente, descendente, estable)
    const valores = data.map(d => parseFloat(d.valor)).reverse();

    if (valores.length < 2) {
      return {
        tendencia: 'insuficientes_datos',
        registros: data.reverse()
      };
    }

    let ascendentes = 0;
    let descendentes = 0;

    for (let i = 1; i < valores.length; i++) {
      if (valores[i] > valores[i - 1]) ascendentes++;
      else if (valores[i] < valores[i - 1]) descendentes++;
    }

    let tendencia;
    if (ascendentes > descendentes * 1.5) {
      tendencia = 'ascendente';
    } else if (descendentes > ascendentes * 1.5) {
      tendencia = 'descendente';
    } else {
      tendencia = 'estable';
    }

    return {
      tendencia,
      registros: data.reverse(),
      analisis: {
        total_registros: valores.length,
        valor_minimo: Math.min(...valores),
        valor_maximo: Math.max(...valores),
        valor_promedio: (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2)
      }
    };
  },

  /**
   * Agregación completa para generar informe por área y periodo (YYYY-MM)
   * Devuelve objeto 'agg' listo para render/plantilla:
   * {
   *  area, periodo,
   *  meta: { porcentaje_cumplimiento, total_registros_mes, total_indicadores_mes },
   *  kpis: [ { id, label, meta, metaTipo, unidad, valor_mes, valor_acumulado, cumple_meta, datos_entrada, ultima_fecha } ],
   *  proyectos: [...],
   *  analisis: [...],
   *  plan_accion: [...]
   * }
   */
  async aggregateKpisForArea(area, periodo) {
    if (!area || !periodo) throw new Error('area y periodo son requeridos (periodo formato YYYY-MM)');

    // Helper: convierte 'YYYY-MM' a rango ISO
    const periodToRange = (period) => {
      const parts = period.split('-').map(Number);
      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        throw new Error('Periodo inválido: usar formato YYYY-MM');
      }
      const [y, m] = parts;
      // considerar UTC boundaries para evitar problemas con zonas horarias
      const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
      const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
      const yearStart = new Date(Date.UTC(y, 0, 1, 0, 0, 0));
      return { startISO: start.toISOString(), endISO: end.toISOString(), yearStartISO: yearStart.toISOString() };
    };

    const { startISO, endISO, yearStartISO } = periodToRange(periodo);

    // 1) Registros del mes
    const { data: registrosMes, error: errMes } = await supabase
      .from('kpi_registros')
      .select('*')
      .eq('area', area)
      .gte('fecha_registro', startISO)
      .lt('fecha_registro', endISO)
      .order('fecha_registro', { ascending: true });

    if (errMes) {
      throw new Error(`Error al leer registros del mes: ${errMes.message || JSON.stringify(errMes)}`);
    }

    // 2) Registros año a la fecha (YTD) para acumulados
    const { data: registrosYtd, error: errYtd } = await supabase
      .from('kpi_registros')
      .select('*')
      .eq('area', area)
      .gte('fecha_registro', yearStartISO)
      .lt('fecha_registro', endISO)
      .order('fecha_registro', { ascending: true });

    if (errYtd) {
      throw new Error(`Error al leer registros YTD: ${errYtd.message || JSON.stringify(errYtd)}`);
    }

    // Unir indicadores conocidos (mes + ytd)
    const indicadoresSet = new Set();
    (registrosMes || []).forEach(r => r && r.indicador && indicadoresSet.add(r.indicador));
    (registrosYtd || []).forEach(r => r && r.indicador && indicadoresSet.add(r.indicador));
    const indicadores = Array.from(indicadoresSet);

    // Construir kpis array
    const kpis = indicadores.map(ind => {
      const regsMes = (registrosMes || []).filter(r => r.indicador === ind).sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro));
      const ultimoMes = regsMes.length ? regsMes[0] : null;

      const regsY = (registrosYtd || []).filter(r => r.indicador === ind);
      const valoresY = regsY.map(r => Number(r.valor)).filter(v => !isNaN(v));
      const valorAcumulado = valoresY.length ? (valoresY.reduce((a, b) => a + b, 0) / valoresY.length) : null;

      return {
        id: ind,
        label: ind,
        meta: ultimoMes && ultimoMes.meta !== null ? (Number(ultimoMes.meta) || null) : null,
        metaTipo: ultimoMes && ultimoMes.meta !== null && ultimoMes.meta < 0 ? 'menorIgual' : 'mayorIgual', // heurística simple
        unidad: ultimoMes ? (ultimoMes.unidad || '') : '',
        valor_mes: ultimoMes ? Number(ultimoMes.valor) : null,
        valor_acumulado: valorAcumulado !== null ? Number(Number(valorAcumulado).toFixed(4)) : null,
        cumple_meta: ultimoMes && ultimoMes.cumple_meta !== null ? ultimoMes.cumple_meta : null,
        datos_entrada: ultimoMes ? ultimoMes.datos_entrada : null,
        ultima_fecha: ultimoMes ? ultimoMes.fecha_registro : null
      };
    });

    // Calcular porcentaje de cumplimiento del mes (solo registrosMes con cumple_meta no null)
    const registrosConMetaMes = (registrosMes || []).filter(r => r.cumple_meta !== null && r.cumple_meta !== undefined);
    const cumplenMes = registrosConMetaMes.filter(r => r.cumple_meta === true).length;
    const porcentajeCumplimiento = registrosConMetaMes.length ? Number(((cumplenMes / registrosConMetaMes.length) * 100).toFixed(2)) : null;

    // Análisis automatizado: reglas simples
    const analisis = [];
    if (porcentajeCumplimiento === null) {
      analisis.push('No hay suficientes registros con campo `cumple_meta` para calcular cumplimiento general del periodo.');
    } else if (porcentajeCumplimiento >= 90) {
      analisis.push(`Estado general: ✅ Conforme. ${porcentajeCumplimiento}% de los indicadores con meta cumplen en el mes.`);
    } else if (porcentajeCumplimiento >= 70) {
      analisis.push(`Estado general: ⚠️ Parcial. ${porcentajeCumplimiento}% de los indicadores con meta cumplen en el mes.`);
    } else {
      analisis.push(`Estado general: ❌ Crítico. ${porcentajeCumplimiento}% de los indicadores con meta cumplen en el mes.`);
    }

    // Indicadores sin dato este mes
    const sinDato = kpis.filter(k => k.valor_mes === null).map(k => k.id);
    if (sinDato.length) {
      analisis.push(`Indicadores sin registro este mes: ${sinDato.slice(0, 10).join(', ')}${sinDato.length > 10 ? ' (y más...)' : ''}.`);
    }

    // Detectar principales desviaciones respecto a meta
    const conMeta = kpis.filter(k => k.meta !== null && k.valor_mes !== null);
    const diffs = conMeta.map(k => {
      // Normalizamos: si metaTipo == 'menorIgual' (pidamos menor es mejor), usamos diferencia inversa
      const diffPct = k.metaTipo === 'menorIgual'
        ? ((k.meta - k.valor_mes) / (Math.abs(k.meta) || 1)) * 100
        : ((k.valor_mes - k.meta) / (Math.abs(k.meta) || 1)) * 100;
      return { id: k.id, label: k.label, valor_mes: k.valor_mes, meta: k.meta, diffPct: Number(diffPct.toFixed(2)) };
    });

    // Ordenar por peor (más negativo en términos de cumplimiento relativo)
    const peor = diffs.sort((a, b) => a.diffPct - b.diffPct).slice(0, 5);
    if (peor.length) {
      analisis.push('Principales desviaciones respecto a meta: ' + peor.map(p => `${p.label} (${p.valor_mes}${p.unidad || ''} vs meta ${p.meta})`).join('; ') + '.');
    }

    // Intentar obtener proyectos y plan de acción si existen tablas (no crítico)
    let proyectos = [];
    try {
      const { data: proyectosData, error: proyectosErr } = await supabase
        .from('proyectos')
        .select('*')
        .eq('area', area)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (!proyectosErr && proyectosData) proyectos = proyectosData.map(p => ({
        nombre: p.nombre || p.titulo || p.id,
        estado: p.estado || p.status || '',
        observaciones: p.observaciones || p.descripcion || ''
      }));
    } catch (e) {
      // no hacer nada, omitimos proyectos
      proyectos = [];
    }

    let plan_accion = [];
    try {
      const { data: accionesData, error: accionesErr } = await supabase
        .from('plan_accion')
        .select('*')
        .eq('area', area)
        .order('fecha_objetivo', { ascending: true })
        .limit(100);

      if (!accionesErr && accionesData) plan_accion = accionesData.map(a => ({
        accion: a.accion || a.titulo || 'Acción',
        responsable: a.responsable || a.owner || '',
        fecha_objetivo: a.fecha_objetivo || a.plazo || ''
      }));
    } catch (e) {
      plan_accion = [];
    }

    // Meta resumen
    const metaObj = {
      porcentaje_cumplimiento: porcentajeCumplimiento,
      total_registros_mes: (registrosMes || []).length,
      total_indicadores_mes: indicadores.length
    };

    const agg = {
      area,
      periodo,
      meta: metaObj,
      kpis,
      proyectos,
      analisis,
      plan_accion
    };

    return agg;
  }

};

export default kpiService;
