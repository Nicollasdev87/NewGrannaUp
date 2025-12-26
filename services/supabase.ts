import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://krvxwqjeccgscreljjbu.supabase.co';
const supabaseAnonKey = 'sb_publishable_AjJsFv4IQJI6Iykm022XoA_KCDsQ8MC';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
