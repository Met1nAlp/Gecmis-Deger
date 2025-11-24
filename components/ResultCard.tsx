import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { assetThemes } from '../constants/theme';
import { CalculationResult } from '../types';

type ResultCardProps = {
  item: CalculationResult;
};

const getAssetStyle = (id: string): { icon: string; color: string } => {
  const iconMap: Record<string, string> = {
    btc: 'bitcoin', dolar: 'dollar-sign', euro: 'euro-sign', altin: 'coins', ons_altin: 'coins',
    minWage: 'wallet', stock: 'chart-line', inflation: 'percentage', car: 'car'
  };

  const theme = assetThemes[id];
  return {
    icon: iconMap[id] || 'question-circle',
    color: theme ? theme.primary : '#8E8E93'
  };
};

export const ResultCard = ({ item }: ResultCardProps) => {
  const { icon, color } = getAssetStyle(item.id);

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <FontAwesome5 name={icon as any} size={40} color={color} />
      </View>

      <Text style={styles.assetLabel}>{item.label}</Text>

      {item.amount && item.unit && (
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color }]}>
            {item.amount.toLocaleString('tr-TR', {
              maximumFractionDigits: item.id === 'btc' ? 8 : item.id === 'stock' ? 6 : 4,
              minimumFractionDigits: 0
            })}
          </Text>
          <Text style={styles.unit}> {item.unit}</Text>
        </View>
      )}

      <View style={styles.tlContainer}>
        <Text style={styles.tlLabel}>Bugünkü Değer</Text>
        <Text style={styles.tlValue}>
          ₺{item.value ? item.value.toLocaleString('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : '0,00'}
        </Text>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.pricesContainer}>
        {item.pastPrice && item.unit && (
          <View style={[styles.priceItem, { backgroundColor: '#fff3e0' }]}>
            <Text style={[styles.priceLabel, { color: '#e67e22' }]}>O günkü kur</Text>
            <Text style={[styles.priceValue, { color: '#d35400' }]}>
              1 {item.unit} = ₺{item.pastPrice.toLocaleString('tr-TR', { maximumFractionDigits: 4, minimumFractionDigits: 2 })}
            </Text>
          </View>
        )}
        {item.currentPrice && item.unit && (
          <View style={[styles.priceItem, { backgroundColor: '#e8f5e9' }]}>
            <Text style={[styles.priceLabel, { color: '#2e7d32' }]}>Bugünkü kur</Text>
            <Text style={[styles.priceValue, { color: '#1b5e20' }]}>
              1 {item.unit} = ₺{item.currentPrice.toLocaleString('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
  iconContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  assetLabel: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 24, letterSpacing: -0.5 },
  amountContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 },
  amount: { fontSize: 48, fontWeight: '800', letterSpacing: -1 },
  unit: { fontSize: 20, fontWeight: '600', color: '#8A8A8E', marginLeft: 4 },
  tlContainer: { backgroundColor: '#f8f9fa', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, marginBottom: 20, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#e9ecef' },
  tlLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  tlValue: { fontSize: 28, fontWeight: '800', color: '#2c3e50' },
  description: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  pricesContainer: { width: '100%', gap: 10 },
  priceItem: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 14, fontWeight: '600' },
  priceValue: { fontSize: 15, fontWeight: '700' },
});
