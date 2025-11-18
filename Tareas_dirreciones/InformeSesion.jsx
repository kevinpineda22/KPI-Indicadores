// InformeSesion.jsx
import React, { useEffect, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './InformeSesion.css';

/**
 * Detección segura de BACKEND_BASE para KPIs:
 * 1) import.meta.env.VITE_BACKEND_KPI_URL (Vite) - variable específica para KPIs
 * 2) fallback: URL de producción de Vercel
 */
const resolveBackendBase = () => {
  // Vite env - variable específica para backend de KPIs
  try {
    // eslint-disable-next-line no-undef
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_KPI_URL) {
      return import.meta.env.VITE_BACKEND_KPI_URL;
    }
  } catch (e) {
    // ignore — import.meta not available in this environment
  }

  // fallback: usar backend de KPIs en producción de Vercel
  return 'https://backend-kpi-indicadores.vercel.app';
};

const BACKEND_BASE = resolveBackendBase();

const areaOptions = [
  'Inventario','Logística','Carnes','Suministros','Mantenimiento','Sistemas','Desarrollo'
];

function monthLabelFromYYYYMM(yyyymm) {
  const [y, m] = yyyymm.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
}

const InformeSesion = () => {
  const [area, setArea] = useState(areaOptions[0]);
  const [periodo, setPeriodo] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [informe, setInforme] = useState(null);
  const [loading, setLoading] = useState(false);
  const informeRef = useRef(null);

  const fetchInforme = async () => {
    if (!area || area === 'No definido') {
      alert('Seleccione un área válida.');
      return;
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodo)) {
      alert('Seleccione un periodo válido (mes).');
      return;
    }
    setLoading(true);
    try {
      const base = BACKEND_BASE || '';
      const url = `${base}/api/kpis/report/${encodeURIComponent(area)}/${encodeURIComponent(periodo)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Status ${res.status}`);
      setInforme(data.data);
    } catch (err) {
      console.error('Error al obtener informe:', err);
      alert('Error al obtener informe: ' + (err.message || 'ver consola'));
      setInforme(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Recargar informe automáticamente cuando cambia área o periodo
    fetchInforme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, periodo]);

  const handleDownloadPDF = async () => {
    const element = informeRef.current;
    if (!element || !informe) {
      alert('No hay informe para descargar');
      return;
    }
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(img);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
      pdf.addImage(img, 'PNG', 0, 0, pageWidth, pdfHeight);
      pdf.save(`Informe_${area}_${periodo}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar PDF: ' + (err.message || 'ver consola'));
    }
  };

  return (
    <div className="informe-sesion-container">
      <div className="informe-controls">
        <div className="informe-selectors-group">
          <div className="informe-selector-wrapper">
            <label className="informe-label">Área:</label>
            <select 
              value={area} 
              onChange={e => setArea(e.target.value)}
              className="informe-select"
            >
              {areaOptions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="informe-selector-wrapper">
            <label className="informe-label">Periodo:</label>
            <input 
              type="month" 
              value={periodo} 
              onChange={e => setPeriodo(e.target.value)}
              className="informe-input-month"
            />
          </div>
        </div>

        <div className="informe-actions">
          <button 
            onClick={fetchInforme} 
            disabled={loading}
            className="informe-btn informe-btn-generate"
          >
            {loading ? 'Cargando...' : 'Generar informe'}
          </button>

          <button 
            onClick={handleDownloadPDF} 
            disabled={!informe}
            className="informe-btn informe-btn-download"
          >
            Descargar PDF
          </button>
        </div>
      </div>

      <div ref={informeRef} className="informe-content">
        {!informe ? (
          <div className="informe-empty-state">
            <h3>No hay datos cargados</h3>
            <p>Haz clic en "Generar informe" para obtener los datos del mes seleccionado.</p>
          </div>
        ) : (
          <>
            <header className="informe-header">
              <h2 className="informe-title">Informe de Gestión Mensual — {area}</h2>
              <div className="informe-meta">
                <strong>Periodo:</strong> {monthLabelFromYYYYMM(informe.periodo)} &nbsp;|&nbsp;
                <strong>Generado:</strong> {new Date(informe.fecha_generado).toLocaleString()}
              </div>
            </header>

            <section className="informe-section">
              <h3 className="informe-section-title">I. Resumen Ejecutivo</h3>
              <p className="informe-resumen-text">{informe.resumen_ejecutivo}</p>
            </section>

            <section className="informe-section">
              <h3 className="informe-section-title">II. Indicadores clave (resumen)</h3>
              <table className="informe-table">
                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th>Meta</th>
                    <th>Resultado Mes</th>
                    <th>Resultado Acumulado</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {informe.indicadores.map((k, i) => {
                    const estado = k.porcentaje_cumplimiento !== null
                      ? (k.porcentaje_cumplimiento >= 100 ? '✅ Conforme' : (k.porcentaje_cumplimiento >= 70 ? '⚠️ Parcial' : '❌ Crítico'))
                      : '—';
                    return (
                      <tr key={i}>
                        <td>{k.indicador}</td>
                        <td>{k.meta ?? 'Variable'}</td>
                        <td>{k.resultado_mes}{k.unidad ?? ''}</td>
                        <td>{k.resultado_acumulado ?? '—'}</td>
                        <td>{estado}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            <section className="informe-section">
              <h3 className="informe-section-title">III. Análisis y observaciones</h3>
              <ul className="informe-list">
                <li>Total registros recibidos en el período: <strong>{informe.total_registros}</strong></li>
                <li>Total indicadores con datos: <strong>{informe.total_indicadores}</strong></li>
                <li>Cumplimiento promedio (indicadores con meta): <strong>{informe.cumplimiento_promedio_indicadores ?? 'N/A'}%</strong></li>
              </ul>
            </section>

            {informe.proyectos && informe.proyectos.length > 0 && (
              <section className="informe-section">
                <h3 className="informe-section-title">IV. Proyectos y estado</h3>
                <ul className="informe-list">
                  {informe.proyectos.map(p => (
                    <li key={p.id || p.nombre}><strong>{p.nombre}</strong> — {p.estado || 'Sin estado'} {p.observaciones ? `: ${p.observaciones}` : ''}</li>
                  ))}
                </ul>
              </section>
            )}

            {informe.plan_accion && informe.plan_accion.length > 0 && (
              <section className="informe-section">
                <h3 className="informe-section-title">V. Plan de acción (próximo mes)</h3>
                <table className="informe-table">
                  <thead>
                    <tr>
                      <th>Acción</th><th>Responsable</th><th>Fecha objetivo</th><th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {informe.plan_accion.map(a => (
                      <tr key={a.id}>
                        <td>{a.accion}</td>
                        <td>{a.responsable}</td>
                        <td>{a.fecha_objetivo}</td>
                        <td>{a.estado || 'Pendiente'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            <footer className="informe-footer">
              <div>Conclusión: revisión general y recomendaciones disponibles en el apartado de Plan de Acción.</div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default InformeSesion;
