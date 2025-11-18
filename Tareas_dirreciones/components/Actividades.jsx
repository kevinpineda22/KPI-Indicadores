import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import { 
    FiActivity, FiPlus, FiUser, FiClock, FiFlag, FiCalendar, 
    FiCheckSquare, FiX, FiSave, FiEye, FiFileText, FiFile, 
    FiMessageSquare, FiEdit, FiTrash2
} from 'react-icons/fi';
import { kpiConfig } from './kpiConfig';

const BACKEND_URL = 'http://localhost:3000';

// Configuraciones del sistema
const areas = [
    { value: 'sistemas', label: 'Sistemas' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'desarrollo', label: 'Desarrollo' },
    { value: 'calidad', label: 'Calidad' },
    { value: 'seguridad', label: 'Seguridad' }
];

const prioridades = [
    { value: 'Alta', color: '#dc3545', icon: '🔴' },
    { value: 'Media', color: '#f59e0b', icon: '🟡' },
    { value: 'Baja', color: '#10b981', icon: '🟢' }
];

const kanbanColumns = ['Por Hacer', 'En Curso', 'Revisión', 'Terminado'];

export const Actividades = ({ userDirection, userArea, direcciones, areas, rol }) => {
    // Estados principales
    const [actividades, setActividades] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [loading, setLoading] = useState(false);

    // Estados para indicadores
    const [indicadores, setIndicadores] = useState({
        totalActividades: 0,
        actividadesCompletadas: 0,
        actividadesPendientes: 0,
        promedioTiempoCompletion: 0,
        actividadesPorPrioridad: { Alta: 0, Media: 0, Baja: 0 }
    });

    // Cargar datos iniciales
    useEffect(() => {
        fetchActividades();
    }, [userDirection, userArea]);

    // Recalcular indicadores cuando cambien las actividades
    useEffect(() => {
        calculateIndicadores();
    }, [actividades]);

    const fetchActividades = async () => {
        setLoading(true);
        try {
            // Validar que userDirection tenga valor
            if (!userDirection) {
                toast.error('No se ha seleccionado una dirección válida.');
                setLoading(false);
                setActividades([]);
                return;
            }
            // Construir la URL según el rol y filtros
            let url = `${BACKEND_URL}/api/actividades-direccion/${userDirection}`;
            if (userArea && userArea !== 'lider' && userArea !== 'gerencia') {
                url += `?area=${userArea}`;
            }
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setActividades(data);
            } else {
                toast.error('No se encontraron actividades para la dirección/área seleccionada.');
                setActividades([]);
            }
        } catch (error) {
            console.error('Error al cargar actividades:', error);
            toast.error('Error al cargar las actividades');
        } finally {
            setLoading(false);
        }
    };

    const calculateIndicadores = useCallback(() => {
        const total = actividades.length;
        const completadas = actividades.filter(a => a.estado === 'Terminado').length;
        const pendientes = total - completadas;
        
        const porPrioridad = actividades.reduce((acc, act) => {
            acc[act.prioridad] = (acc[act.prioridad] || 0) + 1;
            return acc;
        }, { Alta: 0, Media: 0, Baja: 0 });

        setIndicadores({
            totalActividades: total,
            actividadesCompletadas: completadas,
            actividadesPendientes: pendientes,
            promedioTiempoCompletion: 0, // Se calcularía basado en fechas
            actividadesPorPrioridad: porPrioridad
        });
    }, [actividades]);

    // Funciones del Kanban
    const handleDragEnd = async (result) => {
        const { draggableId: activityId, source, destination } = result;
        
        if (!destination || destination.droppableId === source.droppableId) return;

        const newStatus = kanbanColumns[parseInt(destination.droppableId)];
        
        // Actualización optimista
        setActividades(prev => 
            prev.map(act => 
                act.id.toString() === activityId 
                    ? { ...act, estado: newStatus }
                    : act
            )
        );

        try {
            await fetch(`${BACKEND_URL}/api/actividades-direccion/${activityId}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: newStatus }),
            });
            
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            toast.error('Error al mover la actividad');
            fetchActividades(); // Recargar en caso de error
        }
    };

    const getActividadesByColumn = useCallback((columnIndex) => {
        const columnName = kanbanColumns[columnIndex];
        return actividades.filter(a => a.estado === columnName);
    }, [actividades]);

    const handleCreateActivity = async (formData) => {
        try {
            // Construye el objeto con todos los datos, incluyendo KPI
            const activityData = {
                nombre: formData.nombre.trim(),
                asignado_a: formData.asignado_a.trim(),
                prioridad: formData.prioridad,
                fecha_inicio: formData.fecha_inicio || null,
                fecha_final: formData.fecha_final || null,
                objetivo: formData.objetivo?.trim() || '',
                impacto: formData.impacto?.trim() || '',
                alcance: formData.alcance?.trim() || '',
                recursos: formData.recursos?.trim() || '',
                areas_involucradas: Array.isArray(formData.areas_involucradas) 
                    ? formData.areas_involucradas 
                    : [],
                direccion: userDirection,
                area: userArea, // Asegura que el área se envíe
                kpi_relacionado: formData.kpi_relacionado || '',
                kpi_data: formData.kpi_data || {}, // Datos para el KPI
            };

            // Enviar al backend
            const response = await fetch(`${BACKEND_URL}/api/actividades-direccion`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(activityData),
            });

            const responseData = await response.json();

            if (response.ok) {
                toast.success('Actividad creada exitosamente');
                fetchActividades();
                return true;
            } else {
                // Mostrar errores específicos de validación
                if (responseData.errors && Array.isArray(responseData.errors)) {
                    responseData.errors.forEach(error => {
                        toast.error(`${error.field}: ${error.message}`);
                    });
                } else {
                    toast.error(responseData.message || 'Error al crear actividad');
                }
                return false;
            }
        } catch (error) {
            console.error('❌ Error:', error);
            toast.error('Error de conexión al crear la actividad');
            return false;
        }
    };

    // KPIs disponibles según área seleccionada
    const kpisDisponibles = useMemo(() => {
        return kpiConfig.filter(kpi => kpi.area.toLowerCase() === userArea?.toLowerCase());
    }, [userArea]);

    if (loading) {
        return <div className="loading-spinner">Cargando actividades...</div>;
    }

    return (
        <div className="admin-actividades-container">
            {/* Header con indicadores resumidos */}
            <div className="actividades-header">
                <div className="header-info">
                    <h3>
                        Gestión de Actividades - 
                        {direcciones.find(d => d.value === userDirection)?.label || userDirection}
                        {" / "}
                        {areas.find(a => a.value === userArea)?.label || userArea || "Sin área"}
                    </h3>
                    <div className="quick-stats">
                        <div className="stat-card">
                            <FiActivity />
                            <span>Total: {indicadores.totalActividades}</span>
                        </div>
                        <div className="stat-card completed">
                            <FiCheckSquare />
                            <span>Completadas: {indicadores.actividadesCompletadas}</span>
                        </div>
                        <div className="stat-card pending">
                            <FiClock />
                            <span>Pendientes: {indicadores.actividadesPendientes}</span>
                        </div>
                    </div>
                </div>
                
                <button 
                    className="btn-create-activity"
                    onClick={() => setShowCreateModal(true)}
                >
                    <FiPlus /> Crear Actividad
                </button>
            </div>

            {/* Tablero Kanban */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="kanban-board-direcciones">
                    {kanbanColumns.map((column, columnIndex) => (
                        <div key={column} className="kanban-column-direcciones">
                            <div className={`column-header column-${columnIndex}`}>
                                <span className="column-title">{column}</span>
                                <span className="task-count">
                                    {getActividadesByColumn(columnIndex).length}
                                </span>
                            </div>
                            
                            <Droppable droppableId={columnIndex.toString()}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`task-list ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                                    >
                                        {getActividadesByColumn(columnIndex).map((actividad, index) => (
                                            <ActivityCard
                                                key={actividad.id}
                                                actividad={actividad}
                                                index={index}
                                                onSelect={() => setSelectedActivity(actividad)}
                                            />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {/* Modales */}
            {showCreateModal && (
                <CreateActivityModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={async (formData) => {
                        const success = await handleCreateActivity(formData);
                        if (success) {
                            setShowCreateModal(false);
                        }
                    }}
                    kpisDisponibles={kpisDisponibles} // <-- pasa como prop
                />
            )}

            {selectedActivity && (
                <ActivityDetailModal
                    actividad={selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                    onUpdate={fetchActividades}
                />
            )}
        </div>
    );
};

// Componente para las tarjetas de actividades
const ActivityCard = React.memo(({ actividad, index, onSelect }) => {
    const prioridad = prioridades.find(p => p.value === actividad.prioridad);
    const isOverdue = actividad.fecha_final && new Date(actividad.fecha_final) < new Date() && actividad.estado !== 'Terminado';

    return (
        <Draggable draggableId={actividad.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`activity-card ${snapshot.isDragging ? 'dragging' : ''} ${isOverdue ? 'overdue' : ''}`}
                    onClick={onSelect}
                >
                    <div className="activity-header">
                        <h4 className="activity-title">{actividad.nombre}</h4>
                        <div className="activity-badges">
                            <span 
                                className="priority-badge"
                                style={{ color: prioridad?.color }}
                            >
                                {prioridad?.icon}
                            </span>
                        </div>
                    </div>
                    
                    <div className="activity-meta">
                        <div className="assignee">
                            <FiUser size={12} />
                            <span>{actividad.asignado_a}</span>
                        </div>
                        
                        {actividad.fecha_final && (
                            <div className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                                <FiCalendar size={12} />
                                <span>{new Date(actividad.fecha_final).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                    
                    {actividad.subtareas_completadas !== undefined && (
                        <div className="progress-info">
                            <FiCheckSquare size={12} />
                            <span>{actividad.subtareas_completadas}/{actividad.total_subtareas} subtareas</span>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
});

// Modal para crear actividades
const CreateActivityModal = ({ onClose, onSubmit, kpisDisponibles }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        asignado_a: '',
        prioridad: 'Media',
        fecha_inicio: '',
        fecha_final: '',
        objetivo: '',
        impacto: '',
        alcance: '',
        areas_involucradas: [],
        recursos: '',
        kpi_relacionado: '',
        kpi_data: {}, // Nuevo campo
    });

    // Actualiza los campos de datos KPI según el KPI seleccionado
    const selectedKpi = kpisDisponibles.find(k => k.indicador === formData.kpi_relacionado);

    const renderKpiFields = () => {
        if (!selectedKpi) return null;
        // Ejemplo para los dos primeros KPIs de Inventario
        if (selectedKpi.indicador === "Exactitud de inventario") {
            return (
                <>
                    <div className="form-group">
                        <label>Unidades correctas</label>
                        <input
                            type="number"
                            value={formData.kpi_data.unidadesCorrectas || ''}
                            onChange={e => setFormData(prev => ({
                                ...prev,
                                kpi_data: { ...prev.kpi_data, unidadesCorrectas: Number(e.target.value) }
                            }))}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Unidades totales</label>
                        <input
                            type="number"
                            value={formData.kpi_data.unidadesTotales || ''}
                            onChange={e => setFormData(prev => ({
                                ...prev,
                                kpi_data: { ...prev.kpi_data, unidadesTotales: Number(e.target.value) }
                            }))}
                            required
                            className="form-input"
                        />
                    </div>
                </>
            );
        }
        if (selectedKpi.indicador === "Valor de ajustes") {
            return (
                <>
                    <div className="form-group">
                        <label>Valor de ajustes</label>
                        <input
                            type="number"
                            value={formData.kpi_data.valorAjustes || ''}
                            onChange={e => setFormData(prev => ({
                                ...prev,
                                kpi_data: { ...prev.kpi_data, valorAjustes: Number(e.target.value) }
                            }))}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Ventas totales</label>
                        <input
                            type="number"
                            value={formData.kpi_data.ventasTotales || ''}
                            onChange={e => setFormData(prev => ({
                                ...prev,
                                kpi_data: { ...prev.kpi_data, ventasTotales: Number(e.target.value) }
                            }))}
                            required
                            className="form-input"
                        />
                    </div>
                </>
            );
        }
        // ...agrega más campos según el KPI seleccionado...
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="modal-backdrop">
            <div className="create-activity-modal">
                <div className="modal-header">
                    <h3><FiPlus /> Crear Nueva Actividad</h3>
                    <button onClick={onClose} className="modal-close">
                        <FiX />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="activity-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nombre de la Actividad *</label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData(prev => ({...prev, nombre: e.target.value}))}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Asignado a (Email) *</label>
                            <input
                                type="email"
                                value={formData.asignado_a}
                                onChange={(e) => setFormData(prev => ({...prev, asignado_a: e.target.value}))}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Prioridad</label>
                            <select
                                value={formData.prioridad}
                                onChange={(e) => setFormData(prev => ({...prev, prioridad: e.target.value}))}
                                className="form-select"
                            >
                                {prioridades.map(p => (
                                    <option key={p.value} value={p.value}>
                                        {p.icon} {p.value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Fecha de Inicio</label>
                            <input
                                type="date"
                                value={formData.fecha_inicio}
                                onChange={(e) => setFormData(prev => ({...prev, fecha_inicio: e.target.value}))}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Fecha Final</label>
                            <input
                                type="date"
                                value={formData.fecha_final}
                                onChange={(e) => setFormData(prev => ({...prev, fecha_final: e.target.value}))}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Áreas Involucradas</label>
                            <select
                                multiple
                                value={formData.areas_involucradas}
                                onChange={(e) => {
                                    const values = Array.from(e.target.selectedOptions, option => option.value);
                                    setFormData(prev => ({...prev, areas_involucradas: values}));
                                }}
                                className="form-select"
                            >
                                {areas.map(area => (
                                    <option key={area.value} value={area.value}>
                                        {area.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>KPI relacionado *</label>
                            <select
                                value={formData.kpi_relacionado}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    kpi_relacionado: e.target.value,
                                    kpi_data: {} // Reset kpi_data al cambiar KPI
                                }))}
                                required
                                className="form-select"
                            >
                                <option value="">Selecciona un KPI</option>
                                {kpisDisponibles.map((kpi, idx) => (
                                    <option key={idx} value={kpi.indicador}>{kpi.indicador}</option>
                                ))}
                            </select>
                        </div>
                        {renderKpiFields()}
                    </div>

                    <div className="form-group">
                        <label>Objetivo de la Actividad</label>
                        <textarea
                            value={formData.objetivo}
                            onChange={(e) => setFormData(prev => ({...prev, objetivo: e.target.value}))}
                            className="form-textarea"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Impacto</label>
                        <textarea
                            value={formData.impacto}
                            onChange={(e) => setFormData(prev => ({...prev, impacto: e.target.value}))}
                            className="form-textarea"
                            rows="2"
                        />
                    </div>

                    <div className="form-group">
                        <label>Alcance</label>
                        <textarea
                            value={formData.alcance}
                            onChange={(e) => setFormData(prev => ({...prev, alcance: e.target.value}))}
                            className="form-textarea"
                            rows="2"
                        />
                    </div>

                    <div className="form-group">
                        <label>Recursos</label>
                        <textarea
                            value={formData.recursos}
                            onChange={(e) => setFormData(prev => ({...prev, recursos: e.target.value}))}
                            className="form-textarea"
                            rows="2"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            <FiSave /> Crear Actividad
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal para detalles de actividad
const ActivityDetailModal = ({ actividad, onClose, onUpdate }) => {
    const [activeDetailTab, setActiveDetailTab] = useState('vertodo');
    const [subtareas, setSubtareas] = useState([]);
    const [documentos, setDocumentos] = useState([]);
    const [comentarios, setComentarios] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estados para formularios
    const [newSubtarea, setNewSubtarea] = useState('');
    const [newComentario, setNewComentario] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchActivityDetails();
    }, [actividad.id]);

    const fetchActivityDetails = async () => {
        setLoading(true);
        try {
            // Subtareas
            const subtareasRes = await fetch(`${BACKEND_URL}/api/actividades-direccion/${actividad.id}/subtareas`);
            if (subtareasRes.ok) {
                const subtareasData = await subtareasRes.json();
                setSubtareas(subtareasData);
            }
            // Documentos
            const documentosRes = await fetch(`${BACKEND_URL}/api/actividades-direccion/${actividad.id}/documentos`);
            if (documentosRes.ok) {
                const documentosData = await documentosRes.json();
                setDocumentos(documentosData);
            }
            // Comentarios
            const comentariosRes = await fetch(`${BACKEND_URL}/api/actividades-direccion/${actividad.id}/comentarios`);
            if (comentariosRes.ok) {
                const comentariosData = await comentariosRes.json();
                setComentarios(comentariosData);
            }
        } catch (error) {
            toast.error('Error al cargar los detalles de la actividad');
        } finally {
            setLoading(false);
        }
    };

    // Crear subtarea
    const handleAddSubtarea = async () => {
        if (!newSubtarea.trim()) return;
        try {
            const response = await fetch(`${BACKEND_URL}/api/actividades-direccion/${actividad.id}/subtareas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo: newSubtarea, completada: false }),
            });
            if (response.ok) {
                const nuevaSubtarea = await response.json();
                setSubtareas(prev => [...prev, nuevaSubtarea]);
                setNewSubtarea('');
                toast.success('Subtarea agregada correctamente');
            } else {
                toast.error('Error al agregar subtarea');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    // Actualizar subtarea (toggle completada)
    const handleToggleSubtarea = async (subtareaId, completada) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/actividades-direccion/${actividad.id}/subtareas/${subtareaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completada: !completada }),
            });
            if (response.ok) {
                setSubtareas(prev =>
                    prev.map(sub =>
                        sub.id === subtareaId
                            ? { ...sub, completada: !completada }
                            : sub
                    )
                );
                toast.success('Subtarea actualizada');
            }
        } catch (error) {
            toast.error('Error al actualizar subtarea');
        }
    };

    // Eliminar subtarea
    const handleDeleteSubtarea = async (subtareaId) => {
        if (!window.confirm('¿Eliminar esta subtarea?')) return;
        try {
            const response = await fetch(`${BACKEND_URL}/api/actividades-direccion/${actividad.id}/subtareas/${subtareaId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setSubtareas(prev => prev.filter(sub => sub.id !== subtareaId));
                toast.success('Subtarea eliminada');
            } else {
                toast.error('Error al eliminar subtarea');
            }
        } catch (error) {
            toast.error('Error al eliminar subtarea');
        }
    };

    const handleUploadDocument = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('documento', selectedFile);
        formData.append('nombre', selectedFile.name);

        try {
            const response = await fetch(`${BACKEND_URL}/api/actividades-direccion/${actividad.id}/documentos`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const nuevoDocumento = await response.json();
                setDocumentos(prev => [...prev, nuevoDocumento]);
                setSelectedFile(null);
                toast.success('Documento subido correctamente');
            } else {
                toast.error('Error al subir documento');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión');
        }
    };

    const handleDeleteDocument = async (documentoId) => {
        if (!confirm('¿Eliminar este documento?')) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/actividades-direccion/${actividad.id}/documentos/${documentoId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setDocumentos(prev => prev.filter(doc => doc.id !== documentoId));
                toast.success('Documento eliminado');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al eliminar documento');
        }
    };

    const handleAddComentario = async () => {
        if (!newComentario.trim()) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/actividades-direccion/${actividad.id}/comentarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    contenido: newComentario,
                    autor: 'Usuario Actual' // Aquí deberías obtener el usuario actual
                }),
            });

            if (response.ok) {
                const nuevoComentario = await response.json();
                setComentarios(prev => [...prev, nuevoComentario]);
                setNewComentario('');
                toast.success('Comentario agregado');
            } else {
                toast.error('Error al agregar comentario');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión');
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="activity-detail-modal">
                <div className="modal-header">
                    <h3><FiEye /> {actividad.nombre}</h3>
                    <button onClick={onClose} className="modal-close">
                        <FiX />
                    </button>
                </div>

                <div className="detail-tabs">
                    <button 
                        className={activeDetailTab === 'vertodo' ? 'active' : ''}
                        onClick={() => setActiveDetailTab('vertodo')}
                    >
                        <FiEye /> Ver Todo
                    </button>
                    <button 
                        className={activeDetailTab === 'info' ? 'active' : ''}
                        onClick={() => setActiveDetailTab('info')}
                    >
                        <FiFileText /> Información
                    </button>
                    <button 
                        className={activeDetailTab === 'subtareas' ? 'active' : ''}
                        onClick={() => setActiveDetailTab('subtareas')}
                    >
                        <FiCheckSquare /> Subtareas ({subtareas.length})
                    </button>
                    <button 
                        className={activeDetailTab === 'documentos' ? 'active' : ''}
                        onClick={() => setActiveDetailTab('documentos')}
                    >
                        <FiFile /> Documentos ({documentos.length})
                    </button>
                    <button 
                        className={activeDetailTab === 'comentarios' ? 'active' : ''}
                        onClick={() => setActiveDetailTab('comentarios')}
                    >
                        <FiMessageSquare /> Comentarios ({comentarios.length})
                    </button>
                </div>

                <div className="detail-content">
                    {loading ? (
                        <div className="loading-spinner">Cargando...</div>
                    ) : (
                        <>
                            {activeDetailTab === 'vertodo' && (
                                <div className="view-all-content">
                                    {/* Información General */}
                                    <div className="section">
                                        <h4><FiFileText /> Información General</h4>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <label>Asignado a:</label>
                                                <p>{actividad.asignado_a}</p>
                                            </div>
                                            <div className="info-item">
                                                <label>Prioridad:</label>
                                                <p>{actividad.prioridad}</p>
                                            </div>
                                            <div className="info-item">
                                                <label>Estado:</label>
                                                <p>{actividad.estado}</p>
                                            </div>
                                            <div className="info-item">
                                                <label>Fecha Inicio:</label>
                                                <p>{actividad.fecha_inicio ? new Date(actividad.fecha_inicio).toLocaleDateString() : 'No definida'}</p>
                                            </div>
                                            <div className="info-item">
                                                <label>Fecha Final:</label>
                                                <p>{actividad.fecha_final ? new Date(actividad.fecha_final).toLocaleDateString() : 'No definida'}</p>
                                            </div>
                                            <div className="info-item full-width">
                                                <label>Objetivo:</label>
                                                <p>{actividad.objetivo || 'No especificado'}</p>
                                            </div>
                                            <div className="info-item full-width">
                                                <label>Impacto:</label>
                                                <p>{actividad.impacto || 'No especificado'}</p>
                                            </div>
                                            <div className="info-item full-width">
                                                <label>Alcance:</label>
                                                <p>{actividad.alcance || 'No especificado'}</p>
                                            </div>
                                            <div className="info-item full-width">
                                                <label>Recursos:</label>
                                                <p>{actividad.recursos || 'No especificado'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtareas */}
                                    <div className="section">
                                        <h4><FiCheckSquare /> Subtareas ({subtareas.length})</h4>
                                        {subtareas.length > 0 ? (
                                            <div className="subtareas-list">
                                                {subtareas.slice(0, 5).map((subtarea) => (
                                                    <div key={subtarea.id} className="subtarea-item-summary">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={subtarea.completada}
                                                            readOnly
                                                        />
                                                        <span className={subtarea.completada ? 'completed' : ''}>{subtarea.titulo}</span>
                                                    </div>
                                                ))}
                                                {subtareas.length > 5 && <p>... y {subtareas.length - 5} más</p>}
                                            </div>
                                        ) : (
                                            <p>No hay subtareas definidas</p>
                                        )}
                                    </div>

                                    {/* Documentos */}
                                    <div className="section">
                                        <h4><FiFile /> Documentos ({documentos.length})</h4>
                                        {documentos.length > 0 ? (
                                            <div className="documentos-list">
                                                {documentos.slice(0, 5).map((documento) => (
                                                    <div key={documento.id} className="documento-item-summary">
                                                        <FiFile />
                                                        <span>{documento.nombre}</span>
                                                    </div>
                                                ))}
                                                {documentos.length > 5 && <p>... y {documentos.length - 5} más</p>}
                                            </div>
                                        ) : (
                                            <p>No hay documentos adjuntos</p>
                                        )}
                                    </div>

                                    {/* Comentarios Recientes */}
                                    <div className="section">
                                        <h4><FiMessageSquare /> Comentarios Recientes ({comentarios.length})</h4>
                                        {comentarios.length > 0 ? (
                                            <div className="comentarios-list">
                                                {comentarios.slice(-3).map((comentario) => (
                                                    <div key={comentario.id} className="comentario-item-summary">
                                                        <strong>{comentario.autor}:</strong>
                                                        <p>{comentario.contenido.length > 100 ? comentario.contenido.substring(0, 100) + '...' : comentario.contenido}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>No hay comentarios</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeDetailTab === 'info' && (
                                <div className="activity-info">
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Objetivo:</label>
                                            <p>{actividad.objetivo}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Impacto:</label>
                                            <p>{actividad.impacto}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Alcance:</label>
                                            <p>{actividad.alcance}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Recursos:</label>
                                            <p>{actividad.recursos}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {activeDetailTab === 'subtareas' && (
                                <div className="subtareas-section">
                                    <div className="add-subtarea">
                                        <input
                                            type="text"
                                            placeholder="Nueva subtarea..."
                                            value={newSubtarea}
                                            onChange={(e) => setNewSubtarea(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddSubtarea()}
                                            className="form-input"
                                        />
                                        <button onClick={handleAddSubtarea} className="btn-primary">
                                            <FiPlus /> Agregar
                                        </button>
                                    </div>

                                    <div className="subtareas-list">
                                        {subtareas.map((subtarea) => (
                                            <div key={subtarea.id} className="subtarea-item">
                                                <input
                                                    type="checkbox"
                                                    checked={subtarea.completada}
                                                    onChange={() => handleToggleSubtarea(subtarea.id, subtarea.completada)}
                                                />
                                                <span className={subtarea.completada ? 'completed' : ''}>{subtarea.titulo}</span>
                                                <button
                                                    onClick={() => handleDeleteSubtarea(subtarea.id)}
                                                    className="btn-delete-small"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        ))}
                                        {subtareas.length === 0 && <p>No hay subtareas definidas</p>}
                                    </div>
                                </div>
                            )}
                            
                            {activeDetailTab === 'documentos' && (
                                <div className="documentos-section">
                                    <div className="upload-section">
                                        <input
                                            type="file"
                                            onChange={(e) => setSelectedFile(e.target.files[0])}
                                            className="form-input"
                                        />
                                        <button 
                                            onClick={handleUploadDocument} 
                                            disabled={!selectedFile}
                                            className="btn-primary"
                                        >
                                            <FiFile /> Subir Documento
                                        </button>
                                    </div>

                                    <div className="documentos-list">
                                        {documentos.map((documento) => (
                                            <div key={documento.id} className="documento-item">
                                                <FiFile />
                                                <span>{documento.nombre}</span>
                                                <div className="documento-actions">
                                                    <a 
                                                        href={`https://pitpougbnibmfrjykzet.supabase.co/storage/v1/object/public/documentos_actividades_indicore/${documento.archivo}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-view"
                                                    >
                                                        <FiEye />
                                                    </a>
                                                    <button 
                                                        onClick={() => handleDeleteDocument(documento.id)}
                                                        className="btn-delete-small"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {documentos.length === 0 && <p>No hay documentos adjuntos</p>}
                                    </div>
                                </div>
                            )}
                            
                            {activeDetailTab === 'comentarios' && (
                                <div className="comentarios-section">
                                    <div className="add-comentario">
                                        <textarea
                                            placeholder="Escribe un comentario..."
                                            value={newComentario}
                                            onChange={(e) => setNewComentario(e.target.value)}
                                            className="form-textarea"
                                            rows="3"
                                        />
                                        <button onClick={handleAddComentario} className="btn-primary">
                                            <FiMessageSquare /> Agregar Comentario
                                        </button>
                                    </div>

                                    <div className="comentarios-list">
                                        {comentarios.map((comentario) => (
                                            <div key={comentario.id} className="comentario-item">
                                                <div className="comentario-header">
                                                    <strong>{comentario.autor}</strong>
                                                    <span className="comentario-fecha">
                                                        {new Date(comentario.fecha_creacion).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p>{comentario.contenido}</p>
                                            </div>
                                        ))}
                                        {comentarios.length === 0 && <p>No hay comentarios aún</p>}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

ActivityCard.displayName = 'ActivityCard';
CreateActivityModal.displayName = 'CreateActivityModal';
ActivityDetailModal.displayName = 'ActivityDetailModal';

export default Actividades;
