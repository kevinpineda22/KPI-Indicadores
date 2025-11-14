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

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
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
            .select('id, fecha_registro, valor, cumple_meta, unidad, observaciones')
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
    }
};

export default kpiService;
