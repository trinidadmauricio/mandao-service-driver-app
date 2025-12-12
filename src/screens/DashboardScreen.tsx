/**
 * Pantalla de Dashboard - Rediseñada basada en orders.html
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
  ScrollView,
  useColorScheme,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { colors } from '../theme/colors';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/TabNavigator';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string | undefined>('ASSIGNED');
  const { data, isLoading, refetch, isRefetching } = useOrders({
    status: statusFilter,
    limit: 20,
  });

  const orders = data?.data || [];
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
    autoStart: false,
  });

  useEffect(() => {
    if (locationError) {
      Alert.alert('Error de Ubicación', locationError);
    }
  }, [locationError]);

  // Calcular stats
  const pendingCount = orders.filter((o: any) => o.status === 'ASSIGNED' || o.status === 'PENDING').length;
  const inProgressCount = orders.filter((o: any) => o.status === 'IN_TRANSIT').length;
  const completedCount = orders.filter((o: any) => o.status === 'DELIVERED').length;

  // Obtener fecha y hora actual
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = `${dayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}`;
  const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ASSIGNED: 'Ready for Pickup',
      IN_TRANSIT: 'In Progress',
      DELIVERED: 'Done',
      CANCELLED: 'Canceled',
      PENDING: 'Preparing',
      CONFIRMED: 'Confirmed',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
        return colors.primary;
      case 'ASSIGNED':
        return colors.status.warning;
      case 'DELIVERED':
        return colors.status.success;
      default:
        return colors.text.secondary.dark;
    }
  };

  const bgColor = isDark ? colors.background.dark : colors.background.light;
  const cardBg = isDark ? colors.card.dark : colors.card.light;
  const textPrimary = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const textSecondary = isDark ? colors.text.secondary.dark : colors.text.secondary.light;
  const borderColor = isDark ? colors.border.dark : colors.border.light;

  const renderOrderItem = ({ item, index }: { item: any; index: number }) => {
    const isActive = item.status === 'IN_TRANSIT';
    const isPending = item.status === 'ASSIGNED' || item.status === 'PENDING';
    const isPreparing = item.status === 'PENDING';

    return (
      <TouchableOpacity
        style={[
          styles.orderCard,
          {
            backgroundColor: cardBg,
            borderColor: isActive ? colors.primary : borderColor,
            borderLeftWidth: isActive ? 4 : 1,
            opacity: isPreparing ? 0.8 : 1,
          },
        ]}
        onPress={() => {
          const parent = navigation.getParent();
          if (parent) {
            (parent as any).navigate('OrderDetail', { orderId: item.id });
          }
        }}
      >
        <View style={styles.orderCardHeader}>
          <View style={styles.orderCardLeft}>
            <View
              style={[
                styles.orderIconContainer,
                {
                  backgroundColor: isActive
                    ? `${colors.primary}20`
                    : isDark
                    ? '#233648'
                    : '#f1f5f9',
                },
              ]}
            >
              <MaterialIcons
                name={isActive ? 'package-2' : 'inventory-2'}
                size={20}
                color={isActive ? colors.primary : textSecondary}
              />
            </View>
            <View>
              <Text style={[styles.orderNumber, { color: textPrimary }]}>
                {item.order_display_number || `#ORD-${item.id.slice(-4)}`}
              </Text>
              <Text
                style={[
                  styles.orderStatus,
                  { color: isActive ? colors.primary : textSecondary },
                ]}
              >
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.chevronButton, { backgroundColor: isDark ? '#233648' : '#f1f5f9' }]}
          >
            <MaterialIcons name="chevron-right" size={20} color={textSecondary} />
          </TouchableOpacity>
        </View>

        {isActive && (
          <>
            <View style={[styles.divider, { backgroundColor: borderColor }]} />
            <View style={styles.orderDetails}>
              <View style={styles.orderDetailRow}>
                <MaterialIcons name="person" size={18} color={textSecondary} />
                <Text style={[styles.orderDetailText, { color: textPrimary }]}>
                  {item.customer_snapshot?.name || 'Customer Name'}
                </Text>
              </View>
              <View style={styles.orderDetailRow}>
                <MaterialIcons name="location-on" size={18} color={textSecondary} />
                <Text style={[styles.orderDetailText, { color: textPrimary }]} numberOfLines={2}>
                  {item.delivery_address?.address || 'Address not available'}
                </Text>
              </View>
              <View style={styles.orderDetailRow}>
                <MaterialIcons name="schedule" size={18} color={colors.status.warning} />
                <Text style={[styles.orderDetailText, { color: colors.status.warning }]}>
                  Due by {item.estimated_delivery_at ? new Date(item.estimated_delivery_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.orderActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => {
                  const parent = navigation.getParent();
                  if (parent) {
                    (parent as any).navigate('OrderDetail', { orderId: item.id });
                  }
                }}
              >
                <Text style={styles.actionButtonText}>Complete Delivery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton, { backgroundColor: isDark ? '#233648' : '#f1f5f9' }]}
              >
                <MaterialIcons name="call" size={20} color={textPrimary} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {!isActive && (
          <View style={styles.orderCardContent}>
            <Text style={[styles.orderAddress, { color: textPrimary }]} numberOfLines={1}>
              {item.delivery_address?.address || 'Address not available'}
            </Text>
            <Text style={[styles.orderMeta, { color: textSecondary }]}>
              Due {item.estimated_delivery_at ? new Date(item.estimated_delivery_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'} • {item.customer_snapshot?.name || 'Customer'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Top App Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark ? `${colors.background.dark}E6` : `${colors.background.light}E6`,
            borderBottomColor: borderColor,
          },
        ]}
      >
        <TouchableOpacity style={styles.topBarButton}>
          <MaterialIcons name="filter-list" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: textPrimary }]}>Assigned Orders</Text>
        <TouchableOpacity
          style={[styles.avatarButton, { borderColor: borderColor }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.first_name?.[0] || 'D'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {/* Greeting & Date Header */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greeting, { color: textPrimary }]}>
            Good Morning, {user?.first_name || 'Driver'}
          </Text>
          <Text style={[styles.dateTime, { color: textSecondary }]}>
            {currentDate} • {currentTime}
          </Text>
        </View>

        {/* Stats Dashboard */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          {/* Pending Card */}
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
                minWidth: 140,
              },
            ]}
          >
            <View style={styles.statCardHeader}>
              <MaterialIcons name="pending-actions" size={20} color={colors.status.warning} />
              <Text style={[styles.statCardLabel, { color: textSecondary }]}>Pending</Text>
            </View>
            <Text style={[styles.statCardValue, { color: textPrimary }]}>{pendingCount}</Text>
          </View>

          {/* In Progress Card */}
          <View
            style={[
              styles.statCard,
              styles.statCardActive,
              {
                backgroundColor: colors.primary,
                minWidth: 140,
              },
            ]}
          >
            <View style={styles.statCardHeader}>
              <MaterialIcons name="local-shipping" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={[styles.statCardLabel, { color: 'rgba(255,255,255,0.9)' }]}>
                In Progress
              </Text>
            </View>
            <Text style={[styles.statCardValue, { color: '#fff' }]}>{inProgressCount}</Text>
          </View>

          {/* Completed Card */}
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
                minWidth: 140,
              },
            ]}
          >
            <View style={styles.statCardHeader}>
              <MaterialIcons name="check-circle" size={20} color={colors.status.success} />
              <Text style={[styles.statCardLabel, { color: textSecondary }]}>Done</Text>
            </View>
            <Text style={[styles.statCardValue, { color: textPrimary }]}>{completedCount}</Text>
          </View>
        </ScrollView>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Today's Route</Text>
          <TouchableOpacity>
            <Text style={[styles.viewMapText, { color: colors.primary }]}>View Map</Text>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.center}>
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              No hay órdenes disponibles
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((item: any, index: number) => (
              <View key={item.id}>{renderOrderItem({ item, index })}</View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topBarButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  greetingSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  dateTime: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statCardActive: {
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statCardLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statCardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
    letterSpacing: -1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewMapText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ordersList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  orderCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  orderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  chevronButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 12,
  },
  orderDetails: {
    gap: 8,
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  orderDetailText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  callButton: {
    width: 42,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  orderCardContent: {
    paddingLeft: 52,
    gap: 4,
  },
  orderAddress: {
    fontSize: 14,
  },
  orderMeta: {
    fontSize: 12,
  },
  center: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  bottomSpacing: {
    height: 24,
  },
});

