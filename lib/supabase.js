// lib/supabase.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-id.supabase.co'; // Usa tu URL de Supabase
const supabaseKey = 'your-anon-key'; // Usa tu clave pública de Supabase

export const supabase = createClient(supabaseUrl, supabaseKey);
