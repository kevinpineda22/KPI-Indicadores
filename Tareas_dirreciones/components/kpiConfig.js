export const kpiConfig = [
    // INVENTARIO
    {
        area: "Inventario",
        indicador: "Exactitud de inventario",
        formula: (data) => data.unidadesCorrectas && data.unidadesTotales ? ((data.unidadesCorrectas / data.unidadesTotales) * 100).toFixed(2) : null,
        meta: 98,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Medir precisión de inventario"
    },
    {
        area: "Inventario",
        indicador: "Valor de ajustes",
        formula: (data) => data.valorAjustes && data.ventasTotales ? ((data.valorAjustes / data.ventasTotales) * 100).toFixed(2) : null,
        meta: -0.25,
        metaTipo: "menorIgual",
        unidad: "%",
        descripcion: "Controlar desviaciones de inventario"
    },
    {
        area: "Inventario",
        indicador: "Rotación según categoría ABC",
        formula: (data) => data.ventas && data.inventarioPromedio ? (data.ventas / data.inventarioPromedio).toFixed(2) : null,
        meta: null, // Depende de categoría
        metaTipo: "custom",
        unidad: "veces",
        descripcion: "Evaluar eficiencia de inventario"
    },
    {
        area: "Inventario",
        indicador: "Cobertura en días",
        formula: (data) => data.inventarioDisponible && data.consumoPromedioDiario ? (data.inventarioDisponible / data.consumoPromedioDiario).toFixed(2) : null,
        meta: 30,
        metaTipo: "menorIgual",
        unidad: "días",
        descripcion: "Calcular autonomía del inventario"
    },
    {
        area: "Inventario",
        indicador: "Inventario inactivo",
        formula: (data) => data.valorInactivo && data.inventarioTotal ? ((data.valorInactivo / data.inventarioTotal) * 100).toFixed(2) : null,
        meta: 5,
        metaTipo: "menorIgual",
        unidad: "%",
        descripcion: "Detectar productos sin movimiento"
    },
    {
        area: "Inventario",
        indicador: "Costo inventario",
        formula: (data) => data.costoActual && data.costoAnterior ? (data.costoActual - data.costoAnterior).toFixed(2) : null,
        meta: null, // ↓ vs mes anterior
        metaTipo: "menorQueAnterior",
        unidad: "$",
        descripcion: "Controlar impacto financiero"
    },
    {
        area: "Inventario",
        indicador: "Auditorías realizadas",
        formula: (data) => data.auditoriasRealizadas && data.auditoriasPlanificadas ? ((data.auditoriasRealizadas / data.auditoriasPlanificadas) * 100).toFixed(2) : null,
        meta: 90,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Monitorear cumplimiento de control"
    },
    {
        area: "Inventario",
        indicador: "% de ajustes con soporte",
        formula: (data) => data.ajustesConEvidencia && data.totalAjustes ? ((data.ajustesConEvidencia / data.totalAjustes) * 100).toFixed(2) : null,
        meta: 100,
        metaTipo: "igual",
        unidad: "%",
        descripcion: "Asegurar trazabilidad"
    },

    // LOGÍSTICA
    {
        area: "Logística",
        indicador: "Tiempo promedio de recepción",
        formula: (data) => data.sumaTiemposRecepcion && data.totalRecepciones ? (data.sumaTiemposRecepcion / data.totalRecepciones).toFixed(2) : null,
        meta: 2,
        metaTipo: "menorIgual",
        unidad: "h",
        descripcion: "Agilizar procesos logísticos"
    },
    {
        area: "Logística",
        indicador: "Exactitud en recepción",
        formula: (data) => data.recepcionesCorrectas && data.totalRecepciones ? ((data.recepcionesCorrectas / data.totalRecepciones) * 100).toFixed(2) : null,
        meta: 98,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Reducir errores en ingreso de mercancía"
    },
    {
        area: "Logística",
        indicador: "Uso espacio almacenamiento",
        formula: (data) => data.espacioUsado && data.espacioDisponible ? ((data.espacioUsado / data.espacioDisponible) * 100).toFixed(2) : null,
        meta: 90,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Optimizar uso del almacén"
    },
    {
        area: "Logística",
        indicador: "Incidentes de pérdida",
        formula: (data) => data.incidentesPerdida !== undefined ? data.incidentesPerdida : null,
        meta: 0,
        metaTipo: "igual",
        unidad: "",
        descripcion: "Eliminar pérdidas logísticas"
    },
    {
        area: "Logística",
        indicador: "Cumplimiento tiempos despacho",
        formula: (data) => data.despachosATiempo && data.totalDespachos ? ((data.despachosATiempo / data.totalDespachos) * 100).toFixed(2) : null,
        meta: 95,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Garantizar puntualidad"
    },
    {
        area: "Logística",
        indicador: "Puntualidad de entregas",
        formula: (data) => data.entregasATiempo && data.totalEntregas ? ((data.entregasATiempo / data.totalEntregas) * 100).toFixed(2) : null,
        meta: 97,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Mejorar servicio al cliente interno"
    },
    {
        area: "Logística",
        indicador: "Errores de alistamiento",
        formula: (data) => data.erroresAlistamiento && data.totalAlistamientos ? ((data.erroresAlistamiento / data.totalAlistamientos) * 100).toFixed(2) : null,
        meta: 1,
        metaTipo: "menorIgual",
        unidad: "%",
        descripcion: "Reducir reprocesos"
    },
    {
        area: "Logística",
        indicador: "Disponibilidad de flota",
        formula: (data) => data.diasDisponibles && data.diasOperativos ? ((data.diasDisponibles / data.diasOperativos) * 100).toFixed(2) : null,
        meta: 95,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Medir operatividad del transporte"
    },

    // SUMINISTROS
    {
        area: "Suministros",
        indicador: "Gastos de caja menor",
        formula: (data) => data.totalGastosCajaMenor && data.topeAutorizado ? (data.totalGastosCajaMenor / data.topeAutorizado).toFixed(2) : null,
        meta: 1,
        metaTipo: "menorIgual",
        unidad: "",
        descripcion: "Controlar ejecución de recursos"
    },
    {
        area: "Suministros",
        indicador: "Cumplimiento reportes EPM",
        formula: (data) => data.reportesEntregados && data.reportesProgramados ? ((data.reportesEntregados / data.reportesProgramados) * 100).toFixed(2) : null,
        meta: 100,
        metaTipo: "igual",
        unidad: "%",
        descripcion: "Verificar cumplimiento regulatorio"
    },
    {
        area: "Suministros",
        indicador: "Consumo servicios públicos",
        formula: (data) => data.consumoActual && data.consumoAnterior ? (data.consumoActual - data.consumoAnterior).toFixed(2) : null,
        meta: null, // ≤ mes anterior
        metaTipo: "menorQueAnterior",
        unidad: "",
        descripcion: "Reducir consumo innecesario"
    },
    {
        area: "Suministros",
        indicador: "Ingresos por bolsas/costales",
        formula: (data) => data.ingresosEmpaque && data.metaEstablecida ? (data.ingresosEmpaque / data.metaEstablecida).toFixed(2) : null,
        meta: 1,
        metaTipo: "mayorIgual",
        unidad: "",
        descripcion: "Medir recuperación por insumos"
    },
    {
        area: "Suministros",
        indicador: "Consumo insumos",
        formula: (data) => data.totalConsumo && data.consumoPlanificado ? (data.totalConsumo / data.consumoPlanificado).toFixed(2) : null,
        meta: 1,
        metaTipo: "menorIgual",
        unidad: "",
        descripcion: "Controlar desviaciones operativas"
    },
    {
        area: "Suministros",
        indicador: "Variación consumo",
        formula: (data) => data.consumoActual && data.consumoPlanificado ? (((data.consumoActual - data.consumoPlanificado) / data.consumoPlanificado) * 100).toFixed(2) : null,
        meta: 5,
        metaTipo: "menorIgual",
        unidad: "%",
        descripcion: "Detectar anomalías en uso de insumos"
    },
    {
        area: "Suministros",
        indicador: "Exactitud inventario",
        formula: (data) => data.inventarioCorrecto && data.totalInventario ? ((data.inventarioCorrecto / data.totalInventario) * 100).toFixed(2) : null,
        meta: 98,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Garantizar registros confiables"
    },
    {
        area: "Suministros",
        indicador: "Rotación de inventario",
        formula: (data) => data.ventas && data.inventarioPromedio ? (data.ventas / data.inventarioPromedio).toFixed(2) : null,
        meta: 1.5,
        metaTipo: "mayorIgual",
        unidad: "veces",
        descripcion: "Medir eficiencia de rotación"
    },
    {
        area: "Suministros",
        indicador: "Días promedio de inventario",
        formula: (data) => data.inventarioDisponible && data.consumoDiario ? (data.inventarioDisponible / data.consumoDiario).toFixed(2) : null,
        meta: 30,
        metaTipo: "menorIgual",
        unidad: "días",
        descripcion: "Calcular cobertura de inventario"
    },
    {
        area: "Suministros",
        indicador: "Pérdidas por obsolescencia",
        formula: (data) => data.valorPerdido && data.valorTotal ? ((data.valorPerdido / data.valorTotal) * 100).toFixed(2) : null,
        meta: 1,
        metaTipo: "menorIgual",
        unidad: "%",
        descripcion: "Reducir pérdidas por vencimiento"
    },

    // MANTENIMIENTO
    {
        area: "Mantenimiento",
        indicador: "Cumplimiento mantenimiento preventivo",
        formula: (data) => data.actividadesEjecutadas && data.actividadesProgramadas ? ((data.actividadesEjecutadas / data.actividadesProgramadas) * 100).toFixed(2) : null,
        meta: 95,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Asegurar mantenimiento oportuno"
    },
    {
        area: "Mantenimiento",
        indicador: "Tiempo de respuesta",
        formula: (data) => data.tiempoTotalAtencion && data.totalFallas ? (data.tiempoTotalAtencion / data.totalFallas).toFixed(2) : null,
        meta: 2,
        metaTipo: "menorIgual",
        unidad: "h",
        descripcion: "Reducir tiempo de atención"
    },
    {
        area: "Mantenimiento",
        indicador: "Disponibilidad equipos críticos",
        formula: (data) => data.tiempoDisponible && data.tiempoTotal ? ((data.tiempoDisponible / data.tiempoTotal) * 100).toFixed(2) : null,
        meta: 97,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Garantizar operación continua"
    },
    {
        area: "Mantenimiento",
        indicador: "Incidentes repetitivos",
        formula: (data) => data.fallasRecurrentes !== undefined ? data.fallasRecurrentes : null,
        meta: 0,
        metaTipo: "igual",
        unidad: "",
        descripcion: "Prevenir reincidencias"
    },
    {
        area: "Mantenimiento",
        indicador: "Consumo de repuestos",
        formula: (data) => data.totalConsumido && data.totalSolicitado ? (data.totalConsumido / data.totalSolicitado).toFixed(2) : null,
        meta: 1,
        metaTipo: "menorIgual",
        unidad: "",
        descripcion: "Controlar uso de materiales"
    },
    {
        area: "Mantenimiento",
        indicador: "Actividades documentadas",
        formula: (data) => data.registrosCompletos && data.totalActividades ? ((data.registrosCompletos / data.totalActividades) * 100).toFixed(2) : null,
        meta: 100,
        metaTipo: "igual",
        unidad: "%",
        descripcion: "Asegurar trazabilidad"
    },
    {
        area: "Mantenimiento",
        indicador: "Satisfacción áreas internas",
        formula: (data) => data.encuestasPositivas && data.totalEncuestas ? ((data.encuestasPositivas / data.totalEncuestas) * 100).toFixed(2) : null,
        meta: 90,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Medir percepción del servicio"
    },
    {
        area: "Mantenimiento",
        indicador: "Capacitaciones ejecutadas",
        formula: (data) => data.capacitacionesRealizadas !== undefined ? data.capacitacionesRealizadas : null,
        meta: 1,
        metaTipo: "mayorIgual",
        unidad: "mensual",
        descripcion: "Formar personal técnico"
    },

    // CARNES
    {
        area: "Carnes",
        indicador: "Cumplimiento del margen",
        formula: (data) => data.precioVenta && data.costo ? (((data.precioVenta - data.costo) / data.precioVenta) * 100).toFixed(2) : null,
        meta: 20,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Medir rentabilidad"
    },
    {
        area: "Carnes",
        indicador: "% productos sin rotación",
        formula: (data) => data.productosSinVenta && data.totalProductos ? ((data.productosSinVenta / data.totalProductos) * 100).toFixed(2) : null,
        meta: 5,
        metaTipo: "menorIgual",
        unidad: "%",
        descripcion: "Identificar sobreinventario"
    },
    {
        area: "Carnes",
        indicador: "Rotación promedio",
        formula: (data) => data.ventas && data.inventarioPromedio ? (data.ventas / data.inventarioPromedio).toFixed(2) : null,
        meta: 1.5,
        metaTipo: "mayorIgual",
        unidad: "veces/mes",
        descripcion: "Evaluar rotación de producto"
    },
    {
        area: "Carnes",
        indicador: "Visitas sanitarias cumplidas",
        formula: (data) => data.visitasRealizadas && data.visitasProgramadas ? ((data.visitasRealizadas / data.visitasProgramadas) * 100).toFixed(2) : null,
        meta: 100,
        metaTipo: "igual",
        unidad: "%",
        descripcion: "Verificar cumplimiento sanitario"
    },
    {
        area: "Carnes",
        indicador: "Promociones ejecutadas",
        formula: (data) => data.promosAplicadas && data.promosProgramadas ? ((data.promosAplicadas / data.promosProgramadas) * 100).toFixed(2) : null,
        meta: 90,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Activar rotación y ventas"
    },
    {
        area: "Carnes",
        indicador: "Utilidad compra en pie",
        formula: (data) => data.utilidadNeta && data.costoCompraEnPie ? ((data.utilidadNeta / data.costoCompraEnPie) * 100).toFixed(2) : null,
        meta: 10,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Medir rentabilidad directa"
    },
    {
        area: "Carnes",
        indicador: "Plan de visitas",
        formula: (data) => data.visitasRealizadas && data.visitasPlanificadas ? ((data.visitasRealizadas / data.visitasPlanificadas) * 100).toFixed(2) : null,
        meta: 100,
        metaTipo: "igual",
        unidad: "%",
        descripcion: "Fortalecer presencia del líder"
    },
    {
        area: "Carnes",
        indicador: "% productos diferenciados",
        formula: (data) => data.productosInnovadores && data.totalPortafolio ? ((data.productosInnovadores / data.totalPortafolio) * 100).toFixed(2) : null,
        meta: 5,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Fomentar valor agregado"
    },

    // FRUVER
    {
        area: "Fruver",
        indicador: "Crecimiento en ventas",
        formula: (data) => data.ventasActuales && data.ventasPrevias ? (((data.ventasActuales - data.ventasPrevias) / data.ventasPrevias) * 100).toFixed(2) : null,
        meta: 4,
        metaTipo: "mayorIgual",
        unidad: "pp",
        descripcion: "Evaluar aumento en ingresos"
    },
    {
        area: "Fruver",
        indicador: "Margen bruto promedio",
        formula: (data) => data.ventas && data.costoVentas ? (((data.ventas - data.costoVentas) / data.ventas) * 100).toFixed(2) : null,
        meta: null, // Meta definida por área comercial
        metaTipo: "custom",
        unidad: "%",
        descripcion: "Medir rentabilidad general"
    },
    {
        area: "Fruver",
        indicador: "Reducción de mermas",
        formula: (data) => data.mermasActuales && data.mermasPrevias ? (((data.mermasActuales - data.mermasPrevias) / data.mermasPrevias) * 100).toFixed(2) : null,
        meta: null, // Reducción progresiva
        metaTipo: "custom",
        unidad: "%",
        descripcion: "Disminuir pérdida por deterioro"
    },
    {
        area: "Fruver",
        indicador: "Exactitud de inventario",
        formula: (data) => data.inventarioReal && data.inventarioSistema ? ((data.inventarioReal / data.inventarioSistema) * 100).toFixed(2) : null,
        meta: 98,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Asegurar control de inventario"
    },
    {
        area: "Fruver",
        indicador: "Frescura en tiendas",
        formula: (data) => data.productosFrescos && data.totalProductosEvaluados ? ((data.productosFrescos / data.totalProductosEvaluados) * 100).toFixed(2) : null,
        meta: 95,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Mantener calidad en góndolas"
    },
    {
        area: "Fruver",
        indicador: "Cumplimiento campañas comerciales",
        formula: (data) => data.campanasEjecutadas && data.campanasPlanificadas ? ((data.campanasEjecutadas / data.campanasPlanificadas) * 100).toFixed(2) : null,
        meta: 100,
        metaTipo: "igual",
        unidad: "%",
        descripcion: "Alinear acciones comerciales"
    },
    {
        area: "Fruver",
        indicador: "Acciones correctivas implementadas",
        formula: (data) => data.accionesEjecutadas && data.accionesRecomendadas ? ((data.accionesEjecutadas / data.accionesRecomendadas) * 100).toFixed(2) : null,
        meta: 95,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Mejorar respuesta operativa"
    },

    // PROCESOS
    {
        area: "Procesos",
        indicador: "Reducción tiempos/costos operativos",
        formula: (data) => data.costoAntes !== undefined && data.costoDespues !== undefined ? (data.costoAntes - data.costoDespues).toFixed(2) : null,
        meta: null, // Reducción progresiva
        metaTipo: "custom",
        unidad: "$",
        descripcion: "Medir eficiencia lograda"
    },
    {
        area: "Procesos",
        indicador: "Incremento en eficiencia y satisfacción",
        formula: (data) => data.satisfaccionActual !== undefined ? data.satisfaccionActual : null,
        meta: 90,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Aumentar valor percibido por usuarios"
    },
    {
        area: "Procesos",
        indicador: "Cumplimiento de estándares de mejora continua",
        formula: (data) => data.procesosConEstandar && data.totalProcesos ? ((data.procesosConEstandar / data.totalProcesos) * 100).toFixed(2) : null,
        meta: 95,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Asegurar alineación con metodología"
    },
    {
        area: "Procesos",
        indicador: "Incremento en calidad de procesos",
        formula: (data) => data.procesosSinHallazgos && data.totalAuditados ? ((data.procesosSinHallazgos / data.totalAuditados) * 100).toFixed(2) : null,
        meta: 90,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Mejorar consistencia y calidad"
    },

    // SISTEMAS
    {
        area: "Sistemas",
        indicador: "Resolución de tickets",
        formula: (data) => data.ticketsResueltos24h && data.totalTickets ? ((data.ticketsResueltos24h / data.totalTickets) * 100).toFixed(2) : null,
        meta: 90,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Medir agilidad del soporte"
    },
    {
        area: "Sistemas",
        indicador: "Disponibilidad del sistema",
        formula: (data) => data.tiempoActivo && data.tiempoTotal ? ((data.tiempoActivo / data.tiempoTotal) * 100).toFixed(2) : null,
        meta: 99.9,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Garantizar operatividad tecnológica"
    },
    {
        area: "Sistemas",
        indicador: "Cumplimiento mantenimiento programado",
        formula: (data) => data.mantenimientosRealizados && data.mantenimientosProgramados ? ((data.mantenimientosRealizados / data.mantenimientosProgramados) * 100).toFixed(2) : null,
        meta: 100,
        metaTipo: "igual",
        unidad: "%",
        descripcion: "Asegurar continuidad tecnológica"
    },
    {
        area: "Sistemas",
        indicador: "Incidentes de seguridad",
        formula: (data) => data.incidentesReportados !== undefined ? data.incidentesReportados : null,
        meta: 0,
        metaTipo: "igual",
        unidad: "",
        descripcion: "Prevenir vulnerabilidades"
    },
    {
        area: "Sistemas",
        indicador: "Backups exitosos",
        formula: (data) => data.backupsCorrectos && data.backupsProgramados ? ((data.backupsCorrectos / data.backupsProgramados) * 100).toFixed(2) : null,
        meta: 100,
        metaTipo: "igual",
        unidad: "%",
        descripcion: "Proteger datos críticos"
    },
    {
        area: "Sistemas",
        indicador: "Satisfacción de usuarios",
        formula: (data) => data.usuariosSatisfechos && data.encuestados ? ((data.usuariosSatisfechos / data.encuestados) * 100).toFixed(2) : null,
        meta: 85,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Medir percepción del servicio TI"
    },
    {
        area: "Sistemas",
        indicador: "Respuesta ante incidentes críticos",
        formula: (data) => data.tiempoRespuestaCriticos !== undefined ? data.tiempoRespuestaCriticos : null,
        meta: 2,
        metaTipo: "menorIgual",
        unidad: "h",
        descripcion: "Actuar rápidamente ante fallos graves"
    },

    // DESARROLLO
    {
        area: "Desarrollo",
        indicador: "Proyectos entregados a tiempo",
        formula: (data) => data.proyectosATiempo && data.totalProyectos ? ((data.proyectosATiempo / data.totalProyectos) * 100).toFixed(2) : null,
        meta: 90,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Cumplir cronogramas"
    },
    {
        area: "Desarrollo",
        indicador: "Satisfacción de usuarios",
        formula: (data) => data.usuariosSatisfechos && data.totalEncuestados ? ((data.usuariosSatisfechos / data.totalEncuestados) * 100).toFixed(2) : null,
        meta: 85,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Medir valor percibido del desarrollo"
    },
    {
        area: "Desarrollo",
        indicador: "Errores críticos",
        formula: (data) => data.fallosCriticos !== undefined ? data.fallosCriticos : null,
        meta: 1,
        metaTipo: "menorIgual",
        unidad: "mes",
        descripcion: "Prevenir fallas graves"
    },
    {
        area: "Desarrollo",
        indicador: "Solicitudes atendidas",
        formula: (data) => data.solicitudesResueltas && data.totalesRecibidas ? ((data.solicitudesResueltas / data.totalesRecibidas) * 100).toFixed(2) : null,
        meta: 100,
        metaTipo: "igual",
        unidad: "%",
        descripcion: "Dar respuesta oportuna"
    },
    {
        area: "Desarrollo",
        indicador: "Tiempo promedio desarrollo",
        formula: (data) => data.tiempoTotal && data.numeroDesarrollos ? (data.tiempoTotal / data.numeroDesarrollos).toFixed(2) : null,
        meta: 15,
        metaTipo: "menorIgual",
        unidad: "días",
        descripcion: "Reducir duración por proyecto"
    },
    {
        area: "Desarrollo",
        indicador: "Implementaciones exitosas",
        formula: (data) => data.implementacionesSinError && data.totales ? ((data.implementacionesSinError / data.totales) * 100).toFixed(2) : null,
        meta: 100,
        metaTipo: "igual",
        unidad: "%",
        descripcion: "Asegurar calidad de entregas"
    },
    {
        area: "Desarrollo",
        indicador: "Adopción de nuevas tecnologías",
        formula: (data) => data.implementacionesTecnologicas !== undefined ? data.implementacionesTecnologicas : null,
        meta: 1,
        metaTipo: "mayorIgual",
        unidad: "trimestre",
        descripcion: "Mantener vanguardia digital"
    },

    // LÍDERES
    {
        area: "Líderes",
        indicador: "Cumplimiento de metas de ventas",
        formula: (data) => data.ventasReales && data.meta ? ((data.ventasReales / data.meta) * 100).toFixed(2) : null,
        meta: 100,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Evaluar efectividad comercial"
    },
    {
        area: "Líderes",
        indicador: "Ticket promedio por cliente",
        formula: (data) => data.ventasTotales && data.numeroClientes ? (data.ventasTotales / data.numeroClientes).toFixed(2) : null,
        meta: null, // Incremento mensual del 5%
        metaTipo: "custom",
        unidad: "$",
        descripcion: "Aumentar valor por transacción"
    },
    {
        area: "Líderes",
        indicador: "Rentabilidad por punto de venta",
        formula: (data) => data.utilidadNeta && data.ventasTotales ? ((data.utilidadNeta / data.ventasTotales) * 100).toFixed(2) : null,
        meta: 20,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Medir eficiencia financiera"
    },
    {
        area: "Líderes",
        indicador: "Satisfacción del cliente",
        formula: (data) => data.clientesSatisfechos && data.totalEncuestados ? ((data.clientesSatisfechos / data.totalEncuestados) * 100).toFixed(2) : null,
        meta: 90,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Medir calidad del servicio"
    },
    {
        area: "Líderes",
        indicador: "Cumplimiento de proyectos de mejora",
        formula: (data) => data.proyectosEjecutados && data.planificados ? ((data.proyectosEjecutados / data.planificados) * 100).toFixed(2) : null,
        meta: 90,
        metaTipo: "mayorIgual",
        unidad: "%",
        descripcion: "Medir capacidad de ejecución"
    }
];
