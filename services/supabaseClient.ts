import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jhjlxljhijhrvclgsbzc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impoamx4bGpoaWpocnZjbGdzYnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjQ4NzYsImV4cCI6MjA4MDg0MDg3Nn0.8WwtsrOE3Fch_vFczeu6Fz9A2QiO_Pbwh_MxuhFUFwY";

export const supabase = createClient(supabaseUrl, supabaseKey);