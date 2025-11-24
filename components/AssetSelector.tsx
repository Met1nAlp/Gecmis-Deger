// DOSYA YOLU: components/AssetSelector.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { assetThemes } from '../constants/theme';
import { Asset, AssetId } from '../types';
import { FontAwesome5 } from '@expo/vector-icons';

const ASSETS: Asset[] = [
  { id: 'dolar', label: 'Dolar', icon: 'dollar-sign', color: assetThemes.dolar.primary },
  { id: 'euro', label: 'Euro', icon: 'euro-sign', color: assetThemes.euro.primary },
  { id: 'stock', label: 'Hisse Senedi', icon: 'chart-line', color: assetThemes.stock.primary },
  { id: 'btc', label: 'Kripto Para', icon: 'bitcoin', color: assetThemes.btc.primary },
  { id: 'altin', label: 'Gram Altın', icon: 'coins', color: assetThemes.altin.primary },
  { id: 'ons_altin', label: 'Ons Altın (USD)', icon: 'dot-circle', color: '#f0b90b' },
  { id: 'car', label: 'Araba', icon: 'car', color: assetThemes.car.primary },
  { id: 'inflation', label: 'Enflasyon', icon: 'percentage', color: assetThemes.inflation.primary },
  { id: 'minWage', label: 'Asgari Ücret', icon: 'wallet', color: assetThemes.minWage.primary },
  { id: 'portfolio', label: 'Portföyüm', icon: 'briefcase', color: '#667eea' } as any,
];

export const AssetSelector = () => {
  const handlePress = (id: AssetId | 'portfolio') => {
    if (id === 'portfolio') {
      router.push('/portfolio');
    } else {
      router.push({ pathname: '/calculator', params: { assetId: id } });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Neyle Karşılaştırmak İstersin?</Text>
      <View style={styles.grid}>
        {ASSETS.map((asset) => (
          <TouchableOpacity
            key={asset.id}
            style={[styles.chip, { borderColor: asset.color }]}
            onPress={() => handlePress(asset.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: asset.color }]}>
              <FontAwesome5 name={asset.icon as any} size={24} color="#FFF" />
            </View>
            <Text style={styles.chipText}>{asset.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
});