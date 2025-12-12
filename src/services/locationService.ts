/**
 * Servicio de Geolocalización
 * Maneja el tracking de ubicación en foreground y background usando Expo Location
 */

import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';

export interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private isTracking = false;
  private onLocationUpdate?: (location: LocationData) => void;

  /**
   * Solicita permisos de ubicación
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Permisos de Ubicación',
          'Se requieren permisos de ubicación para rastrear tu posición. Por favor, habilítalos en la configuración de la aplicación.'
        );
        return false;
      }

      // Para background location, se requiere permiso adicional
      if (Platform.OS === 'android') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.warn('Background location permission not granted');
        }
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Inicia el tracking de ubicación
   */
  async startTracking(
    onUpdate: (location: LocationData) => void,
    _orderId?: string
  ): Promise<boolean> {
    if (this.isTracking) {
      console.warn('Location tracking is already active');
      return false;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return false;
    }

    this.onLocationUpdate = onUpdate;

    try {
      // Obtener ubicación inicial
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const location: LocationData = {
        lat: initialLocation.coords.latitude,
        lng: initialLocation.coords.longitude,
        accuracy: initialLocation.coords.accuracy || undefined,
        speed: initialLocation.coords.speed ? initialLocation.coords.speed * 3.6 : undefined, // Convertir m/s a km/h
        heading: initialLocation.coords.heading || undefined,
        timestamp: initialLocation.timestamp,
      };
      this.onLocationUpdate(location);

      // Iniciar watch para actualizaciones continuas
      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 15000, // Actualizar cada 15 segundos
          distanceInterval: 10, // Actualizar cada 10 metros
        },
        (position) => {
          const locationData: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy || undefined,
            speed: position.coords.speed ? position.coords.speed * 3.6 : undefined,
            heading: position.coords.heading || undefined,
            timestamp: position.timestamp,
          };
          this.onLocationUpdate?.(locationData);
        }
      );

      this.isTracking = true;
      console.log('Location tracking started');
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'No se pudo iniciar el tracking de ubicación. Verifica que el GPS esté activado.');
      return false;
    }
  }

  /**
   * Detiene el tracking de ubicación
   */
  stopTracking(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
    this.isTracking = false;
    this.onLocationUpdate = undefined;
    console.log('Location tracking stopped');
  }

  /**
   * Obtiene la ubicación actual una vez
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return null;
    }

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy || undefined,
        speed: position.coords.speed ? position.coords.speed * 3.6 : undefined,
        heading: position.coords.heading || undefined,
        timestamp: position.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  }

  /**
   * Verifica si el tracking está activo
   */
  isActive(): boolean {
    return this.isTracking;
  }
}

export const locationService = new LocationService();

