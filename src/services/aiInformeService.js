// services/aiInformeService.js
import OpenAI from 'openai';

/**
 * Servicio para generar informes con IA
 */
const aiInformeService = {
  /**
   * Genera un informe profesional usando IA
   */
  async generarInformeConIA(area, periodo, plantilla, datosKpis) {
    try {
      // Verificar si hay API key configurada
      if (!process.env.OPENAI_API_KEY) {
        console.log('⚠️ OPENAI_API_KEY no configurada, usando plantilla estándar');
        return null;
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      // Preparar datos para el prompt
      const kpisResumen = (datosKpis.kpis || []).map(k => 
        `- ${k.label}: Meta ${k.meta || 'Variable'}, Resultado ${k.valor_mes || 'N/A'}${k.unidad || ''}, Estado: ${k.cumple_meta ? 'Cumple' : 'No cumple'}`
      ).join('\n');

      const analisisActual = (datosKpis.analisis || []).join('\n');

      const prompt = `Eres un analista experto en gestión empresarial. Genera un informe profesional y detallado basado en la siguiente información:

ÁREA: ${area}
PERIODO: ${periodo}

PLANTILLA DEL INFORME:
${plantilla}

DATOS REALES DE KPIs:
${kpisResumen}

ANÁLISIS PRELIMINAR:
${analisisActual}

PROYECTOS:
${(datosKpis.proyectos || []).map(p => `- ${p.nombre}: ${p.estado}`).join('\n')}

INSTRUCCIONES:
1. Sigue EXACTAMENTE la estructura de la plantilla proporcionada
2. Completa cada sección con análisis profesional y detallado
3. En "Resumen Ejecutivo", proporciona un análisis ejecutivo de 3-4 párrafos
4. En "Análisis de Resultados", profundiza en cada indicador con interpretación y contexto
5. Mantén un tono profesional y objetivo
6. Incluye recomendaciones específicas y accionables
7. Usa los emojis ✅ ⚠️ ❌ para indicar estados
8. Responde SOLO con el informe completo, sin introducción ni explicaciones adicionales

Genera el informe completo ahora:`;

      console.log('🤖 Generando informe con IA...');

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Modelo económico y rápido
        messages: [
          {
            role: "system",
            content: "Eres un analista empresarial experto que genera informes de gestión profesionales, detallados y accionables."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      });

      const informeGenerado = completion.choices[0].message.content;
      
      console.log('✅ Informe generado con IA exitosamente');

      return {
        contenido: informeGenerado,
        tokens_usados: completion.usage.total_tokens,
        modelo: completion.model
      };

    } catch (error) {
      console.error('❌ Error generando informe con IA:', error.message);
      return null;
    }
  },

  /**
   * Genera resumen ejecutivo inteligente
   */
  async generarResumenEjecutivo(area, datosKpis) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return null;
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const kpisTexto = (datosKpis.kpis || []).map(k => 
        `${k.label}: ${k.valor_mes}${k.unidad || ''} (Meta: ${k.meta || 'N/A'})`
      ).join(', ');

      const prompt = `Genera un resumen ejecutivo profesional (máximo 150 palabras) para el área de ${area} basado en estos KPIs: ${kpisTexto}. Incluye: estado general, logros principales y áreas de mejora.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      });

      return completion.choices[0].message.content;

    } catch (error) {
      console.error('Error en resumen ejecutivo IA:', error.message);
      return null;
    }
  }
};

export default aiInformeService;
