/**
 * Hook para gestionar órdenes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function useOrders(filters?: { status?: string; page?: number; limit?: number }) {
  const { user } = useAuth();
  const driverId = (user as any)?.driver_id; // Asumiendo que el user tiene driver_id

  return useQuery({
    queryKey: ['orders', filters, driverId],
    queryFn: () =>
      apiClient.getOrders({
        ...filters,
        driver_id: driverId,
      }),
    enabled: !!driverId,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => apiClient.getOrder(orderId),
    enabled: !!orderId,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      toStatus,
      notes,
      cancellation_reason,
    }: {
      orderId: string;
      toStatus: string;
      notes?: string;
      cancellation_reason?: string;
    }) => apiClient.updateOrderStatus(orderId, toStatus, notes, cancellation_reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

