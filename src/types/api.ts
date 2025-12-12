/**
 * Tipos TypeScript para la API
 */

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  email_verified: boolean;
  tenant_id?: string;
  logistics_provider_id?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface Order {
  id: string;
  order_display_number: string;
  tracking_code: string;
  status: string;
  order_type: 'RETAIL' | 'ON_DEMAND';
  cargo_size?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
  delivery_address?: {
    address: string;
    lat?: number;
    lng?: number;
  };
  created_at: string;
  estimated_delivery_at?: string;
}

export interface Driver {
  id: string;
  user_id: string;
  logistics_provider_id: string;
  availability_status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'SUSPENDED';
  vehicle_id?: string;
  rating_avg?: number;
  total_deliveries: number;
}

