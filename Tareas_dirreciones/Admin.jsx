import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
    FiActivity, FiBell, FiBarChart, FiTarget, FiFileText, 
    FiCalendar, FiDatabase, FiTrendingUp, FiFlag, FiUsers
} from 'react-icons/fi';
import { Actividades } from './components/Actividades';
import { Proceso } from './components/Proceso';
import InformeSesion from './InformeSesion';
import './Admin.css';

const BACKEND_URL = 'https://backend-kpi-indicadores.vercel.app';

const direcciones = [
    { value: 'operaciones', label: 'Operaciones' },
    { value: 'gestion_humana', label: 'Gestión Humana' },
    { value: 'contabilidad', label: 'Contabilidad' },
    { value: 'sistemas', label: 'Sistemas' },
    { value: 'desarrollo', label: 'Desarrollo' }
];

const areas = [
    { value: 'Inventario', label: 'Inventario' },
    { value: 'Logística', label: 'Logística' },
    { value: 'Carnes', label: 'Carnes' },
    { value: 'Suministros', label: 'Suministros' },
    { value: 'Mantenimiento', label: 'Mantenimiento' },
    { value: 'Sistemas', label: 'Sistemas' },
    { value: 'Desarrollo', label: 'Desarrollo' }
];

const prioridades = [
    { value: 'Alta', color: '#dc3545', icon: 'Red' },
    { value: 'Media', color: '#f59e0b', icon: 'Yellow' },
    { value: 'Baja', color: '#10b981', icon: 'Green' }
];

const informeAreas = [
    { value: 'Inventario', label: 'Inventario' },
    { value: 'Logística', label: 'Logística' },
    { value: 'Carnes', label: 'Carnes' },
    { value: 'Suministros', label: 'Suministros' },
    { value: 'Mantenimiento', label: 'Mantenimiento' },
    { value: 'Sistemas', label: 'Sistemas' },
    { value: 'Desarrollo', label: 'Desarrollo' }
];

const getSessionUser = () => {
    const empleado = JSON.parse(localStorage.getItem("empleado_info") || "{}");
    return {
        email: empleado.email || "",
        rol: empleado.rol || "area",
        direccion: empleado.direccion || "",
        area: empleado.area || ""
    };
};

export const AdminDirecciones = () => {
    const sessionUser = getSessionUser();

    // DATOS DEL USUARIO: 100% sincronizados con Acceso.jsx
    const correoUsuario = localStorage.getItem("correo_empleado") || "No definido";
    const empleado = JSON.parse(localStorage.getItem("empleado_info") || "{}");
    const userDireccion = empleado.area || "No definida"; // Dirección = empleado.area
    const userArea = localStorage.getItem("userProceso") || "No definido"; // Área = profileData.proceso

    const [selectedDirection, setSelectedDirection] = useState(sessionUser.direccion || userDireccion);
    const [selectedArea, setSelectedArea] = useState(sessionUser.area || userArea);
    const [activeTab, setActiveTab] = useState('actividades');
    const [loading, setLoading] = useState(false);
    const [indicadoresGenerales, setIndicadoresGenerales] = useState({
        totalActividades: 0,
        actividadesCompletadas: 0,
        actividadesPendientes: 0,
        actividadesPorPrioridad: { Alta: 0, Media: 0, Baja: 0 }
    });
    // Estado para el periodo mensual del informe
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    // Genera el periodo en formato "mes de año" para InformeSesion
    const getPeriodo = () => {
        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        return `${meses[selectedMonth]} de ${selectedYear}`;
    };

   const tabs = [
        { id: 'actividades', label: 'GESTIÓN DE ACTIVIDADES', icon: FiActivity },
        {id: 'gestion_proceso', label: 'GESTIÓN DEL PROCESO', icon: FiFlag},
        { id: 'novedades', label: 'NOVEDADES', icon: FiBell },
        { id: 'indicadores', label: 'TABLERO INDICADORES ', icon: FiBarChart },
        { id: 'plan_estrategico', label: 'PLAN ESTRATÉGICO', icon: FiTarget },
        { id: 'informe_sesion', label: 'INFORME DE GESTIÓN ', icon: FiFileText },
        { id: 'cronograma', label: 'CRONOGRAMA', icon: FiCalendar },
        { id: 'datos', label: 'DATOS', icon: FiDatabase },
        { id: 'proceso', label: 'KPIs POR PROCESO', icon: FiFlag }
    ];

    const isGerencia = sessionUser.rol === 'gerencia';
    const isLiderDireccion = sessionUser.rol === 'lider';
    const isArea = sessionUser.rol === 'area';

    useEffect(() => {
        if (activeTab === 'indicadores') {
            fetchIndicadoresGenerales();
        }
    }, [activeTab, selectedDirection, selectedArea]);

    const fetchIndicadoresGenerales = async () => {
        setLoading(true);
        try {
            let url = `${BACKEND_URL}/api/indicadores-direccion/${selectedDirection}`;
            if (selectedArea && selectedArea !== 'lider' && selectedArea !== 'gerencia') {
                url += `?area=${selectedArea}`;
            }
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setIndicadoresGenerales(data);
            }
        } catch (error) {
            console.error('Error al cargar indicadores:', error);
            toast.error('Error al cargar los indicadores');
        } finally {
            setLoading(false);
        }
    };

    const renderIndicadores = () => (
        <div className="indicadores-container">
            <h3>Tablero de Indicadores</h3>
            <div className="indicadores-grid">
                <div className="indicator-card">
                    <div className="indicator-header">
                        <FiTrendingUp />
                        <h4>Productividad General</h4>
                    </div>
                    <div className="indicator-value">
                        {indicadoresGenerales.actividadesCompletadas > 0 
                            ? Math.round((indicadoresGenerales.actividadesCompletadas / indicadoresGenerales.totalActividades) * 100)
                            : 0
                        }%
                    </div>
                    <div className="indicator-description">
                        Porcentaje de actividades completadas
                    </div>
                </div>

                <div className="indicator-card">
                    <div className="indicator-header">
                        <FiBarChart />
                        <h4>Distribución por Prioridad</h4>
                    </div>
                    <div className="priority-chart">
                        {prioridades.map(p => (
                            <div key={p.value} className="priority-item">
                                <span style={{ color: p.color }}>{p.icon}</span>
                                <span>{p.value}: {indicadoresGenerales.actividadesPorPrioridad[p.value]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="indicator-card">
                    <div className="indicator-header">
                        <FiUsers />
                        <h4>Carga de Trabajo</h4>
                    </div>
                    <div className="workload-info">
                        <p>Actividades activas: {indicadoresGenerales.actividadesPendientes}</p>
                        <p>Promedio por área: {Math.round(indicadoresGenerales.totalActividades / areas.length)}</p>
                    </div>
                </div>

                <div className="indicator-card">
                    <div className="indicator-header">
                        <FiCalendar />
                        <h4>Cumplimiento Temporal</h4>
                    </div>
                    <div className="temporal-info">
                        <p>A tiempo: 85%</p>
                        <p>Con retraso: 15%</p>
                        <p>Tiempo promedio: 5 días</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPlaceholder = (tabName) => (
        <div className="placeholder-content">
            <h3>{tabs.find(t => t.id === tabName)?.label}</h3>
            <p>Esta funcionalidad estará disponible próximamente.</p>
        </div>
    );

    return (
        <div className="admin-direcciones-container">
            {/* INFORMACIÓN DE USUARIO: 100% igual que Acceso.jsx */}
            <div className="acc-user-info-container">
                <p className="acc-panel-user-info">
                    <span className="acc-user-label">Sesión:</span> {correoUsuario} |{" "}
                    <span className="acc-user-label">Dirección:</span> {userDireccion} |{" "}
                    <span className="acc-user-label">Área:</span> {userArea}
                </p>
            </div>

            <div className="admin-selectors">
                {isGerencia && (
                    <select
                        value={selectedDirection}
                        onChange={e => setSelectedDirection(e.target.value)}
                        className="selector-direccion"
                    >
                        {direcciones.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                )}
                {(isGerencia || isLiderDireccion) && activeTab !== 'informe_sesion' && (
                    <select
                        value={selectedArea}
                        onChange={e => setSelectedArea(e.target.value)}
                        className="selector-area"
                    >
                        <option value="">Todas las áreas</option>
                        {informeAreas.map(a => (
                            <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className="admin-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="admin-content">
                {loading && <div className="loading-spinner">Cargando...</div>}
                {activeTab === 'actividades' && (
                    <Actividades 
                        userDirection={userDireccion}
                        userArea={userArea}
                        direcciones={direcciones}
                        areas={areas}
                        rol={sessionUser.rol}
                        areaLabel={userArea}
                        correoUsuario={correoUsuario}
                    />
                )}
                {activeTab === 'indicadores' && renderIndicadores()}
                {activeTab === 'proceso' && <Proceso />}
                {activeTab === 'novedades' && renderPlaceholder('novedades')}
                {activeTab === 'plan_estrategico' && renderPlaceholder('plan_estrategico')}
                {activeTab === 'informe_sesion' && <InformeSesion />}
                {activeTab === 'cronograma' && renderPlaceholder('cronograma')}
                {activeTab === 'datos' && renderPlaceholder('datos')}
            </div>
        </div>
    );
};

export default AdminDirecciones;