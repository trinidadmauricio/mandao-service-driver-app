/**
 * Pantalla de Dashboard con órdenes asignadas
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { useLocationTracking } from '../hooks/useLocationTracking';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string | undefined>('ASSIGNED');
  const { data, isLoading, refetch, isRefetching } = useOrders({
    status: statusFilter,
    limit: 20,
  });

  const orders = data?.data || [];

  // Tracking de ubicación
  const {
    isTracking,
    isConnected,
    currentLocation,
    error: locationError,
    startTracking,
    stopTracking,
  } = useLocationTracking({
    enabled: true,
    autoStart: false, // No iniciar automáticamente, el usuario debe activarlo
  });

  // Mostrar error de ubicación si existe
  useEffect(() => {
    if (locationError) {
      Alert.alert('Error de Ubicación', locationError);
    }
  }, [locationError]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return '#007AFF';
      case 'IN_TRANSIT':
        return '#FF9500';
      case 'DELIVERED':
        return '#34C759';
      case 'CANCELLED':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ASSIGNED: 'Asignada',
      IN_TRANSIT: 'En Tránsito',
      DELIVERED: 'Entregada',
      CANCELLED: 'Cancelada',
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
    };
    return labels[status] || status;
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>{item.order_display_number}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
        <Text style={styles.trackingCode}>Tracking: {item.tracking_code}</Text>
        {item.delivery_address && typeof item.delivery_address === 'object' && (
          <Text style={styles.address} numberOfLines={2}>
            📍 {item.delivery_address.address || 'Dirección no disponible'}
          </Text>
        )}
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola,</Text>
          <Text style={styles.name}>
            {user?.first_name} {user?.last_name}
          </Text>
          {currentLocation && (
            <Text style={styles.locationStatus}>
              📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.trackingButton,
              isTracking && styles.trackingButtonActive,
              !isConnected && styles.trackingButtonDisabled,
            ]}
            onPress={() => {
              if (isTracking) {
                stopTracking();
              } else {
                startTracking();
              }
            }}
            disabled={!isConnected}
          >
            <Text
              style={[
                styles.trackingButtonText,
                isTracking && styles.trackingButtonTextActive,
              ]}
            >
              {isTracking ? '🟢' : '⚪'} {isTracking ? 'En Ruta' : 'Iniciar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileButtonText}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'ASSIGNED' && styles.filterButtonActive]}
          onPress={() => setStatusFilter('ASSIGNED')}
        >
          <Text
            style={[
              styles.filterText,
              statusFilter === 'ASSIGNED' && styles.filterTextActive,
            ]}
          >
            Asignadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'IN_TRANSIT' && styles.filterButtonActive]}
          onPress={() => setStatusFilter('IN_TRANSIT')}
        >
          <Text
            style={[
              styles.filterText,
              statusFilter === 'IN_TRANSIT' && styles.filterTextActive,
            ]}
          >
            En Ruta
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, !statusFilter && styles.filterButtonActive]}
          onPress={() => setStatusFilter(undefined)}
        >
          <Text style={[styles.filterText, !statusFilter && styles.filterTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No hay órdenes disponibles</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trackingButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  trackingButtonActive: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  trackingButtonDisabled: {
    opacity: 0.5,
  },
  trackingButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  trackingButtonTextActive: {
    color: '#fff',
  },
  locationStatus: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  profileButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  profileButtonText: {
    fontSize: 20,
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  trackingCode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
