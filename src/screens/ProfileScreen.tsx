/**
 * Pantalla de Perfil - Rediseñada basada en profile.html
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentUser, useDriver } from '../hooks/useProfile';
import { colors } from '../theme/colors';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/TabNavigator';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const { data: driver, isLoading: isLoadingDriver } = useDriver((user as any)?.driver_id);
  const [isOnline, setIsOnline] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isLoadingUser || isLoadingDriver) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const bgColor = isDark ? colors.background.dark : colors.background.light;
  const cardBg = isDark ? '#1b2b3a' : '#ffffff';
  const textPrimary = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const textSecondary = isDark ? colors.text.secondary.dark : colors.text.secondary.light;
  const borderColor = isDark ? '#324d67' : colors.border.light;
  const fullName = `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'Driver';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Top App Bar */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? `${colors.background.dark}F2` : `${colors.background.light}F2`,
          },
        ]}
      >
        <TouchableOpacity style={styles.headerButton}>
          <MaterialIcons name="arrow-back-ios" size={20} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Profile</Text>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialIcons name="settings" size={24} color={textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                {
                  borderColor: borderColor,
                },
              ]}
            >
              <View
                style={[
                  styles.avatarInner,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Text style={styles.avatarText}>{fullName[0] || 'D'}</Text>
              </View>
            </View>
            <View
              style={[
                styles.editBadge,
                {
                  backgroundColor: colors.primary,
                  borderColor: bgColor,
                },
              ]}
            >
              <MaterialIcons name="edit" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: textPrimary }]}>{fullName}</Text>
            <View style={styles.tierRow}>
              <MaterialIcons name="directions-car" size={18} color={textSecondary} />
              <Text style={[styles.tierText, { color: textSecondary }]}>
                Silver Tier • {driver?.vehicle?.model || 'Vehicle Model'}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Toggle Card */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: cardBg,
              borderColor: borderColor,
            },
          ]}
        >
          <View style={styles.statusContent}>
            <Text style={[styles.statusTitle, { color: textPrimary }]}>You are Online</Text>
            <View style={styles.statusSubtitle}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isOnline ? colors.status.success : colors.text.secondary.dark,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isOnline ? colors.status.success : textSecondary,
                  },
                ]}
              >
                {isOnline ? 'Receiving orders' : 'Offline'}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: isDark ? '#233648' : '#e2e8f0', true: colors.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: textPrimary }]}>
              {driver?.rating_avg?.toFixed(2) || '4.95'}
            </Text>
            <View style={styles.statLabelRow}>
              <MaterialIcons name="star" size={16} color={colors.status.warning} />
              <Text style={[styles.statLabel, { color: textSecondary }]}>Rating</Text>
            </View>
          </View>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: textPrimary }]}>
              {driver?.total_deliveries || '1,240'}
            </Text>
            <View style={styles.statLabelRow}>
              <MaterialIcons name="local-shipping" size={16} color={textSecondary} />
              <Text style={[styles.statLabel, { color: textSecondary }]}>Deliveries</Text>
            </View>
          </View>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: textPrimary }]}>98%</Text>
            <View style={styles.statLabelRow}>
              <MaterialIcons name="check-circle" size={16} color={textSecondary} />
              <Text style={[styles.statLabel, { color: textSecondary }]}>Acceptance</Text>
            </View>
          </View>
        </View>

        {/* Menu List */}
        <View style={styles.menuList}>
          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
            onPress={() => {
              const parent = navigation.getParent();
              if (parent && driver?.vehicle_id) {
                (parent as any).navigate('Vehicle', { vehicleId: driver.vehicle_id });
              }
            }}
          >
            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor: `${colors.primary}1A`,
                },
              ]}
            >
              <MaterialIcons name="directions-car" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: textPrimary }]}>Vehicle Information</Text>
            <MaterialIcons name="chevron-right" size={20} color={textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
            onPress={() => {
              const parent = navigation.getParent();
              if (parent) {
                (parent as any).navigate('Reports');
              }
            }}
          >
            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor: `${colors.primary}1A`,
                },
              ]}
            >
              <MaterialIcons name="payments" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: textPrimary }]}>Earnings History</Text>
            <MaterialIcons name="chevron-right" size={20} color={textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
          >
            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor: `${colors.primary}1A`,
                },
              ]}
            >
              <MaterialIcons name="description" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuText, { color: textPrimary }]}>Documents</Text>
              <View style={styles.badge}>
                <View style={[styles.badgeDot, { backgroundColor: colors.status.error }]} />
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
          >
            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor: `${colors.primary}1A`,
                },
              ]}
            >
              <MaterialIcons name="account-balance-wallet" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: textPrimary }]}>Payout Methods</Text>
            <MaterialIcons name="chevron-right" size={20} color={textSecondary} />
          </TouchableOpacity>

          {/* Log Out Button */}
          <TouchableOpacity
            style={[styles.logoutButton, { marginTop: 16 }]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutText, { color: colors.status.error }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    alignItems: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusContent: {
    flex: 1,
    gap: 4,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  menuList: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  badge: {
    position: 'relative',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 24,
  },
});
