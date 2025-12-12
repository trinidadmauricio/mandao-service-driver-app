/**
 * Pantalla de Reportes - Basada en reports.html
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Reports'>;

type Period = 'today' | 'weekly' | 'monthly';

interface Trip {
  id: string;
  orderNumber: string;
  location: string;
  time: string;
  amount: number;
  tip?: number;
}

// Mock data - en producción vendría del backend
const mockTrips: Trip[] = [
  { id: '1', orderNumber: '#2931', location: 'Downtown', time: '20 min ago', amount: 14.5, tip: 3.0 },
  { id: '2', orderNumber: '#2930', location: 'Westside', time: '1h ago', amount: 22.0, tip: 5.0 },
  { id: '3', orderNumber: '#2929', location: 'Uptown', time: '2h ago', amount: 18.25 },
  { id: '4', orderNumber: '#2928', location: 'Suburbs', time: '3h ago', amount: 34.5, tip: 8.5 },
];

export default function ReportsScreen({}: Props) {
  const [period, setPeriod] = useState<Period>('weekly');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? colors.background.dark : colors.background.light;
  const cardBg = isDark ? colors.surface.dark : colors.surface.light;
  const textPrimary = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const textSecondary = isDark ? colors.text.secondary.dark : colors.text.secondary.light;
  const borderColor = isDark ? colors.border.dark : colors.border.light;

  // Mock earnings data - en producción vendría del backend
  const totalEarnings = 1240.5;
  const trendAmount = 52.0;
  const deliveries = 45;
  const rating = 4.9;
  const tips = 145;
  const hours = 32;

  // Mock chart data - en producción vendría del backend
  const chartData = [40, 65, 50, 85, 90, 100, 60]; // Porcentajes para cada día

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? `${colors.background.dark}F2` : `${colors.background.light}F2`,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Reports</Text>
        <TouchableOpacity style={styles.shareButton}>
          <MaterialIcons name="ios-share" size={24} color={textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          <View
            style={[
              styles.periodContainer,
              {
                backgroundColor: isDark ? '#1C252E' : '#e5e7eb',
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.periodOption,
                period === 'today' && {
                  backgroundColor: isDark ? '#2C3B4E' : '#ffffff',
                },
              ]}
              onPress={() => setPeriod('today')}
            >
              <Text
                style={[
                  styles.periodText,
                  {
                    color: period === 'today' ? colors.primary : textSecondary,
                  },
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodOption,
                period === 'weekly' && {
                  backgroundColor: isDark ? '#2C3B4E' : '#ffffff',
                },
              ]}
              onPress={() => setPeriod('weekly')}
            >
              <Text
                style={[
                  styles.periodText,
                  {
                    color: period === 'weekly' ? colors.primary : textSecondary,
                  },
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodOption,
                period === 'monthly' && {
                  backgroundColor: isDark ? '#2C3B4E' : '#ffffff',
                },
              ]}
              onPress={() => setPeriod('monthly')}
            >
              <Text
                style={[
                  styles.periodText,
                  {
                    color: period === 'monthly' ? colors.primary : textSecondary,
                  },
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Earnings Hero */}
        <View style={styles.earningsHero}>
          <Text style={[styles.earningsLabel, { color: textSecondary }]}>TOTAL EARNINGS</Text>
          <Text style={[styles.earningsAmount, { color: textPrimary }]}>
            ${totalEarnings.toFixed(2)}
          </Text>
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: `${colors.status.success}33`,
              },
            ]}
          >
            <MaterialIcons name="trending-up" size={16} color={colors.status.success} />
            <Text style={[styles.trendText, { color: colors.status.success }]}>
              +${trendAmount.toFixed(2)} vs last week
            </Text>
          </View>
        </View>

        {/* Performance Grid */}
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
            <View style={styles.statCardHeader}>
              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor: `${colors.primary}33`,
                  },
                ]}
              >
                <MaterialIcons name="local-shipping" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.statLabel, { color: textSecondary }]}>Deliveries</Text>
            </View>
            <Text style={[styles.statValue, { color: textPrimary }]}>{deliveries}</Text>
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
            <View style={styles.statCardHeader}>
              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor: `${colors.status.warning}33`,
                  },
                ]}
              >
                <MaterialIcons name="star" size={20} color={colors.status.warning} />
              </View>
              <Text style={[styles.statLabel, { color: textSecondary }]}>Rating</Text>
            </View>
            <Text style={[styles.statValue, { color: textPrimary }]}>{rating}</Text>
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
            <View style={styles.statCardHeader}>
              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor: `${colors.status.success}33`,
                  },
                ]}
              >
                <MaterialIcons name="attach-money" size={20} color={colors.status.success} />
              </View>
              <Text style={[styles.statLabel, { color: textSecondary }]}>Tips</Text>
            </View>
            <Text style={[styles.statValue, { color: textPrimary }]}>${tips}</Text>
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
            <View style={styles.statCardHeader}>
              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor: `${colors.primary}33`,
                  },
                ]}
              >
                <MaterialIcons name="schedule" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.statLabel, { color: textSecondary }]}>Hours</Text>
            </View>
            <Text style={[styles.statValue, { color: textPrimary }]}>{hours}h</Text>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View
            style={[
              styles.chartCard,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
          >
            <View style={styles.chartHeader}>
              <View>
                <Text style={[styles.chartTitle, { color: textPrimary }]}>Earnings Trend</Text>
                <Text style={[styles.chartSubtitle, { color: textSecondary }]}>
                  Sep 18 - Sep 24
                </Text>
              </View>
              <TouchableOpacity>
                <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
                  View Details
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bar Chart Visualization */}
            <View style={styles.chartContainer}>
              {chartData.map((height, index) => {
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const isHighest = height === Math.max(...chartData);
                return (
                  <View key={index} style={styles.chartBar}>
                    <View style={styles.chartBarContainer}>
                      <View
                        style={[
                          styles.chartBarFill,
                          {
                            height: `${height}%`,
                            backgroundColor: colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.chartBarLabel,
                        {
                          color: isHighest ? textPrimary : textSecondary,
                          fontWeight: isHighest ? 'bold' : '500',
                        },
                      ]}
                    >
                      {days[index]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Recent Trips */}
        <View style={styles.tripsSection}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Recent Trips</Text>
          <View style={styles.tripsList}>
            {mockTrips.map((trip) => (
              <View
                key={trip.id}
                style={[
                  styles.tripCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                  },
                ]}
              >
                <View style={styles.tripLeft}>
                  <View
                    style={[
                      styles.tripIcon,
                      {
                        backgroundColor: isDark ? '#2C3B4E' : '#f3f4f6',
                      },
                    ]}
                  >
                    <MaterialIcons name="package-2" size={20} color={textSecondary} />
                  </View>
                  <View>
                    <Text style={[styles.tripOrderNumber, { color: textPrimary }]}>
                      {trip.orderNumber}
                    </Text>
                    <Text style={[styles.tripMeta, { color: textSecondary }]}>
                      {trip.location} • {trip.time}
                    </Text>
                  </View>
                </View>
                <View style={styles.tripRight}>
                  <Text style={[styles.tripAmount, { color: colors.primary }]}>
                    ${trip.amount.toFixed(2)}
                  </Text>
                  {trip.tip && (
                    <Text style={[styles.tripTip, { color: colors.status.success }]}>
                      + ${trip.tip.toFixed(2)} Tip
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  periodSelector: {
    marginBottom: 24,
  },
  periodContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  earningsHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -1,
    marginBottom: 8,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 12,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    padding: 8,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    height: 160,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  chartBarContainer: {
    width: '100%',
    height: 128,
    backgroundColor: `${colors.primary}33`,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  chartBarFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 2,
  },
  chartBarLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  tripsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tripsList: {
    gap: 12,
  },
  tripCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tripIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripOrderNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  tripMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  tripRight: {
    alignItems: 'flex-end',
  },
  tripAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tripTip: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  bottomSpacing: {
    height: 24,
  },
});

