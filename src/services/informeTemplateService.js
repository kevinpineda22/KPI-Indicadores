// services/informeTemplateService.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Servicio para gestionar plantillas de informes por área
 */
const informeTemplateService = {
  /**
   * Obtiene la plantilla de informe para un área específica
   */
  async getTemplate(area) {
    try {
      // Normalizar nombre del área (sin tildes para nombre de archivo)
      const areaMap = {
        'Logística': 'Logistica',
        'Inventario': 'Inventario',
        'Desarrollo': 'Desarrollo',
        'Carnes': 'Carnes',
        'Suministros': 'Suministros',
        'Mantenimiento': 'Mantenimiento',
        'Sistemas': 'Sistemas'
      };

      const fileName = areaMap[area] || area;
      const templatePath = path.join(__dirname, '..', '..', 'informes_modelos', `${fileName}.txt`);

      console.log('🔍 Buscando plantilla para área:', area);
      console.log('📁 Ruta completa:', templatePath);

      const templateContent = await fs.readFile(templatePath, 'utf-8');
      
      console.log('✅ Plantilla cargada exitosamente, tamaño:', templateContent.length, 'caracteres');

      return {
        area,
        template: templateContent,
        secciones: this.parseSecciones(templateContent)
      };
    } catch (error) {
      console.error(`❌ Error al leer plantilla para ${area}:`, error.message);
      // Si no hay plantilla, devolver estructura genérica
      return {
        area,
        template: null,
        secciones: this.getDefaultSecciones()
      };
    }
  },

  /**
   * Extrae las secciones principales de la plantilla
   */
  parseSecciones(template) {
    const secciones = [];
    const lines = template.split('\n');
    let currentSection = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      // Detectar encabezados de sección (I., II., III., etc.)
      if (/^[IVX]+\.\s/.test(trimmed)) {
        if (currentSection) {
          secciones.push(currentSection);
        }
        currentSection = {
          titulo: trimmed,
          contenido: []
        };
      } else if (currentSection && trimmed) {
        currentSection.contenido.push(trimmed);
      }
    });

    if (currentSection) {
      secciones.push(currentSection);
    }

    return secciones;
  },

  /**
   * Extrae los indicadores esperados de la plantilla
   */
  extractIndicadoresEsperados(template) {
    const indicadores = [];
    const lines = template.split('\n');
    let inKpiSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detectar sección de KPIs
      if (line.includes('Indicadores Clave') || line.includes('KPIs')) {
        inKpiSection = true;
        continue;
      }

      // Salir de la sección de KPIs
      if (inKpiSection && /^III\.|^IV\./.test(line)) {
        break;
      }

      // Extraer nombre de indicador (líneas que no son headers de tabla)
      if (inKpiSection && line && 
          !line.includes('Indicador') && 
          !line.includes('Meta') && 
          !line.includes('Resultado') &&
          !line.includes('Estado') &&
          !line.includes('≥') && 
          !line.includes('≤') &&
          line.length > 3) {
        
        // Buscar la meta en las líneas siguientes o en la misma línea
        let meta = null;
        for (let j = i; j < Math.min(i + 3, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine.match(/[≥≤<>]\s*[\d.]+/)) {
            meta = nextLine.match(/[≥≤<>]\s*[\d.]+/)[0];
            break;
          }
        }

        indicadores.push({
          nombre: line,
          meta: meta
        });
      }
    }

    return indicadores;
  },

  /**
   * Genera el informe completo usando la plantilla y los datos
   */
  async generarInformeConPlantilla(area, periodo, datosKpis) {
    console.log('📝 Generando informe con plantilla para:', area, 'Periodo:', periodo);
    
    const templateInfo = await this.getTemplate(area);
    
    console.log('🔧 Tiene plantilla:', !!templateInfo.template);
    
    if (!templateInfo.template) {
      console.log('⚠️ No hay plantilla, usando informe genérico');
      // Si no hay plantilla, devolver estructura genérica
      return this.generarInformeGenerico(area, periodo, datosKpis);
    }

    console.log('✨ Aplicando plantilla personalizada');

    // Parsear el periodo para obtener mes y año legible
    const [year, month] = periodo.split('-');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const periodoLegible = `${meses[parseInt(month) - 1]} de ${year}`;
    const fechaCorte = new Date().toLocaleDateString('es-CO', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });

    // Construir el informe siguiendo la estructura de la plantilla
    let informe = templateInfo.template;

    // Reemplazar campos dinámicos
    informe = informe.replace(/Fecha de corte: ____________________________/g, 
                              `Fecha de corte: ${fechaCorte}`);
    informe = informe.replace(/ÁREA DE .+/g, `ÁREA DE ${area.toUpperCase()}`);
    
    // Construir la tabla de KPIs
    const tablaKpis = this.construirTablaKpis(datosKpis.kpis);
    
    // Insertar la tabla en la sección II
    informe = this.insertarTablaKpis(informe, tablaKpis);

    // Añadir análisis
    if (datosKpis.analisis && datosKpis.analisis.length > 0) {
      const analisisTexto = datosKpis.analisis.map(a => `• ${a}`).join('\n');
      informe = this.insertarAnalisis(informe, analisisTexto);
    }

    // Añadir proyectos
    if (datosKpis.proyectos && datosKpis.proyectos.length > 0) {
      const proyectosTexto = this.construirTablaProyectos(datosKpis.proyectos);
      informe = this.insertarProyectos(informe, proyectosTexto);
    }

    // Añadir plan de acción
    if (datosKpis.plan_accion && datosKpis.plan_accion.length > 0) {
      const planTexto = this.construirTablaPlanAccion(datosKpis.plan_accion);
      informe = this.insertarPlanAccion(informe, planTexto);
    }

    return {
      plantilla_aplicada: true,
      contenido_completo: informe,
      periodo: periodoLegible,
      area: area
    };
  },

  construirTablaKpis(kpis) {
    if (!kpis || kpis.length === 0) {
      return 'No hay indicadores registrados para este período.';
    }

    let tabla = '\n';
    kpis.forEach(k => {
      const estado = k.cumple_meta !== null 
        ? (k.cumple_meta ? '✅ Conforme' : '❌ No cumple')
        : '—';
      
      tabla += `${k.label || k.id}\n`;
      tabla += `Meta: ${k.meta !== null ? k.meta + (k.unidad || '') : 'Variable'}\n`;
      tabla += `Resultado Mes: ${k.valor_mes !== null ? k.valor_mes + (k.unidad || '') : '—'}\n`;
      tabla += `Resultado Acumulado: ${k.valor_acumulado !== null ? k.valor_acumulado.toFixed(2) + (k.unidad || '') : '—'}\n`;
      tabla += `Estado: ${estado}\n\n`;
    });

    return tabla;
  },

  construirTablaProyectos(proyectos) {
    let tabla = '\n';
    proyectos.forEach(p => {
      tabla += `• ${p.nombre} - ${p.estado || 'Sin estado'}\n`;
      if (p.observaciones) {
        tabla += `  ${p.observaciones}\n`;
      }
      tabla += '\n';
    });
    return tabla;
  },

  construirTablaPlanAccion(acciones) {
    let tabla = '\n';
    acciones.forEach(a => {
      tabla += `• ${a.accion}\n`;
      tabla += `  Responsable: ${a.responsable || 'No asignado'}\n`;
      tabla += `  Fecha objetivo: ${a.fecha_objetivo || 'No definida'}\n`;
      tabla += `  Estado: ${a.estado || 'Pendiente'}\n\n`;
    });
    return tabla;
  },

  insertarTablaKpis(informe, tabla) {
    // Buscar la sección II y añadir la tabla después
    const regex = /(II\.\s*Indicadores Clave[^\n]*\n)/i;
    return informe.replace(regex, `$1\n${tabla}\n`);
  },

  insertarAnalisis(informe, analisis) {
    const regex = /(III\.\s*Análisis[^\n]*\n)/i;
    return informe.replace(regex, `$1\n${analisis}\n\n`);
  },

  insertarProyectos(informe, proyectos) {
    const regex = /(IV\.\s*Proyectos[^\n]*\n)/i;
    return informe.replace(regex, `$1\n${proyectos}\n`);
  },

  insertarPlanAccion(informe, plan) {
    const regex = /(VI\.\s*Plan de Acción[^\n]*\n)/i;
    return informe.replace(regex, `$1\n${plan}\n`);
  },

  generarInformeGenerico(area, periodo, datosKpis) {
    return {
      plantilla_aplicada: false,
      contenido_completo: datosKpis.analisis ? datosKpis.analisis.join('\n\n') : '',
      periodo: periodo,
      area: area
    };
  },

  /**
   * Secciones por defecto si no hay plantilla
   */
  getDefaultSecciones() {
    return [
      { titulo: 'I. Resumen Ejecutivo', contenido: [] },
      { titulo: 'II. Indicadores Clave de Desempeño (KPIs)', contenido: [] },
      { titulo: 'III. Análisis de Resultados', contenido: [] },
      { titulo: 'IV. Proyectos y Acciones Ejecutadas', contenido: [] },
      { titulo: 'V. Retos o Riesgos del Mes', contenido: [] },
      { titulo: 'VI. Plan de Acción Próximo Mes', contenido: [] },
      { titulo: 'VII. Conclusión', contenido: [] }
    ];
  }
};

export default informeTemplateService;
