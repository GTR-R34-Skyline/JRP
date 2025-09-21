import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Vendor = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service_type: 'guide' | 'marketplace';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
};

export type VendorPhoto = {
  id: string;
  vendor_id: string;
  photo_url: string;
  photo_type: 'profile' | 'document' | 'gallery';
  created_at: string;
};

export type Review = {
  id: string;
  vendor_id: string;
  customer_name: string;
  rating: number;
  comment?: string;
  created_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};