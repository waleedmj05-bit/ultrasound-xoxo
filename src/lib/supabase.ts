import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UltrasoundReport = {
  id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  examination_type: string;
  examination_date: string;
  indication: string;
  findings: string;
  impression: string;
  recommendations: string;
  referring_physician: string;
  radiologist_name: string;
  pdf_file_name: string | null;
  pdf_file_data: string | null;
  pdf_file_size: number | null;
  created_at: string;
  updated_at: string;
};
