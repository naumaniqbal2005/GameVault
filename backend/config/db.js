const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase client for database operations (not auth)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = { supabase };