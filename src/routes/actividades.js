import express from 'express';
import actividadesController from '../controllers/actividadesController.js';
import { validate, actividadSchema, updateActividadSchema } from '../middleware/validation.js';
import multer from 'multer';
import { supabaseAdmin } from '../config/database.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/actividades-direccion/:direccion - Obtener actividades por dirección
router.get('/:direccion', actividadesController.getActividadesByDireccion);

// POST /api/actividades-direccion - Crear nueva actividad
router.post('/', validate(actividadSchema), actividadesController.createActividad);

// PUT /api/actividades-direccion/:id - Actualizar actividad completa
router.put('/:id', validate(updateActividadSchema), actividadesController.updateActividad);

// PUT /api/actividades-direccion/:id/estado - Actualizar solo el estado
router.put('/:id/estado', actividadesController.updateEstadoActividad);

// DELETE /api/actividades-direccion/:id - Eliminar actividad
router.delete('/:id', actividadesController.deleteActividad);

// GET /api/actividades-direccion/:id/details - Obtener detalles completos
router.get('/:id/details', actividadesController.getActividadDetails);

// SUBTAREAS
router.get('/:id/subtareas', actividadesController.getSubtareas);
router.post('/:id/subtareas', actividadesController.createSubtarea);
router.put('/:id/subtareas/:subtareaId', actividadesController.updateSubtarea);
router.delete('/:id/subtareas/:subtareaId', actividadesController.deleteSubtarea);

// DOCUMENTOS
router.get('/:id/documentos', actividadesController.getDocumentos);

// Subir documento (adjuntar archivo)
router.post('/:id/documentos', upload.single('documento'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    const nombre = req.body.nombre || file.originalname;

    // Subir a Supabase Storage usando supabaseAdmin
    const bucket = 'documentos_actividades_indicore';
    const path = `${id}/${Date.now()}_${file.originalname}`;
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file.buffer, { contentType: file.mimetype });

    if (error) throw error;

    // Guardar referencia en la actividad
    const { data: actividad, error: errorActividad } = await supabaseAdmin
      .from('actividades_direccion')
      .select('documentos')
      .eq('id', id)
      .single();
    if (errorActividad) throw errorActividad;

    const documentos = actividad.documentos || [];
    const nuevoDocumento = {
      id: Date.now(),
      nombre,
      archivo: path
    };
    documentos.push(nuevoDocumento);

    const { error: updateError } = await supabaseAdmin
      .from('actividades_direccion')
      .update({ documentos })
      .eq('id', id);
    if (updateError) throw updateError;

    res.status(201).json(nuevoDocumento);
  } catch (error) {
    res.status(500).json({ error: 'Error al subir documento', details: error.message });
  }
});

router.delete('/:id/documentos/:documentoId', actividadesController.deleteDocumento);

// COMENTARIOS
router.get('/:id/comentarios', actividadesController.getComentarios);
router.post('/:id/comentarios', actividadesController.createComentario);

export default router;
