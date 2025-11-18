// InformeSesion.jsx
import React, { useEffect, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Detección segura de BACKEND_BASE:
 * 1) window.__BACKEND_URL__  (inyección runtime desde index.html)
 * 2) process.env.REACT_APP_BACKEND_URL (CRA)
 * 3) import.meta.env.VITE_BACKEND_URL (Vite) -> se intenta con try/catch
 * 4) fallback: ''
 */
const resolveBackendBase = () => {
  // 1) runtime injection from index.html
  if (typeof window !== 'undefined' && window.__BACKEND_URL__) {
    return window.__BACKEND_URL__;
  }

  // 2) Create React App env
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }

  // 3) Vite env (try/catch to avoid parser/runtime issues where import.meta is unsupported)
  try {
    // eslint-disable-next-line no-undef
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) {
      return import.meta.env.VITE_BACKEND_URL;
    }
  } catch (e) {
    // ignore — import.meta not available in this environment
  }

  // fallback
  return '';
};

const BACKEND_BASE = resolveBackendBase();

const areaOptions = [
  'Inventario','Logistica','Carnes','Suministros','Mantenimiento','Sistemas','Desarrollo'
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
    // cargar informe inicial automáticamente al montar
    fetchInforme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div style={{ maxWidth: 980, margin: '24px auto', fontFamily: 'Segoe UI, Arial, sans-serif', color: '#210d65' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <label>Área:</label>
        <select value={area} onChange={e => setArea(e.target.value)}>
          {areaOptions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <label>Periodo:</label>
        <input type="month" value={periodo} onChange={e => setPeriodo(e.target.value)} />

        <button onClick={fetchInforme} disabled={loading} style={{ background: '#210d65', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6 }}>
          {loading ? 'Cargando...' : 'Generar informe'}
        </button>

        <button onClick={handleDownloadPDF} disabled={!informe} style={{ background: '#4b5563', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6 }}>
          Descargar PDF
        </button>
      </div>

      <div ref={informeRef} style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
        {!informe ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            <h3>No hay datos cargados</h3>
            <p>Haz clic en "Generar informe" para obtener los datos del mes seleccionado.</p>
          </div>
        ) : (
          <>
            <header style={{ borderBottom: '1px solid #eee', paddingBottom: 12, marginBottom: 12 }}>
              <h2 style={{ color: '#210d65' }}>Informe de Gestión Mensual — {area}</h2>
              <div style={{ color: '#444' }}>
                <strong>Periodo:</strong> {monthLabelFromYYYYMM(informe.periodo)} &nbsp;|&nbsp;
                <strong>Generado:</strong> {new Date(informe.fecha_generado).toLocaleString()}
              </div>
            </header>

            <section>
              <h3>I. Resumen Ejecutivo</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{informe.resumen_ejecutivo}</p>
            </section>

            <section style={{ marginTop: 12 }}>
              <h3>II. Indicadores clave (resumen)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f3f3', textAlign: 'left' }}>
                    <th style={{ padding: 8 }}>Indicador</th>
                    <th style={{ padding: 8 }}>Meta</th>
                    <th style={{ padding: 8 }}>Resultado Mes</th>
                    <th style={{ padding: 8 }}>Resultado Acumulado</th>
                    <th style={{ padding: 8 }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {informe.indicadores.map((k, i) => {
                    const estado = k.porcentaje_cumplimiento !== null
                      ? (k.porcentaje_cumplimiento >= 100 ? '✅ Conforme' : (k.porcentaje_cumplimiento >= 70 ? '⚠️ Parcial' : '❌ Crítico'))
                      : '—';
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: 8 }}>{k.indicador}</td>
                        <td style={{ padding: 8 }}>{k.meta ?? 'Variable'}</td>
                        <td style={{ padding: 8 }}>{k.resultado_mes}{k.unidad ?? ''}</td>
                        <td style={{ padding: 8 }}>{k.resultado_acumulado ?? '—'}</td>
                        <td style={{ padding: 8 }}>{estado}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            <section style={{ marginTop: 12 }}>
              <h3>III. Análisis y observaciones</h3>
              <ul>
                <li>Total registros recibidos en el período: <strong>{informe.total_registros}</strong></li>
                <li>Total indicadores con datos: <strong>{informe.total_indicadores}</strong></li>
                <li>Cumplimiento promedio (indicadores con meta): <strong>{informe.cumplimiento_promedio_indicadores ?? 'N/A'}%</strong></li>
              </ul>
            </section>

            {informe.proyectos && informe.proyectos.length > 0 && (
              <section style={{ marginTop: 12 }}>
                <h3>IV. Proyectos y estado</h3>
                <ul>
                  {informe.proyectos.map(p => (
                    <li key={p.id || p.nombre}><strong>{p.nombre}</strong> — {p.estado || 'Sin estado'} {p.observaciones ? `: ${p.observaciones}` : ''}</li>
                  ))}
                </ul>
              </section>
            )}

            {informe.plan_accion && informe.plan_accion.length > 0 && (
              <section style={{ marginTop: 12 }}>
                <h3>V. Plan de acción (próximo mes)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f3f3f3' }}>
                      <th style={{ padding: 8 }}>Acción</th><th style={{ padding: 8 }}>Responsable</th><th style={{ padding: 8 }}>Fecha objetivo</th><th style={{ padding: 8 }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {informe.plan_accion.map(a => (
                      <tr key={a.id}>
                        <td style={{ padding: 8 }}>{a.accion}</td>
                        <td style={{ padding: 8 }}>{a.responsable}</td>
                        <td style={{ padding: 8 }}>{a.fecha_objetivo}</td>
                        <td style={{ padding: 8 }}>{a.estado || 'Pendiente'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            <footer style={{ marginTop: 16, borderTop: '1px dashed #eee', paddingTop: 12, color: '#666' }}>
              <div>Conclusión: revisión general y recomendaciones disponibles en el apartado de Plan de Acción.</div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default InformeSesion;
