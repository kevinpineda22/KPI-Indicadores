import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    // Log para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Validating request body:', JSON.stringify(req.body, null, 2));
    }

    const { error, value } = schema.validate(req.body, { 
      abortEarly: false, // Mostrar todos los errores
      allowUnknown: true // Permitir campos adicionales
    });
    
    if (error) {
      console.error('❌ Validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      });
    }
    
    // Reemplazar req.body con el valor validado
    req.body = value;
    next();
  };
};

// Esquemas de validación actualizados
export const actividadSchema = Joi.object({
  nombre: Joi.string().required().min(3).max(255).messages({
    'string.empty': 'El nombre es requerido',
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no puede exceder 255 caracteres'
  }),
  asignado_a: Joi.string().email().required().messages({
    'string.email': 'Debe ser un email válido',
    'string.empty': 'El email del asignado es requerido'
  }),
  prioridad: Joi.string().valid('Alta', 'Media', 'Baja').default('Media'),
  fecha_inicio: Joi.date().optional().allow('', null),
  fecha_final: Joi.date().optional().allow('', null),
  objetivo: Joi.string().optional().allow(''),
  impacto: Joi.string().optional().allow(''),
  alcance: Joi.string().optional().allow(''),
  recursos: Joi.string().optional().allow(''),
  areas_involucradas: Joi.array().items(Joi.string()).default([]),
  direccion: Joi.string().required().messages({
    'string.empty': 'La dirección es requerida'
  }),
  estado: Joi.string().valid('Por Hacer', 'En Curso', 'Revisión', 'Terminado').default('Por Hacer')
});

export const updateActividadSchema = Joi.object({
  nombre: Joi.string().min(3).max(255).optional(),
  asignado_a: Joi.string().email().optional(),
  prioridad: Joi.string().valid('Alta', 'Media', 'Baja').optional(),
  fecha_inicio: Joi.date().optional().allow('', null),
  fecha_final: Joi.date().optional().allow('', null),
  objetivo: Joi.string().optional().allow(''),
  impacto: Joi.string().optional().allow(''),
  alcance: Joi.string().optional().allow(''),
  recursos: Joi.string().optional().allow(''),
  areas_involucradas: Joi.array().items(Joi.string()).optional(),
  estado: Joi.string().valid('Por Hacer', 'En Curso', 'Revisión', 'Terminado').optional()
});
