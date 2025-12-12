/**
 * Servicio de Geolocalización
 * Maneja el tracking de ubicación en foreground y background
 */

import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

export interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

class LocationService {
  private watchId: number | null = null;
  private isTracking = false;
  private onLocationUpdate?: (location: LocationData) => void;
  private updateInterval = 15000; // 15 segundos

  /**
   * Solicita permisos de ubicación
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        if (
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        }

        Alert.alert(
          'Permisos de Ubicación',
          'Se requieren permisos de ubicación para rastrear tu posición. Por favor, habilítalos en la configuración de la aplicación.'
        );
        return false;
      } catch (err) {
        console.warn('Error requesting location permissions:', err);
        return false;
      }
    }

    // iOS maneja permisos automáticamente a través de Info.plist
    return true;
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

    // Configurar opciones de geolocalización
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
      distanceFilter: 10, // Actualizar cada 10 metros
    };

    // Obtener ubicación inicial
    Geolocation.getCurrentPosition(
      (position) => {
        const location: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy || undefined,
          speed: position.coords.speed ? position.coords.speed * 3.6 : undefined, // Convertir m/s a km/h
          heading: position.coords.heading || undefined,
          timestamp: position.timestamp,
        };
        this.onLocationUpdate?.(location);
      },
      (error) => {
        console.error('Error getting initial location:', error);
        Alert.alert('Error', 'No se pudo obtener tu ubicación. Verifica que el GPS esté activado.');
      },
      options
    );

    // Iniciar watch para actualizaciones continuas
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy || undefined,
          speed: position.coords.speed ? position.coords.speed * 3.6 : undefined,
          heading: position.coords.heading || undefined,
          timestamp: position.timestamp,
        };
        this.onLocationUpdate?.(location);
      },
      (error) => {
        console.error('Error watching position:', error);
        if (error.code === 1) {
          // PERMISSION_DENIED
          Alert.alert('Permisos Denegados', 'Los permisos de ubicación fueron denegados.');
          this.stopTracking();
        }
      },
      options
    );

    this.isTracking = true;
    console.log('Location tracking started');
    return true;
  }

  /**
   * Detiene el tracking de ubicación
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
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

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy || undefined,
            speed: position.coords.speed ? position.coords.speed * 3.6 : undefined,
            heading: position.coords.heading || undefined,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    });
  }

  /**
   * Verifica si el tracking está activo
   */
  isActive(): boolean {
    return this.isTracking;
  }
}

export const locationService = new LocationService();

