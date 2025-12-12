/**
 * Pantalla de Información del Vehículo
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useVehicle } from '../hooks/useProfile';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Vehicle'>;

export default function VehicleScreen({ route }: Props) {
  const { vehicleId } = route.params;
  const { data: vehicle, isLoading } = useVehicle(vehicleId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Vehículo no encontrado</Text>
      </View>
    );
  }

  const getVehicleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      MOTORCYCLE: 'Motocicleta',
      SEDAN: 'Sedán',
      MINI_VAN: 'Minivan',
      PANEL: 'Panel',
      TRUCK: 'Camión',
      PICKUP: 'Pickup',
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      AVAILABLE: 'Disponible',
      IN_SERVICE: 'En Servicio',
      MAINTENANCE: 'En Mantenimiento',
      OUT_OF_SERVICE: 'Fuera de Servicio',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '#34C759';
      case 'IN_SERVICE':
        return '#007AFF';
      case 'MAINTENANCE':
        return '#FF9500';
      case 'OUT_OF_SERVICE':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Vehículo</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoValue}>{getVehicleTypeLabel(vehicle.vehicle_type)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Placa:</Text>
            <Text style={styles.infoValue}>{vehicle.license_plate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Marca:</Text>
            <Text style={styles.infoValue}>{vehicle.brand}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Modelo:</Text>
            <Text style={styles.infoValue}>{vehicle.model}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Año:</Text>
            <Text style={styles.infoValue}>{vehicle.year}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Color:</Text>
            <Text style={styles.infoValue}>{vehicle.color}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(vehicle.status) },
              ]}
            >
              <Text style={styles.statusText}>{getStatusLabel(vehicle.status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seguro</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Póliza:</Text>
            <Text style={styles.infoValue}>{vehicle.insurance_policy}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vence:</Text>
            <Text style={styles.infoValue}>
              {vehicle.insurance_expires_at
                ? new Date(vehicle.insurance_expires_at).toLocaleDateString('es-ES')
                : 'N/A'}
            </Text>
          </View>
        </View>

        {vehicle.last_maintenance_at && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mantenimiento</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Último Mantenimiento:</Text>
              <Text style={styles.infoValue}>
                {new Date(vehicle.last_maintenance_at).toLocaleDateString('es-ES')}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

