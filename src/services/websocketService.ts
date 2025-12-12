/**
 * Servicio WebSocket para enviar ubicación en tiempo real
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import type { LocationData } from './locationService';

const WS_BASE_URL = __DEV__
  ? (Constants.expoConfig?.extra?.wsUrl || 'wss://mandao-backend.ngrok.app')
  : 'wss://api.mandao.com';

export interface WebSocketMessage {
  type: 'location_update' | 'connected' | 'error';
  payload?: any;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;
  private onMessageHandler?: (message: WebSocketMessage) => void;
  private onErrorHandler?: (error: Event) => void;
  private onConnectHandler?: () => void;
  private onDisconnectHandler?: () => void;

  /**
   * Conecta al servidor WebSocket
   */
  async connect(): Promise<boolean> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return true; // Ya está conectado o conectando
    }

    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        console.error('[WebSocketService] No access token found');
        this.isConnecting = false;
        return false;
      }

      // Construir URL con token como query param
      const wsUrl = `${WS_BASE_URL}/ws/location?token=${encodeURIComponent(token)}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocketService] Connected to WebSocket server');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.onConnectHandler?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.onMessageHandler?.(message);
        } catch (error) {
          console.error('[WebSocketService] Error parsing message', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocketService] WebSocket error', error);
        this.onErrorHandler?.(error);
        this.isConnecting = false;
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocketService] WebSocket closed', {
          code: event.code,
          reason: event.reason,
        });
        this.isConnecting = false;
        this.ws = null;
        this.onDisconnectHandler?.();

        // Intentar reconectar si no fue un cierre intencional
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      return true;
    } catch (error) {
      console.error('[WebSocketService] Error creating WebSocket', error);
      this.isConnecting = false;
      return false;
    }
  }

  /**
   * Desconecta del servidor WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnecting = false;
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevenir reconexión automática
  }

  /**
   * Envía actualización de ubicación
   */
  sendLocationUpdate(location: LocationData, orderId?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocketService] Cannot send location: WebSocket not connected');
      return;
    }

    const message = {
      type: 'location_update',
      payload: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy,
        speed: location.speed,
        heading: location.heading,
        order_id: orderId,
      },
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Registra handlers de eventos
   */
  onMessage(handler: (message: WebSocketMessage) => void): void {
    this.onMessageHandler = handler;
  }

  onError(handler: (error: Event) => void): void {
    this.onErrorHandler = handler;
  }

  onConnect(handler: () => void): void {
    this.onConnectHandler = handler;
  }

  onDisconnect(handler: () => void): void {
    this.onDisconnectHandler = handler;
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return; // Ya hay un reconnect programado
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000
    ); // Max 30 segundos

    console.log(
      `[WebSocketService] Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
}

export const websocketService = new WebSocketService();

