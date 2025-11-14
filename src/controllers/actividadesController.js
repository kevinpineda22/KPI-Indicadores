import actividadesService from '../services/actividadesService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { supabaseAdmin } from '../config/database.js';

const actividadesController = {
  // GET /api/actividades-direccion/:direccion
  getActividadesByDireccion: asyncHandler(async (req, res) => {
    const { direccion } = req.params;
    const actividades = await actividadesService.getByDireccion(direccion);
    
    res.json(actividades);
  }),

  // POST /api/actividades-direccion
  createActividad: asyncHandler(async (req, res) => {
    // Log para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Creating actividad with data:', JSON.stringify(req.body, null, 2));
    }

    // Procesar datos antes de enviar al servicio
    const actividadData = {
      ...req.body,
      // Asegurar que las fechas vacías sean null
      fecha_inicio: req.body.fecha_inicio || null,
      fecha_final: req.body.fecha_final || null,
      // Asegurar que areas_involucradas sea un array
      areas_involucradas: Array.isArray(req.body.areas_involucradas) 
        ? req.body.areas_involucradas 
        : []
    };

    const actividad = await actividadesService.create(actividadData);
    
    res.status(201).json({
      success: true,
      message: 'Actividad creada exitosamente',
      data: actividad
    });
  }),

  // PUT /api/actividades-direccion/:id
  updateActividad: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const actividad = await actividadesService.update(id, req.body);
    
    res.json({
      success: true,
      message: 'Actividad actualizada exitosamente',
      data: actividad
    });
  }),

  // PUT /api/actividades-direccion/:id/estado
  updateEstadoActividad: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado || !['Por Hacer', 'En Curso', 'Revisión', 'Terminado'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }
    
    const actividad = await actividadesService.updateEstado(id, estado);
    
    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: actividad
    });
  }),

  // DELETE /api/actividades-direccion/:id
  deleteActividad: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await actividadesService.delete(id);
    
    res.json({
      success: true,
      message: 'Actividad eliminada exitosamente'
    });
  }),

  // GET /api/actividades-direccion/:id/details
  getActividadDetails: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const actividad = await actividadesService.getDetails(id);
    
    res.json(actividad);
  }),

  // SUBTAREAS
  getSubtareas: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('actividades_direccion')
      .select('subtareas')
      .eq('id', id)
      .single();
    if (error) throw error;
    res.json(data?.subtareas || []);
  }),

  createSubtarea: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { titulo, completada } = req.body;
    // Obtener actividad
    const { data: actividad, error } = await supabaseAdmin
      .from('actividades_direccion')
      .select('subtareas')
      .eq('id', id)
      .single();
    if (error) throw error;
    const subtareas = actividad.subtareas || [];
    const nuevaSubtarea = { id: Date.now(), titulo, completada: !!completada };
    subtareas.push(nuevaSubtarea);
    // Actualizar actividad
    const { error: updateError } = await supabaseAdmin
      .from('actividades_direccion')
      .update({ subtareas })
      .eq('id', id);
    if (updateError) throw updateError;
    res.status(201).json(nuevaSubtarea);
  }),

  updateSubtarea: asyncHandler(async (req, res) => {
    const { subtareaId } = req.params;
    const { completada } = req.body;
    // Obtener todas las actividades
    const { data: actividades, error } = await supabaseAdmin
      .from('actividades_direccion')
      .select('subtareas')
      .ilike('subtareas', `%${subtareaId}%`);
    if (error) throw error;
    // Actualizar la subtarea en cada actividad
    const updates = actividades.map(async (actividad) => {
      const subtareas = actividad.subtareas || [];
      const subtareaIndex = subtareas.findIndex(s => s.id === parseInt(subtareaId));
      if (subtareaIndex === -1) return null; // Subtarea no encontrada en esta actividad
      subtareas[subtareaIndex].completada = !!completada;
      // Actualizar actividad
      const { error: updateError } = await supabaseAdmin
        .from('actividades_direccion')
        .update({ subtareas })
        .eq('id', actividad.id);
      if (updateError) throw updateError;
      return subtareas[subtareaIndex];
    });
    const updatedSubtareas = await Promise.all(updates);
    res.json(updatedSubtareas.filter(s => s !== null));
  }),

  deleteSubtarea: asyncHandler(async (req, res) => {
    const { subtareaId } = req.params;
    // Obtener todas las actividades
    const { data: actividades, error } = await supabaseAdmin
      .from('actividades_direccion')
      .select('subtareas')
      .ilike('subtareas', `%${subtareaId}%`);
    if (error) throw error;
    // Eliminar la subtarea de cada actividad
    const updates = actividades.map(async (actividad) => {
      const subtareas = actividad.subtareas || [];
      const newSubtareas = subtareas.filter(s => s.id !== parseInt(subtareaId));
      // Actualizar actividad
      const { error: updateError } = await supabaseAdmin
        .from('actividades_direccion')
        .update({ subtareas: newSubtareas })
        .eq('id', actividad.id);
      if (updateError) throw updateError;
    });
    await Promise.all(updates);
    res.json({ success: true });
  }),

  // DOCUMENTOS
  getDocumentos: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('actividades_direccion')
      .select('documentos')
      .eq('id', id)
      .single();
    if (error) throw error;
    res.json(data?.documentos || []);
  }),

  createDocumento: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nombre, archivo } = req.body;
    // Obtener actividad
    const { data: actividad, error } = await supabaseAdmin
      .from('actividades_direccion')
      .select('documentos')
      .eq('id', id)
      .single();
    if (error) throw error;
    const documentos = actividad.documentos || [];
    const nuevoDocumento = { id: Date.now(), nombre, archivo };
    documentos.push(nuevoDocumento);
    // Actualizar actividad
    const { error: updateError } = await supabaseAdmin
      .from('actividades_direccion')
      .update({ documentos })
      .eq('id', id);
    if (updateError) throw updateError;
    res.status(201).json(nuevoDocumento);
  }),

  deleteDocumento: asyncHandler(async (req, res) => {
    const { id, documentoId } = req.params;
    // Obtener actividad
    const { data: actividad, error } = await supabaseAdmin
      .from('actividades_direccion')
      .select('documentos')
      .eq('id', id)
      .single();
    if (error) throw error;
    const documentos = actividad.documentos || [];
    const newDocumentos = documentos.filter(doc => doc.id !== parseInt(documentoId));
    // Actualizar actividad
    const { error: updateError } = await supabaseAdmin
      .from('actividades_direccion')
      .update({ documentos: newDocumentos })
      .eq('id', id);
    if (updateError) throw updateError;
    res.json({ success: true });
  }),

  // COMENTARIOS
  getComentarios: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('actividades_direccion')
      .select('comentarios')
      .eq('id', id)
      .single();
    if (error) throw error;
    res.json(data?.comentarios || []);
  }),

  createComentario: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { contenido, autor } = req.body;
    // Obtener actividad
    const { data: actividad, error } = await supabaseAdmin
      .from('actividades_direccion')
      .select('comentarios')
      .eq('id', id)
      .single();
    if (error) throw error;
    const comentarios = actividad.comentarios || [];
    const nuevoComentario = { id: Date.now(), contenido, autor, fecha_creacion: new Date().toISOString() };
    comentarios.push(nuevoComentario);
    // Actualizar actividad
    const { error: updateError } = await supabaseAdmin
      .from('actividades_direccion')
      .update({ comentarios })
      .eq('id', id);
    if (updateError) throw updateError;
    res.status(201).json(nuevoComentario);
  })
};

export default actividadesController;
