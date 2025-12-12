/**
 * Pantalla de Notificaciones - Basada en notifications.html
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/TabNavigator';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Notifications'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface Notification {
  id: string;
  type: 'order' | 'system' | 'payment';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionButton?: string;
}

// Mock notifications - en producción vendría del backend
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'New Delivery Request',
    message: "Pickup at Joe's Pizza • 2.5 miles away",
    time: '2m ago',
    isRead: false,
    actionButton: 'Accept Order',
  },
  {
    id: '2',
    type: 'order',
    title: 'Order #4800 Canceled',
    message: 'Customer canceled. Please return items to the hub.',
    time: '1h ago',
    isRead: true,
  },
  {
    id: '3',
    type: 'system',
    title: 'Weekly Bonus Live',
    message: 'Complete 5 more rides today to earn your $50 bonus.',
    time: '4h ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payout Processed',
    message: 'Your weekly earnings of $840.50 have been sent to your bank.',
    time: '1d ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'App Maintenance',
    message: 'Scheduled maintenance completed successfully.',
    time: '1d ago',
    isRead: true,
  },
];

export default function NotificationsScreen({}: Props) {
  const [filter, setFilter] = useState<'all' | 'orders' | 'system'>('all');
  const [notifications, setNotifications] = useState(mockNotifications);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? colors.background.dark : colors.background.light;
  const cardBg = isDark ? colors.surface.dark : colors.surface.light;
  const textPrimary = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const textSecondary = isDark ? colors.text.secondary.dark : colors.text.secondary.light;
  const borderColor = isDark ? colors.border.dark : colors.border.light;

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'all') return true;
    if (filter === 'orders') return notif.type === 'order';
    if (filter === 'system') return notif.type === 'system' || notif.type === 'payment';
    return true;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return 'local-shipping';
      case 'payment':
        return 'payments';
      case 'system':
        return 'campaign';
      default:
        return 'notifications';
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'order':
        return colors.primary;
      case 'payment':
        return colors.status.success;
      case 'system':
        return textSecondary;
      default:
        return textSecondary;
    }
  };

  const getNotificationIconBg = (type: string) => {
    switch (type) {
      case 'order':
        return `${colors.primary}1A`;
      case 'payment':
        return `${colors.status.success}33`;
      case 'system':
        return isDark ? '#233648' : '#f1f5f9';
      default:
        return isDark ? '#233648' : '#f1f5f9';
    }
  };

  const groupNotificationsByDate = () => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const older: Notification[] = [];

    filteredNotifications.forEach((notif) => {
      if (notif.time.includes('m ago') || notif.time.includes('h ago')) {
        today.push(notif);
      } else if (notif.time.includes('d ago')) {
        const days = parseInt(notif.time);
        if (days === 1) {
          yesterday.push(notif);
        } else {
          older.push(notif);
        }
      } else {
        today.push(notif);
      }
    });

    return { today, yesterday, older };
  };

  const { today, yesterday, older } = groupNotificationsByDate();

  const renderNotification = (notif: Notification) => (
    <TouchableOpacity
      key={notif.id}
      style={[
        styles.notificationCard,
        {
          backgroundColor: cardBg,
          borderColor: borderColor,
          opacity: notif.isRead ? 0.75 : 1,
        },
      ]}
    >
      {!notif.isRead && (
        <View
          style={[
            styles.unreadDot,
            {
              backgroundColor: colors.primary,
            },
          ]}
        />
      )}
      <View style={styles.notificationContent}>
        <View
          style={[
            styles.notificationIcon,
            {
              backgroundColor: getNotificationIconBg(notif.type),
            },
          ]}
        >
          <MaterialIcons
            name={getNotificationIcon(notif.type) as any}
            size={24}
            color={getNotificationIconColor(notif.type)}
          />
        </View>
        <View style={styles.notificationText}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationTitle, { color: textPrimary }]}>{notif.title}</Text>
            <Text style={[styles.notificationTime, { color: textSecondary }]}>{notif.time}</Text>
          </View>
          <Text style={[styles.notificationMessage, { color: textSecondary }]}>
            {notif.message}
          </Text>
          {notif.actionButton && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Text style={styles.actionButtonText}>{notif.actionButton}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header Section */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? `${colors.background.dark}F2` : `${colors.background.light}F2`,
            borderBottomColor: borderColor,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Notifications</Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={[styles.markAllRead, { color: colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === 'all' && {
                backgroundColor: colors.primary,
              },
              filter !== 'all' && {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
            onPress={() => setFilter('all')}
          >
            <MaterialIcons
              name="check"
              size={20}
              color={filter === 'all' ? '#fff' : textSecondary}
            />
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === 'all' ? '#fff' : textSecondary,
                },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === 'orders' && {
                backgroundColor: colors.primary,
              },
              filter !== 'orders' && {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
            onPress={() => setFilter('orders')}
          >
            <MaterialIcons
              name="package-2"
              size={20}
              color={filter === 'orders' ? '#fff' : textSecondary}
            />
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === 'orders' ? '#fff' : textSecondary,
                },
              ]}
            >
              Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === 'system' && {
                backgroundColor: colors.primary,
              },
              filter !== 'system' && {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
            onPress={() => setFilter('system')}
          >
            <MaterialIcons
              name="campaign"
              size={20}
              color={filter === 'system' ? '#fff' : textSecondary}
            />
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === 'system' ? '#fff' : textSecondary,
                },
              ]}
            >
              System
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today */}
        {today.length > 0 && (
          <>
            <View style={styles.timeGroup}>
              <Text style={[styles.timeGroupTitle, { color: textSecondary }]}>TODAY</Text>
            </View>
            {today.map(renderNotification)}
          </>
        )}

        {/* Yesterday */}
        {yesterday.length > 0 && (
          <>
            <View style={styles.timeGroup}>
              <Text style={[styles.timeGroupTitle, { color: textSecondary }]}>YESTERDAY</Text>
            </View>
            {yesterday.map(renderNotification)}
          </>
        )}

        {/* Older */}
        {older.length > 0 && (
          <>
            <View style={styles.timeGroup}>
              <Text style={[styles.timeGroupTitle, { color: textSecondary }]}>OLDER</Text>
            </View>
            {older.map(renderNotification)}
          </>
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
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  timeGroup: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  timeGroupTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  notificationCard: {
    position: 'relative',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 16,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});

