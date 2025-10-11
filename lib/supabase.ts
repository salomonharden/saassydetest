import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ktzbohrqofxugclfmdbs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0emJvaHJxb2Z4dWdjbGZtZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODA1NDIsImV4cCI6MjA3NTY1NjU0Mn0.DHg2mItHgCVLrLdWQ5B3N9qhMKrr46E1pM1JwIOf0AI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);