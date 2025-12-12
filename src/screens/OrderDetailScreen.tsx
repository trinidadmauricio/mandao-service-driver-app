/**
 * Pantalla de Detalle de Orden - Rediseñada basada en order-detail.html
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
  useColorScheme,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useOrder, useUpdateOrderStatus } from '../hooks/useOrders';
import { colors } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const { data: order, isLoading } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const [isProcessing, setIsProcessing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAccept = async () => {
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
  };

  const bgColor = isDark ? colors.background.dark : colors.background.light;
  const cardBg = isDark ? '#1a2632' : '#ffffff';
  const textPrimary = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const textSecondary = isDark ? colors.text.secondary.dark : colors.text.secondary.light;
  const borderColor = isDark ? colors.border.dark : colors.border.light;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <Text style={[styles.errorText, { color: colors.status.error }]}>
          Orden no encontrada
        </Text>
      </View>
    );
  }

  const getStatusBadge = () => {
    const status = order.status;
    if (status === 'ASSIGNED' || status === 'PENDING') {
      return {
        bg: `${colors.status.warning}33`,
        text: colors.status.warning,
        label: 'Pending Acceptance',
      };
    }
    if (status === 'IN_TRANSIT') {
      return {
        bg: `${colors.primary}33`,
        text: colors.primary,
        label: 'In Transit',
      };
    }
    return {
      bg: `${colors.status.success}33`,
      text: colors.status.success,
      label: status,
    };
  };

  const statusBadge = getStatusBadge();
  const customerName = order.customer_snapshot?.name || 'Customer Name';
  const customerPhone = order.customer_snapshot?.phone;
  const deliveryAddress = order.delivery_address?.address || 'Address not available';
  const deliveryCity = order.delivery_address?.city || '';
  const estimatedTime = order.estimated_delivery_at
    ? new Date(order.estimated_delivery_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  // Mock items - en producción vendría del backend
  const orderItems = [
    { quantity: 1, name: 'Margherita Pizza', notes: 'Extra Cheese', price: 12.5 },
    { quantity: 2, name: 'Coke Zero', notes: 'Can 330ml', price: 4.0 },
  ];
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tip = 4.0;
  const estimatedPayout = subtotal + tip;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status & Map Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusBadge.bg,
                  borderColor: `${statusBadge.text}33`,
                },
              ]}
            >
              <MaterialIcons name="schedule" size={18} color={statusBadge.text} />
              <Text style={[styles.statusBadgeText, { color: statusBadge.text }]}>
                {statusBadge.label}
              </Text>
            </View>
            <Text style={[styles.expectedTime, { color: textSecondary }]}>
              Expected by {estimatedTime}
            </Text>
          </View>

          {/* Map Placeholder */}
          <View
            style={[
              styles.mapContainer,
              {
                backgroundColor: isDark ? '#233648' : '#e2e8f0',
                borderColor: borderColor,
              },
            ]}
          >
            <View style={styles.mapPlaceholder}>
              <MaterialIcons name="map" size={48} color={textSecondary} />
              <Text style={[styles.mapPlaceholderText, { color: textSecondary }]}>Map View</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.mapButton,
                {
                  backgroundColor: cardBg,
                  borderColor: borderColor,
                },
              ]}
            >
              <MaterialIcons name="near-me" size={20} color={textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Customer</Text>
          <View
            style={[
              styles.customerCard,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
          >
            {/* Profile Header */}
            <View
              style={[
                styles.customerHeader,
                {
                  borderBottomColor: borderColor,
                },
              ]}
            >
              <View style={styles.customerInfo}>
                <View
                  style={[
                    styles.customerAvatar,
                    {
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  <Text style={styles.customerAvatarText}>{customerName[0]}</Text>
                </View>
                <View style={styles.customerDetails}>
                  <Text style={[styles.customerName, { color: textPrimary }]}>{customerName}</Text>
                  <View style={styles.ratingRow}>
                    <MaterialIcons name="star" size={16} color={colors.status.warning} />
                    <Text style={[styles.ratingText, { color: textSecondary }]}>
                      4.9 (12 orders)
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.customerActions}>
                <TouchableOpacity
                  style={[
                    styles.actionIconButton,
                    {
                      backgroundColor: isDark ? '#233648' : '#f1f5f9',
                    },
                  ]}
                >
                  <MaterialIcons name="call" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionIconButton,
                    {
                      backgroundColor: isDark ? '#233648' : '#f1f5f9',
                    },
                  ]}
                >
                  <MaterialIcons name="chat" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Address Details */}
            <View style={styles.addressSection}>
              <View style={styles.addressRow}>
                <MaterialIcons name="location-on" size={20} color={colors.primary} />
                <View style={styles.addressDetails}>
                  <Text style={[styles.addressText, { color: textPrimary }]}>
                    {deliveryAddress}
                  </Text>
                  <Text style={[styles.addressCity, { color: textSecondary }]}>
                    {deliveryCity || 'City'}
                  </Text>
                  <View
                    style={[
                      styles.distanceBadge,
                      {
                        backgroundColor: isDark ? '#233648' : '#f1f5f9',
                      },
                    ]}
                  >
                    <MaterialIcons name="distance" size={14} color={textSecondary} />
                    <Text style={[styles.distanceText, { color: textSecondary }]}>
                      2.4 mi away
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.navigateButton,
                  {
                    backgroundColor: `${colors.primary}1A`,
                  },
                ]}
              >
                <MaterialIcons name="navigation" size={18} color={colors.primary} />
                <Text style={[styles.navigateButtonText, { color: colors.primary }]}>
                  Navigate to Destination
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Order Manifest */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Order Items</Text>
            <Text style={[styles.itemCount, { color: textSecondary }]}>
              {orderItems.length} Items
            </Text>
          </View>
          <View
            style={[
              styles.itemsCard,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
          >
            {orderItems.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.orderItemLeft}>
                  <View
                    style={[
                      styles.quantityBadge,
                      {
                        backgroundColor: isDark ? '#233648' : '#f1f5f9',
                      },
                    ]}
                  >
                    <Text style={[styles.quantityText, { color: textPrimary }]}>
                      {item.quantity}x
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.itemName, { color: textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.itemNotes, { color: textSecondary }]}>{item.notes}</Text>
                  </View>
                </View>
                <Text style={[styles.itemPrice, { color: textPrimary }]}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            {/* Customer Note */}
            {order.notes && (
              <>
                <View style={[styles.divider, { backgroundColor: borderColor }]} />
                <View
                  style={[
                    styles.customerNote,
                    {
                      backgroundColor: `${colors.primary}1A`,
                      borderColor: `${colors.primary}33`,
                    },
                  ]}
                >
                  <MaterialIcons name="info" size={20} color={colors.primary} />
                  <View style={styles.noteContent}>
                    <Text style={[styles.noteLabel, { color: colors.primary }]}>
                      CUSTOMER NOTE
                    </Text>
                    <Text style={[styles.noteText, { color: textPrimary }]}>{order.notes}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Financials */}
        <View style={styles.section}>
          <View
            style={[
              styles.payoutCard,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <View style={styles.payoutContent}>
              <Text style={styles.payoutLabel}>Estimated Payout</Text>
              <View style={styles.payoutAmountRow}>
                <Text style={styles.payoutAmount}>${estimatedPayout.toFixed(2)}</Text>
                <Text style={styles.payoutTip}>(includes ${tip.toFixed(2)} tip)</Text>
              </View>
            </View>
            <View style={styles.payoutIcon}>
              <MaterialIcons name="payments" size={24} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Sticky Footer */}
      {order.status === 'ASSIGNED' || order.status === 'PENDING' ? (
        <View
          style={[
            styles.stickyFooter,
            {
              backgroundColor: bgColor,
              borderTopColor: borderColor,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.acceptButton,
              {
                backgroundColor: colors.primary,
              },
              isProcessing && styles.buttonDisabled,
            ]}
            onPress={handleAccept}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.acceptButtonText}>Accept Order</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  statusSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  expectedTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  mapContainer: {
    width: '100%',
    height: 192,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
  },
  mapButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 14,
  },
  customerCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressSection: {
    gap: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  addressDetails: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
  },
  addressCity: {
    fontSize: 14,
    marginTop: 4,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: 8,
    marginTop: 8,
  },
  navigateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemsCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  quantityBadge: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemNotes: {
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  customerNote: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  noteContent: {
    flex: 1,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
  },
  payoutCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  payoutContent: {
    flex: 1,
  },
  payoutLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  payoutAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  payoutAmount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  payoutTip: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  payoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacing: {
    height: 16,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
