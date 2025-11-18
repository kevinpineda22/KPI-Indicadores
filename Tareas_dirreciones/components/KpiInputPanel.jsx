import React, { useState, useMemo, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiCheckCircle, FiAlertCircle, FiSave, FiClock, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { kpiConfig } from './kpiConfig';
import './KpiInputPanel.css';

const BACKEND_URL = 'https://backend-kpi-indicadores.vercel.app';

/**
 * Componente profesional para ingresar valores de KPIs por área
 * Genera automáticamente los campos de entrada basados en las fórmulas
 */
export const KpiInputPanel = ({ area, onSaveKpi, direccion, usuario }) => {
    const [kpiValues, setKpiValues] = useState({});
    const [savedResults, setSavedResults] = useState({});
    const [loading, setLoading] = useState(false);
    const [ultimosKpis, setUltimosKpis] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // Filtrar KPIs por área seleccionada
    const kpisDelArea = useMemo(() => {
        return kpiConfig.filter(kpi => kpi.area === area);
    }, [area]);

    // Cargar últimos valores de KPIs al cambiar de área
    useEffect(() => {
        if (area) {
            cargarUltimosKpis();
        }
    }, [area]);

    // Verificar si ya existe un registro para el indicador en el mes seleccionado
    const existeRegistroDelMes = (indicador) => {
        const kpiDelMes = ultimosKpis.find(k => {
            if (k.indicador !== indicador) return false;
            
            const fechaRegistro = new Date(k.fecha_registro);
            const [year, month] = selectedPeriod.split('-');
            
            return fechaRegistro.getFullYear() === parseInt(year) && 
                   fechaRegistro.getMonth() + 1 === parseInt(month);
        });
        
        return kpiDelMes;
    };

    // Obtener el mes y año actual en formato legible
    const getPeriodoLegible = () => {
        const [year, month] = selectedPeriod.split('-');
        const fecha = new Date(parseInt(year), parseInt(month) - 1);
        return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    // Cargar últimos KPIs del backend
    const cargarUltimosKpis = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/kpis/area/${encodeURIComponent(area)}/ultimos`);
            if (response.ok) {
                const data = await response.json();
                setUltimosKpis(data.data || []);
            }
        } catch (error) {
            console.error('Error al cargar últimos KPIs:', error);
        }
    };

    // Mapeo de nombres de variables a etiquetas legibles
    const fieldLabels = {
        // Inventario
        unidadesCorrectas: 'Unidades correctas',
        unidadesTotales: 'Unidades totales',
        valorAjustes: 'Valor de ajustes',
        ventasTotales: 'Ventas totales',
        ventas: 'Ventas',
        inventarioPromedio: 'Inventario promedio',
        inventarioDisponible: 'Inventario disponible',
        consumoPromedioDiario: 'Consumo promedio diario',
        valorInactivo: 'Valor inactivo',
        inventarioTotal: 'Inventario total',
        costoActual: 'Costo actual',
        costoAnterior: 'Costo mes anterior',
        auditoriasRealizadas: 'Auditorías realizadas',
        auditoriasPlanificadas: 'Auditorías planificadas',
        ajustesConEvidencia: 'Ajustes con evidencia',
        totalAjustes: 'Total de ajustes',
        
        // Logística
        sumaTiemposRecepcion: 'Suma de tiempos de recepción (horas)',
        totalRecepciones: 'Total de recepciones',
        recepcionesCorrectas: 'Recepciones correctas',
        espacioUsado: 'Espacio usado',
        espacioDisponible: 'Espacio disponible',
        incidentesPerdida: 'Número de incidentes de pérdida',
        despachosATiempo: 'Despachos a tiempo',
        totalDespachos: 'Total de despachos',
        entregasATiempo: 'Entregas a tiempo',
        totalEntregas: 'Total de entregas',
        erroresAlistamiento: 'Errores de alistamiento',
        totalAlistamientos: 'Total de alistamientos',
        diasDisponibles: 'Días disponibles',
        diasOperativos: 'Días operativos',
        
        // Suministros
        totalGastosCajaMenor: 'Total gastos caja menor',
        topeAutorizado: 'Tope autorizado',
        reportesEntregados: 'Reportes entregados',
        reportesProgramados: 'Reportes programados',
        consumoActual: 'Consumo actual',
        consumoAnterior: 'Consumo mes anterior',
        ingresosEmpaque: 'Ingresos por empaque',
        metaEstablecida: 'Meta establecida',
        totalConsumo: 'Total consumo',
        consumoPlanificado: 'Consumo planificado',
        inventarioCorrecto: 'Inventario correcto',
        totalInventario: 'Total inventario',
        consumoDiario: 'Consumo diario',
        valorPerdido: 'Valor perdido',
        valorTotal: 'Valor total',
        
        // Mantenimiento
        actividadesEjecutadas: 'Actividades ejecutadas',
        actividadesProgramadas: 'Actividades programadas',
        tiempoTotalAtencion: 'Tiempo total de atención (horas)',
        totalFallas: 'Total de fallas',
        tiempoDisponible: 'Tiempo disponible',
        tiempoTotal: 'Tiempo total',
        fallasRecurrentes: 'Número de fallas recurrentes',
        totalConsumido: 'Total consumido',
        totalSolicitado: 'Total solicitado',
        registrosCompletos: 'Registros completos',
        totalActividades: 'Total de actividades',
        encuestasPositivas: 'Encuestas positivas',
        totalEncuestas: 'Total de encuestas',
        capacitacionesRealizadas: 'Capacitaciones realizadas',
        
        // Carnes
        precioVenta: 'Precio de venta',
        costo: 'Costo',
        productosSinVenta: 'Productos sin venta',
        totalProductos: 'Total de productos',
        visitasRealizadas: 'Visitas realizadas',
        visitasProgramadas: 'Visitas programadas',
        promosAplicadas: 'Promociones aplicadas',
        promosProgramadas: 'Promociones programadas',
        utilidadNeta: 'Utilidad neta',
        costoCompraEnPie: 'Costo compra en pie',
        visitasPlanificadas: 'Visitas planificadas',
        productosInnovadores: 'Productos innovadores',
        totalPortafolio: 'Total portafolio',
        
        // Fruver
        ventasActuales: 'Ventas actuales',
        ventasPrevias: 'Ventas periodo anterior',
        costoVentas: 'Costo de ventas',
        mermasActuales: 'Mermas actuales',
        mermasPrevias: 'Mermas periodo anterior',
        inventarioReal: 'Inventario real',
        inventarioSistema: 'Inventario sistema',
        productosFrescos: 'Productos frescos',
        totalProductosEvaluados: 'Total productos evaluados',
        campanasEjecutadas: 'Campañas ejecutadas',
        campanasPlanificadas: 'Campañas planificadas',
        accionesEjecutadas: 'Acciones ejecutadas',
        accionesRecomendadas: 'Acciones recomendadas',
        
        // Procesos
        costoAntes: 'Costo antes',
        costoDespues: 'Costo después',
        satisfaccionActual: 'Satisfacción actual (%)',
        procesosConEstandar: 'Procesos con estándar',
        totalProcesos: 'Total de procesos',
        procesosSinHallazgos: 'Procesos sin hallazgos',
        totalAuditados: 'Total auditados',
        
        // Sistemas
        ticketsResueltos24h: 'Tickets resueltos en 24h',
        totalTickets: 'Total de tickets',
        tiempoActivo: 'Tiempo activo',
        mantenimientosRealizados: 'Mantenimientos realizados',
        mantenimientosProgramados: 'Mantenimientos programados',
        incidentesReportados: 'Incidentes reportados',
        backupsCorrectos: 'Backups correctos',
        backupsProgramados: 'Backups programados',
        usuariosSatisfechos: 'Usuarios satisfechos',
        encuestados: 'Encuestados',
        tiempoRespuestaCriticos: 'Tiempo respuesta críticos (horas)',
        
        // Desarrollo
        proyectosATiempo: 'Proyectos a tiempo',
        totalProyectos: 'Total proyectos',
        totalEncuestados: 'Total encuestados',
        fallosCriticos: 'Fallos críticos',
        solicitudesResueltas: 'Solicitudes resueltas',
        totalesRecibidas: 'Totales recibidas',
        tiempoTotal: 'Tiempo total (días)',
        numeroDesarrollos: 'Número de desarrollos',
        implementacionesSinError: 'Implementaciones sin error',
        totales: 'Totales',
        implementacionesTecnologicas: 'Implementaciones tecnológicas',
        
        // Líderes
        ventasReales: 'Ventas reales',
        meta: 'Meta',
        numeroClientes: 'Número de clientes',
        clientesSatisfechos: 'Clientes satisfechos',
        proyectosEjecutados: 'Proyectos ejecutados',
        planificados: 'Planificados'
    };

    // Extraer campos necesarios de la fórmula del KPI
    const getRequiredFields = (kpi) => {
        const formulaString = kpi.formula.toString();
        const fields = [];
        
        // Extrae variables de data.variable
        const matches = formulaString.matchAll(/data\.(\w+)/g);
        for (const match of matches) {
            if (!fields.includes(match[1])) {
                fields.push(match[1]);
            }
        }
        
        return fields;
    };

    // Actualizar valor de un campo
    const handleFieldChange = (kpiIndicador, field, value) => {
        setKpiValues(prev => ({
            ...prev,
            [kpiIndicador]: {
                ...prev[kpiIndicador],
                [field]: value === '' ? '' : Number(value)
            }
        }));
    };

    // Calcular resultado del KPI
    const calculateKpi = (kpi) => {
        const data = kpiValues[kpi.indicador];
        if (!data) return null;
        
        // Verificar que todos los campos requeridos tengan valor
        const requiredFields = getRequiredFields(kpi);
        const allFieldsFilled = requiredFields.every(field => 
            data[field] !== undefined && data[field] !== '' && !isNaN(data[field])
        );
        
        if (!allFieldsFilled) return null;
        
        return kpi.formula(data);
    };

    // Verificar si cumple la meta
    const checkMetaCumplimiento = (valor, kpi) => {
        if (valor === null || valor === undefined) return null;
        const valorNum = Number(valor);
        
        switch (kpi.metaTipo) {
            case 'mayorIgual':
                return valorNum >= kpi.meta;
            case 'menorIgual':
                return valorNum <= kpi.meta;
            case 'igual':
                return Math.abs(valorNum - kpi.meta) < 0.01;
            case 'menorQueAnterior':
                return true; // Se maneja de forma especial con campos actuales/anteriores
            case 'custom':
                return null; // Meta personalizada, no se puede evaluar automáticamente
            default:
                return null;
        }
    };

    // Guardar KPI
    const handleSaveKpi = async (kpi) => {
        const resultado = calculateKpi(kpi);
        if (resultado === null) {
            toast.warning('Por favor complete todos los campos requeridos');
            return;
        }

        // Verificar si ya existe un registro del mes
        const registroExistente = existeRegistroDelMes(kpi.indicador);
        if (registroExistente) {
            toast.error(`⚠️ Ya existe un registro de "${kpi.indicador}" para ${getPeriodoLegible()}`);
            return;
        }
        
        const cumpleMeta = checkMetaCumplimiento(resultado, kpi);
        
        setLoading(true);
        
        try {
            // Preparar datos para enviar al backend con el período seleccionado
            const [year, month] = selectedPeriod.split('-');
            const fechaPeriodo = new Date(parseInt(year), parseInt(month) - 1, 1);
            
            const kpiData = {
                area: kpi.area,
                indicador: kpi.indicador,
                valor: parseFloat(resultado),
                unidad: kpi.unidad,
                cumple_meta: cumpleMeta,
                meta: kpi.meta,
                datos_entrada: kpiValues[kpi.indicador],
                direccion: direccion || null,
                usuario: usuario || null,
                observaciones: null,
                fecha_registro: fechaPeriodo.toISOString()
            };

            // Enviar al backend
            const response = await fetch(`${BACKEND_URL}/api/kpis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(kpiData)
            });

            const responseData = await response.json();

            if (response.ok) {
                // Guardar resultado localmente
                setSavedResults(prev => ({
                    ...prev,
                    [kpi.indicador]: {
                        valor: resultado,
                        cumpleMeta,
                        data: kpiValues[kpi.indicador],
                        fecha: new Date().toISOString(),
                        id: responseData.data.id
                    }
                }));
                
                // Callback para actualizar componente padre (opcional)
                if (onSaveKpi) {
                    onSaveKpi(responseData.data);
                }
                
                // Limpiar formulario
                setKpiValues(prev => ({
                    ...prev,
                    [kpi.indicador]: {}
                }));

                // Recargar últimos KPIs
                await cargarUltimosKpis();

                toast.success('✓ KPI guardado exitosamente');
            } else {
                toast.error(responseData.message || 'Error al guardar el KPI');
            }
        } catch (error) {
            console.error('Error al guardar KPI:', error);
            toast.error('Error de conexión al guardar el KPI');
        } finally {
            setLoading(false);
        }
    };

    // Renderizar campos de entrada para un KPI
    const renderKpiInputs = (kpi) => {
        const fields = getRequiredFields(kpi);
        const currentValues = kpiValues[kpi.indicador] || {};
        const resultado = calculateKpi(kpi);
        const cumpleMeta = resultado !== null ? checkMetaCumplimiento(resultado, kpi) : null;
        
        // Obtener último valor guardado
        const ultimoKpi = ultimosKpis.find(k => k.indicador === kpi.indicador);
        
        // Verificar si ya existe registro del mes actual
        const registroDelMes = existeRegistroDelMes(kpi.indicador);
        
        return (
            <div key={kpi.indicador} className={`kpi-card ${registroDelMes ? 'registrado' : ''}`}>
                <div className="kpi-header">
                    <div className="kpi-title-section">
                        <h3>{kpi.indicador}</h3>
                        <p className="kpi-description">{kpi.descripcion}</p>
                    </div>
                    <div className="kpi-meta-badge">
                        Meta: {kpi.meta !== null ? `${kpi.meta}${kpi.unidad}` : 'Variable'}
                    </div>
                </div>

                {/* Alerta si ya existe registro del mes */}
                {registroDelMes && (
                    <div className="registro-mes-existente">
                        <FiCheckCircle size={16} />
                        <span>
                            ✓ Registrado para <strong>{getPeriodoLegible()}</strong>
                            {' - '}<strong>{registroDelMes.valor}{registroDelMes.unidad}</strong>
                        </span>
                    </div>
                )}

                {/* Mostrar último valor registrado */}
                {ultimoKpi && !registroDelMes && (
                    <div className="ultimo-registro">
                        <FiClock size={14} />
                        <span>
                            Último: <strong>{ultimoKpi.valor}{ultimoKpi.unidad}</strong>
                            {' '}({new Date(ultimoKpi.fecha_registro).toLocaleDateString()})
                        </span>
                    </div>
                )}
                
                <div className="kpi-inputs">
                    {fields.map(field => (
                        <div key={field} className="input-group">
                            <label>{fieldLabels[field] || field}</label>
                            <input
                                type="number"
                                step="0.01"
                                value={currentValues[field] || ''}
                                onChange={(e) => handleFieldChange(kpi.indicador, field, e.target.value)}
                                placeholder="Ingrese valor"
                                className="kpi-input"
                                disabled={loading || registroDelMes}
                            />
                        </div>
                    ))}
                </div>
                
                {resultado !== null && !registroDelMes && (
                    <div className={`kpi-result ${cumpleMeta === true ? 'success' : cumpleMeta === false ? 'danger' : 'neutral'}`}>
                        <div className="result-value">
                            <span className="result-label">Resultado:</span>
                            <span className="result-number">{resultado}{kpi.unidad}</span>
                        </div>
                        {cumpleMeta !== null && (
                            <div className="result-status">
                                {cumpleMeta ? (
                                    <>
                                        <FiCheckCircle className="icon-success" />
                                        <span>Cumple la meta</span>
                                    </>
                                ) : (
                                    <>
                                        <FiAlertCircle className="icon-danger" />
                                        <span>No cumple la meta</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                <button 
                    className={`btn-save-kpi ${registroDelMes ? 'ya-registrado' : ''}`}
                    onClick={() => handleSaveKpi(kpi)}
                    disabled={resultado === null || loading || registroDelMes}
                >
                    <FiSave /> {registroDelMes ? 'Ya Registrado' : loading ? 'Guardando...' : 'Guardar Indicador'}
                </button>
                
                {savedResults[kpi.indicador] && (
                    <div className="saved-notification">
                        ✓ Guardado el {new Date(savedResults[kpi.indicador].fecha).toLocaleString()}
                    </div>
                )}
            </div>
        );
    };

    if (!area) {
        return (
            <div className="kpi-panel-empty">
                <p>Seleccione un área para ver sus indicadores</p>
            </div>
        );
    }

    if (kpisDelArea.length === 0) {
        return (
            <div className="kpi-panel-empty">
                <p>No hay indicadores configurados para el área "{area}"</p>
            </div>
        );
    }

    return (
        <div className="kpi-input-panel">
            <div className="panel-header">
                <div className="header-content">
                    <h2>
                        <FiTrendingUp className="header-icon" />
                        Indicadores KPI - {area}
                    </h2>
                    <p className="header-subtitle">
                        Ingrese los valores para calcular los indicadores de desempeño
                    </p>
                </div>
                <div className="header-right-section">
                    <div className="periodo-selector">
                        <FiCalendar className="calendar-icon" />
                        <input
                            type="month"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            max={new Date().toISOString().slice(0, 7)}
                            className="month-input"
                        />
                    </div>
                    <div className="kpi-count-badge">
                        {kpisDelArea.length} indicadores
                    </div>
                </div>
            </div>
            
            {/* Banner informativo sobre el registro mensual */}
            <div className="registro-mensual-info">
                <FiCalendar />
                <div className="registro-mensual-info-content">
                    <h4>📊 Registro Mensual Único</h4>
                    <p>
                        Los indicadores KPI se registran <strong>una sola vez al mes</strong>. 
                        Seleccione el mes en el calendario superior. Al cambiar de mes, podrá registrar nuevos valores.
                    </p>
                </div>
            </div>
            
            <div className="kpi-grid">
                {kpisDelArea.map(kpi => renderKpiInputs(kpi))}
            </div>
        </div>
    );
};

export default KpiInputPanel;
