import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Validar que las variables existan
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las variables de entorno de Supabase:');
  if (!supabaseUrl) console.error('   - SUPABASE_URL');
  if (!supabaseKey) console.error('   - SUPABASE_KEY');
  console.error('\n📝 Verifica tu archivo .env');
  process.exit(1);
}

// Validar formato de URL
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('❌ SUPABASE_URL debe ser una URL válida de Supabase');
  console.error('📝 Formato: https://tu-proyecto.supabase.co');
  process.exit(1);
}

// Cliente principal de Supabase (usando service_role key)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Función para probar la conexión
export const connectDB = async () => {
  try {
    console.log('🔄 Conectando a Supabase...');
    
    // Test básico de conexión
    const { data, error } = await supabase
      .from('actividades_direccion')
      .select('count')
      .limit(1);
    
    if (error) {
      // Si la tabla no existe, mostrar mensaje informativo
      if (error.code === 'PGRST106') {
        console.log('⚠️  La tabla "actividades_direccion" no existe en Supabase');
        console.log('📋 Necesitas crear la tabla en tu panel de Supabase');
        console.log('🔗 Ve a: https://app.supabase.com/project/pitpougbnibmfrjykzet/editor');
        return false;
      }
      throw error;
    }
    
    console.log('✅ Conectado a Supabase exitosamente');
    console.log(`📊 Base de datos: ${supabaseUrl}`);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a Supabase:', error.message);
    if (error.message.includes('Invalid API key')) {
      console.error('🔑 Verifica que tu SUPABASE_KEY sea correcta');
    }
    throw error;
  }
};

// Exportar el cliente como default y también nombrado
export default supabase;
export { supabase };
