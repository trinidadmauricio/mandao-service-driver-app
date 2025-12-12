/**
 * Pantalla de Perfil del Driver
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentUser, useUpdateCurrentUser, useDriver } from '../hooks/useProfile';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const { data: driver, isLoading: isLoadingDriver } = useDriver((user as any)?.driver_id);
  const updateUser = useUpdateCurrentUser();

  const [firstName, setFirstName] = useState(currentUser?.first_name || '');
  const [lastName, setLastName] = useState(currentUser?.last_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.first_name || '');
      setLastName(currentUser.last_name || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Error', 'Nombre y apellido son obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      await updateUser.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
      });
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Error al actualizar el perfil'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingUser || isLoadingDriver) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Información del Usuario */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editButton}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={currentUser?.email || ''}
                editable={false}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                editable={isEditing}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellido *</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                editable={isEditing}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                editable={isEditing}
                keyboardType="phone-pad"
              />
            </View>

            {isEditing && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setIsEditing(false);
                    // Restaurar valores originales
                    if (currentUser) {
                      setFirstName(currentUser.first_name || '');
                      setLastName(currentUser.last_name || '');
                      setPhone(currentUser.phone || '');
                    }
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Información del Driver */}
        {driver && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de Conductor</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Documento de Identidad:</Text>
              <Text style={styles.infoValue}>{driver.identity_document}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Licencia de Conducir:</Text>
              <Text style={styles.infoValue}>{driver.driving_license}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo de Trabajo:</Text>
              <Text style={styles.infoValue}>
                {driver.work_type === 'FULL_TIME'
                  ? 'Tiempo Completo'
                  : driver.work_type === 'PART_TIME'
                  ? 'Medio Tiempo'
                  : 'Freelance'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado:</Text>
              <Text style={styles.infoValue}>{driver.availability_status}</Text>
            </View>
            {driver.rating_avg && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Calificación:</Text>
                <Text style={styles.infoValue}>⭐ {driver.rating_avg.toFixed(1)}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total de Entregas:</Text>
              <Text style={styles.infoValue}>{driver.total_deliveries}</Text>
            </View>
          </View>
        )}

        {/* Información del Vehículo */}
        {driver?.vehicle_id && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehículo</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Vehicle', { vehicleId: driver.vehicle_id })}
            >
              <View style={styles.vehicleCard}>
                <Text style={styles.vehicleText}>
                  Ver información del vehículo →
                </Text>
              </View>
            </TouchableOpacity>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  editButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  vehicleCard: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  vehicleText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});

