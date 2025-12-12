/**
 * Pantalla de Detalle de Orden
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useOrder, useUpdateOrderStatus } from '../hooks/useOrders';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'ASSIGNED':
      return '#007AFF';
    case 'IN_TRANSIT':
      return '#FF9500';
    case 'DELIVERED':
      return '#34C759';
    default:
      return '#8E8E93';
  }
};

export default function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const { data: order, isLoading } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = () => {
    Alert.alert(
      'Aceptar Orden',
      '¿Estás seguro de que quieres aceptar esta orden?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await updateStatus.mutateAsync({
                orderId,
                toStatus: 'IN_TRANSIT',
                notes: 'Orden aceptada por el conductor',
              });
              Alert.alert('Éxito', 'Orden aceptada correctamente');
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Error al aceptar la orden'
              );
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.prompt(
      'Rechazar Orden',
      '¿Por qué rechazas esta orden?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          onPress: async (reason: string | undefined) => {
            if (!reason || reason.trim() === '') {
              Alert.alert('Error', 'Debes proporcionar una razón para rechazar');
              return;
            }
            setIsProcessing(true);
            try {
              await updateStatus.mutateAsync({
                orderId,
                toStatus: 'CANCELLED',
                notes: 'Orden rechazada por el conductor',
                cancellation_reason: reason,
              });
              Alert.alert('Éxito', 'Orden rechazada');
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Error al rechazar la orden'
              );
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleComplete = () => {
    Alert.alert(
      'Completar Orden',
      '¿Confirmas que has entregado esta orden?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await updateStatus.mutateAsync({
                orderId,
                toStatus: 'DELIVERED',
                notes: 'Orden entregada por el conductor',
              });
              Alert.alert('Éxito', 'Orden marcada como entregada');
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Error al completar la orden'
              );
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Orden no encontrada</Text>
      </View>
    );
  }

  const canAccept = order.status === 'ASSIGNED';
  const canComplete = order.status === 'IN_TRANSIT';
  const canReject = order.status === 'ASSIGNED' || order.status === 'IN_TRANSIT';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Número de Orden</Text>
          <Text style={styles.value}>{order.order_display_number}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tracking Code</Text>
          <Text style={styles.value}>{order.tracking_code}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Estado</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status) },
            ]}
          >
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        {order.delivery_address && typeof order.delivery_address === 'object' && (
          <View style={styles.section}>
            <Text style={styles.label}>Dirección de Entrega</Text>
            <Text style={styles.value}>{order.delivery_address.address || 'N/A'}</Text>
            {order.delivery_address.lat && order.delivery_address.lng && (
              <Text style={styles.coords}>
                📍 {order.delivery_address.lat}, {order.delivery_address.lng}
              </Text>
            )}
          </View>
        )}

        {order.customer_snapshot && typeof order.customer_snapshot === 'object' && (
          <View style={styles.section}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>
              {(order.customer_snapshot as any).name || 'N/A'}
            </Text>
            {(order.customer_snapshot as any).phone && (
              <Text style={styles.value}>📞 {(order.customer_snapshot as any).phone}</Text>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Fecha de Creación</Text>
          <Text style={styles.value}>
            {new Date(order.created_at).toLocaleString('es-ES')}
          </Text>
        </View>

        {order.estimated_delivery_at && (
          <View style={styles.section}>
            <Text style={styles.label}>Entrega Estimada</Text>
            <Text style={styles.value}>
              {new Date(order.estimated_delivery_at).toLocaleString('es-ES')}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          {canAccept && (
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={handleAccept}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Aceptar Orden</Text>
              )}
            </TouchableOpacity>
          )}

          {canComplete && (
            <TouchableOpacity
              style={[styles.button, styles.completeButton]}
              onPress={handleComplete}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Marcar como Entregada</Text>
              )}
            </TouchableOpacity>
          )}

          {canReject && (
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={handleReject}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>Rechazar Orden</Text>
            </TouchableOpacity>
          )}
        </View>
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  coords: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  completeButton: {
    backgroundColor: '#007AFF',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

