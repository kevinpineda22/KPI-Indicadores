import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY; // Usar SUPABASE_KEY del .env
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // Opcional, si lo tienes

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente con permisos de servicio (para operaciones administrativas)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente anónimo (para operaciones públicas)
const supabaseClient = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const connectDB = async () => {
  try {
    // Test connection
    const { data, error } = await supabaseAdmin
      .from('actividades_direccion')
      .select('count')
      .limit(1);

    if (error) throw error;
    console.log('✅ Connected to Supabase successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    throw error;
  }
};

export { supabaseAdmin, supabaseClient, connectDB };
