/**
 * Hook para gestionar el tracking de ubicación
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { locationService, type LocationData } from '../services/locationService';
import { websocketService } from '../services/websocketService';
import { useAuth } from '../contexts/AuthContext';

export interface UseLocationTrackingOptions {
  orderId?: string;
  enabled?: boolean;
  autoStart?: boolean;
}

export function useLocationTracking(options: UseLocationTrackingOptions = {}) {
  const { enabled = true, autoStart = false, orderId } = options;
  const { isAuthenticated } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const orderIdRef = useRef<string | undefined>(orderId);

  // Actualizar orderId cuando cambia
  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

  // Conectar WebSocket cuando se habilita
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      return;
    }

    const connect = async () => {
      const connected = await websocketService.connect();
      setIsConnected(connected);

      websocketService.onConnect(() => {
        setIsConnected(true);
        setError(null);
      });

      websocketService.onDisconnect(() => {
        setIsConnected(false);
      });

      websocketService.onError(() => {
        setIsConnected(false);
        setError('Error de conexión WebSocket');
      });
    };

    connect();

    return () => {
      websocketService.disconnect();
    };
  }, [enabled, isAuthenticated]);

  const startTracking = useCallback(async () => {
    if (isTracking) {
      return;
    }

    const started = await locationService.startTracking((location) => {
      setCurrentLocation(location);
      setError(null);

      // Enviar ubicación vía WebSocket si está conectado
      if (websocketService.isConnected()) {
        websocketService.sendLocationUpdate(location, orderIdRef.current);
      }

      // También enviar vía API REST como fallback
      // Esto se puede hacer en el servicio de API si es necesario
    }, orderIdRef.current);

    if (started) {
      setIsTracking(true);
      setError(null);
    } else {
      setError('No se pudo iniciar el tracking de ubicación. Verifica los permisos.');
    }
  }, [isTracking]);

  // Iniciar tracking automáticamente si está habilitado
  useEffect(() => {
    if (autoStart && enabled && isAuthenticated && isConnected) {
      startTracking();
    }
  }, [autoStart, enabled, isAuthenticated, isConnected, startTracking]);

  const stopTracking = useCallback(() => {
    locationService.stopTracking();
    setIsTracking(false);
    setCurrentLocation(null);
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        return location;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener ubicación');
      return null;
    }
  }, []);

  return {
    isTracking,
    isConnected,
    currentLocation,
    error,
    startTracking,
    stopTracking,
    getCurrentLocation,
  };
}

