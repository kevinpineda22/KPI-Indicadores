import supabase from '../config/supabaseCliente.js';
import { v4 as uuidv4 } from 'uuid';

const actividadesService = {
  async getByDireccion(direccion) {
    try {
      const { data, error } = await supabase
        .from('actividades_direccion')
        .select('*')
        .eq('direccion', direccion)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Procesar los datos para parsear JSON
      return data.map(actividad => ({
        ...actividad,
        areas_involucradas: typeof actividad.areas_involucradas === 'string' 
          ? JSON.parse(actividad.areas_involucradas || '[]')
          : actividad.areas_involucradas || []
      }));
    } catch (error) {
      console.error('Error en getByDireccion:', error);
      throw error;
    }
  },

  async create(actividadData) {
    try {
      const newActividad = {
        id: uuidv4(),
        ...actividadData,
        areas_involucradas: JSON.stringify(actividadData.areas_involucradas || []),
        estado: actividadData.estado || 'Por Hacer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('actividades_direccion')
        .insert([newActividad])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        areas_involucradas: JSON.parse(data.areas_involucradas || '[]')
      };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  async update(id, updateData) {
    try {
      const dataToUpdate = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      if (updateData.areas_involucradas) {
        dataToUpdate.areas_involucradas = JSON.stringify(updateData.areas_involucradas);
      }

      const { data, error } = await supabase
        .from('actividades_direccion')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Actividad no encontrada');

      return {
        ...data,
        areas_involucradas: JSON.parse(data.areas_involucradas || '[]')
      };
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  async updateEstado(id, estado) {
    try {
      const { data, error } = await supabase
        .from('actividades_direccion')
        .update({ 
          estado,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Actividad no encontrada');

      return {
        ...data,
        areas_involucradas: typeof data.areas_involucradas === 'string'
          ? JSON.parse(data.areas_involucradas || '[]')
          : data.areas_involucradas || []
      };
    } catch (error) {
      console.error('Error en updateEstado:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('actividades_direccion')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },

  async getDetails(id) {
    try {
      const { data, error } = await supabase
        .from('actividades_direccion')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Actividad no encontrada');

      return {
        ...data,
        areas_involucradas: typeof data.areas_involucradas === 'string'
          ? JSON.parse(data.areas_involucradas || '[]')
          : data.areas_involucradas || []
      };
    } catch (error) {
      console.error('Error en getDetails:', error);
      throw error;
    }
  }
};

export default actividadesService;
