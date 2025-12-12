/**
 * Hook para gestionar el perfil del usuario y driver
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { first_name?: string; last_name?: string; phone?: string; password?: string }) =>
      apiClient.updateCurrentUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useDriver(driverId?: string) {
  const { user } = useAuth();
  const id = driverId || (user as any)?.driver_id;

  return useQuery({
    queryKey: ['driver', id],
    queryFn: () => apiClient.getDriver(id!),
    enabled: !!id,
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const driverId = (user as any)?.driver_id;

  return useMutation({
    mutationFn: (data: Partial<any>) => apiClient.updateDriver(driverId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', driverId] });
    },
  });
}

export function useVehicle(vehicleId?: string) {
  return useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => apiClient.getVehicle(vehicleId!),
    enabled: !!vehicleId,
  });
}

