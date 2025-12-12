/**
 * Cliente API para comunicación con el backend
 */

import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import type { LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from '../types/api';

// TODO: Configurar desde variables de entorno o configuración
const API_BASE_URL = __DEV__ 
  ? (Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001')
  : 'https://api.mandao.com';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadToken();
  }

  private setupInterceptors(): void {
    // Request interceptor: Agregar token a las peticiones
    this.client.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          const storedToken = await AsyncStorage.getItem('access_token');
          if (storedToken) {
            this.token = storedToken;
          }
        }

        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: Manejar errores 401 (token expirado)
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido, limpiar y redirigir a login
          await this.clearToken();
          // El contexto de autenticación manejará la redirección
        }
        return Promise.reject(error);
      }
    );
  }

  private async loadToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        this.token = token;
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    try {
      await AsyncStorage.setItem('access_token', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  async clearToken(): Promise<void> {
    this.token = null;
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<ApiResponse<LoginResponse>>(
      '/api/v1/auth/login',
      credentials
    );
    if (response.data.status === 'success' && response.data.data) {
      await this.setToken(response.data.data.access_token);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Login failed');
  }

  async register(data: RegisterRequest): Promise<void> {
    const response = await this.client.post<ApiResponse<{ user: any }>>(
      '/api/v1/auth/register',
      data
    );
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Registration failed');
    }
  }

  // Orders endpoints
  async getOrders(filters?: {
    status?: string;
    driver_id?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total?: number; page?: number; limit?: number }> {
    const response = await this.client.get<ApiResponse<any[]>>('/api/v1/orders', {
      params: filters,
    });
    if (response.data.status === 'success' && response.data.data) {
      return {
        data: response.data.data,
        total: (response.data as any).total,
        page: (response.data as any).page,
        limit: (response.data as any).limit,
      };
    }
    throw new Error(response.data.message || 'Failed to fetch orders');
  }

  async getOrder(orderId: string): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>(`/api/v1/orders/${orderId}`);
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch order');
  }

  async updateOrderStatus(
    orderId: string,
    toStatus: string,
    notes?: string,
    cancellation_reason?: string
  ): Promise<void> {
    const response = await this.client.patch<ApiResponse<void>>(`/api/v1/orders/${orderId}`, {
      to_status: toStatus,
      notes,
      cancellation_reason,
    });
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to update order status');
    }
  }

  // User endpoints
  async getCurrentUser(): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>('/api/v1/users/me');
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch user profile');
  }

  async updateCurrentUser(data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    password?: string;
  }): Promise<any> {
    const response = await this.client.patch<ApiResponse<any>>('/api/v1/users/me', data);
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update user profile');
  }

  // Driver endpoints
  async getDriver(driverId: string): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>(`/api/v1/drivers/${driverId}`);
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch driver');
  }

  async updateDriver(driverId: string, data: Partial<any>): Promise<any> {
    const response = await this.client.patch<ApiResponse<any>>(`/api/v1/drivers/${driverId}`, data);
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update driver');
  }

  // Vehicle endpoints
  async getVehicle(vehicleId: string): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>(`/api/v1/vehicles/${vehicleId}`);
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch vehicle');
  }

  // Location endpoints
  async updateLocation(location: {
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    order_id?: string;
  }): Promise<void> {
    await this.client.post('/api/v1/drivers/location', location);
  }
}

export const apiClient = new ApiClient();

