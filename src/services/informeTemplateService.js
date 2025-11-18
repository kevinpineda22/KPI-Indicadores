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
      const templatePath = path.join(__dirname, '..', '..', 'Tareas_dirreciones', 'informes_modelos', `${fileName}.txt`);

      const templateContent = await fs.readFile(templatePath, 'utf-8');
      return {
        area,
        template: templateContent,
        secciones: this.parseSecciones(templateContent)
      };
    } catch (error) {
      console.error(`Error al leer plantilla para ${area}:`, error);
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
