import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { assetThemes, colors } from '../constants/theme';
import { AssetId } from '../types';

// 3D Icons
const iconDollar = require('../assets/images/icon_dollar.png');
const iconEuro = require('../assets/images/icon_euro.png');
const iconGold = require('../assets/images/icon_gold.png');
const iconBitcoin = require('../assets/images/icon_bitcoin.png');
const iconCar = require('../assets/images/icon_car.png');
const iconStock = require('../assets/images/icon_stock.png');
const appLogo = require('../assets/images/app-logo.png');

const ASSETS: { id: AssetId; label: string; iconSource?: any; iconName?: string }[] = [
  { id: 'dolar', label: 'Dolar', iconSource: iconDollar },
  { id: 'euro', label: 'Euro', iconSource: iconEuro },
  { id: 'altin', label: 'Altın', iconSource: iconGold },
  { id: 'btc', label: 'Kripto Para', iconSource: iconBitcoin },
  { id: 'stock', label: 'Hisse Senedi', iconSource: iconStock },
  { id: 'car', label: 'Araba', iconSource: iconCar },
  { id: 'minWage', label: 'Asgari Ücret', iconName: 'wallet' },
  { id: 'inflation', label: 'Enflasyon', iconName: 'percentage' },
];

export default function SelectScreen() {
  const handleSelect = (assetId: AssetId) => {
    router.push({
      pathname: '/calculator',
      params: { assetId },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, '#E8EAF6']}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Image source={appLogo} style={styles.headerLogo} resizeMode="contain" />
              <Text style={styles.headerTitle}>Varlık Seçimi</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Ne Hesaplamak İstersiniz?</Text>
            <Text style={styles.subtitle}>Geçmişe dönük değer hesaplaması için bir varlık seçin.</Text>

            <View style={styles.grid}>
              {ASSETS.map((asset) => {
                const theme = assetThemes[asset.id];
                return (
                  <TouchableOpacity
                    key={asset.id}
                    activeOpacity={0.85}
                    onPress={() => handleSelect(asset.id)}
                    style={styles.card}
                  >
                    {asset.iconSource ? (
                      <Image source={asset.iconSource} style={styles.cardBgIcon} resizeMode="contain" />
                    ) : (
                      <View style={styles.iconBgWrapper}>
                        <FontAwesome5 name={asset.iconName as any} size={80} color={theme.primary} style={{ opacity: 0.15 }} />
                      </View>
                    )}
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardLabel}>{asset.label}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { padding: 10, backgroundColor: colors.cardBackground, borderRadius: 12, shadowColor: colors.primary, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogo: { width: 32, height: 32 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, marginBottom: 8, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: 24, lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '48%',
    height: 140,
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'flex-end',
  },
  cardBgIcon: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    top: -20,
    right: -20,
    opacity: 0.15,
  },
  iconBgWrapper: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  cardTextContainer: {
    zIndex: 1,
  },
  cardLabel: { fontSize: 18, fontWeight: '700', color: colors.text },
});
