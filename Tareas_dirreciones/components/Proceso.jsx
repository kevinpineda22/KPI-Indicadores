import React, { useState, useEffect } from 'react';
import { kpiConfig } from './kpiConfig';
import { KpiInputPanel } from './KpiInputPanel';
import './Proceso.css';
import { toast } from 'react-toastify';

const BACKEND_URL = 'https://backend-kpi-indicadores.vercel.app';

export const Proceso = ({ actividades = [], direccion, usuario }) => {
    const [selectedArea, setSelectedArea] = useState(kpiConfig[0].area);
    const [viewMode, setViewMode] = useState('input'); // 'input' o 'resumen'
    const [kpisGuardados, setKpisGuardados] = useState([]);
    const [ultimosKpisBackend, setUltimosKpisBackend] = useState([]);
    const [loading, setLoading] = useState(false);

    // Obtener áreas únicas
    const areasUnicas = [...new Set(kpiConfig.map(k => k.area))];

    // Cargar KPIs del backend cuando cambia el área o el modo de vista
    useEffect(() => {
        if (viewMode === 'resumen' && selectedArea) {
            cargarKpisDesdeBackend();
        }
    }, [selectedArea, viewMode]);

    // Cargar últimos KPIs desde el backend
    const cargarKpisDesdeBackend = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/kpis/area/${encodeURIComponent(selectedArea)}/ultimos`);
            if (response.ok) {
                const data = await response.json();
                setUltimosKpisBackend(data.data || []);
            } else {
                console.error('Error al cargar KPIs del backend');
            }
        } catch (error) {
            console.error('Error al cargar KPIs:', error);
            toast.error('Error al cargar indicadores del backend');
        } finally {
            setLoading(false);
        }
    };

    // Callback cuando se guarda un KPI
    const handleSaveKpi = (kpiData) => {
        console.log('KPI Guardado:', kpiData);
        setKpisGuardados(prev => [kpiData, ...prev]);
        // Recargar KPIs si estamos en modo resumen
        if (viewMode === 'resumen') {
            cargarKpisDesdeBackend();
        }
    };

    return (
        <div className="proceso-kpi-container">
            <div className="proceso-header">
                <div className="header-left">
                    <h2>Panel KPIs - Dirección de Operaciones</h2>
                    <p>Gestión de indicadores clave de desempeño por área</p>
                </div>
                
                <div className="header-controls">
                    <div className="view-toggle">
                        <button 
                            className={viewMode === 'input' ? 'active' : ''}
                            onClick={() => setViewMode('input')}
                        >
                            📊 Ingresar Datos
                        </button>
                        <button 
                            className={viewMode === 'resumen' ? 'active' : ''}
                            onClick={() => setViewMode('resumen')}
                        >
                            📈 Ver Resumen
                        </button>
                    </div>
                    
                    <div className="area-selector">
                        <label>Área:</label>
                        <select
                            value={selectedArea}
                            onChange={e => setSelectedArea(e.target.value)}
                        >
                            {areasUnicas.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {viewMode === 'input' ? (
                <KpiInputPanel 
                    area={selectedArea} 
                    onSaveKpi={handleSaveKpi}
                    direccion={direccion}
                    usuario={usuario}
                />
            ) : (
                <div className="kpi-resumen">
                    <div className="resumen-header">
                        <h3>Resumen de Indicadores - {selectedArea}</h3>
                        <p>Últimos valores registrados en el sistema</p>
                    </div>
                    
                    {loading ? (
                        <div className="loading-state">
                            <p>Cargando indicadores...</p>
                        </div>
                    ) : (
                        <div className="kpi-list">
                            {kpiConfig.filter(kpi => kpi.area === selectedArea).map((kpi, i) => {
                                // Buscar el último valor registrado en el backend
                                const kpiBackend = ultimosKpisBackend.find(k => k.indicador === kpi.indicador);
                                const valor = kpiBackend ? kpiBackend.valor : null;
                                const cumpleMeta = kpiBackend ? kpiBackend.cumple_meta : null;
                                const fechaRegistro = kpiBackend ? new Date(kpiBackend.fecha_registro).toLocaleDateString() : null;
                                const meta = kpi.meta !== null ? kpi.meta + kpi.unidad : 'Variable';
                                
                                return (
                                    <div key={i} className={`kpi-resumen-card ${cumpleMeta ? 'success' : valor !== null ? 'warning' : 'neutral'}`}>
                                        <div className="kpi-resumen-header">
                                            <h4>{kpi.indicador}</h4>
                                            <span className="meta-badge">Meta: {meta}</span>
                                        </div>
                                        <p className="kpi-descripcion">{kpi.descripcion}</p>
                                        <div className="kpi-valor-section">
                                            <div className="valor-actual">
                                                <span className="label">Último Valor:</span>
                                                <span className="valor">
                                                    {valor !== null ? `${valor}${kpi.unidad}` : 'Sin datos'}
                                                </span>
                                            </div>
                                            {fechaRegistro && (
                                                <div className="fecha-registro">
                                                    <span className="label">Fecha:</span>
                                                    <span>{fechaRegistro}</span>
                                                </div>
                                            )}
                                            <div className="cumplimiento">
                                                {valor !== null && cumpleMeta !== null && (
                                                    cumpleMeta ? (
                                                        <span className="badge-success">✓ Cumple</span>
                                                    ) : (
                                                        <span className="badge-danger">✗ No cumple</span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {kpiConfig.filter(kpi => kpi.area === selectedArea).length === 0 && (
                                <div className="empty-state">
                                    <p>No hay indicadores configurados para esta área</p>
                                </div>
                            )}

                            {ultimosKpisBackend.length === 0 && kpiConfig.filter(kpi => kpi.area === selectedArea).length > 0 && (
                                <div className="empty-state">
                                    <p>No hay registros de KPIs para esta área. Comience ingresando datos.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Proceso;
