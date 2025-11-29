import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../components/GlassCard';
import { assetThemes, colors } from '../constants/theme';
import { useCalculatorHook } from '../hooks/useCalculatorHook';
import { AssetId } from '../types';

// 3D Icons
const iconDollar = require('../assets/images/icon_dollar.png');
const iconEuro = require('../assets/images/icon_euro.png');
const iconGold = require('../assets/images/icon_gold.png');
const iconBitcoin = require('../assets/images/icon_bitcoin.png');
const iconCar = require('../assets/images/icon_car.png');
const iconStock = require('../assets/images/icon_stock.png');

const ICONS: Record<string, any> = {
  dolar: iconDollar,
  euro: iconEuro,
  altin: iconGold,
  btc: iconBitcoin,
  car: iconCar,
  stock: iconStock,
};

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const { loading, result, error, calculate } = useCalculatorHook();

  const assetId = params.assetId as AssetId;
  const theme = assetThemes[assetId || 'dolar'];
  const iconSource = ICONS[assetId || 'dolar'];

  useEffect(() => {
    if (params.amount && params.date) {
      calculate(
        Number(params.amount),
        new Date(params.date as string),
        params.assetId as AssetId,
        params.stockSymbol as string,
        params.cryptoId as string,
        params.carId as string
      );
    }
  }, [params.amount, params.date, params.assetId, params.cryptoId, params.stockSymbol, params.carId, calculate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getProfitLossColor = () => {
    if (!result) return colors.text;
    return result.profit >= 0 ? colors.success : colors.danger;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, theme.primary ? theme.primary + '15' : '#E8EAF6']}
        style={styles.background}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Image source={require('../assets/images/app-logo.png')} style={styles.headerLogo} resizeMode="contain" />
            <View>
              <Text style={styles.headerTitle}>Sonuçlar</Text>
              <Text style={styles.headerSubtitle}>Hesaplama Detayı</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Hesaplanıyor...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={48} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : result ? (
            <>
              <GlassCard style={[styles.resultCard, { backgroundColor: theme.primary ? theme.primary + '05' : colors.cardBackground }]}>
                <View style={styles.resultHeader}>
                  {iconSource ? (
                    <Image source={iconSource} style={styles.resultIcon} resizeMode="contain" />
                  ) : (
                    <FontAwesome5 name={assetId === 'minWage' ? 'wallet' : 'percentage'} size={100} color={theme.primary} />
                  )}
                </View>
                <Text style={styles.resultLabel}>Toplam Değer</Text>
                <Text style={styles.resultValue} adjustsFontSizeToFit numberOfLines={1}>{formatCurrency(result.currentValue)}</Text>

                <View style={styles.divider} />

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>İlk Yatırım</Text>
                  <Text style={styles.rowValue}>{formatCurrency(result.initialAmount)}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Kar / Zarar</Text>
                  <Text style={[styles.rowValue, { color: getProfitLossColor() }]}>
                    {result.profit >= 0 ? '+' : ''}{formatCurrency(result.profit)}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Değişim Oranı</Text>
                  <View style={[styles.badge, { backgroundColor: result.profit >= 0 ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)' }]}>
                    <MaterialCommunityIcons
                      name={result.profit >= 0 ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={getProfitLossColor()}
                    />
                    <Text style={[styles.badgeText, { color: getProfitLossColor() }]}>
                      %{Math.abs(result.percentageChange).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </GlassCard>

              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Detaylar</Text>
                <GlassCard style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {assetId === 'car' ? 'O Zamanki Fiyat' : assetId === 'minWage' ? 'O Zamanki Asgari Ücret' : assetId === 'inflation' ? 'Başlangıç Değeri' : 'Alış Kuru'}
                    </Text>
                    <Text style={styles.detailValue}>
                      {result.initialRate.toFixed(assetId === 'car' || assetId === 'minWage' ? 0 : 4)} ₺
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {assetId === 'car' ? 'Güncel Fiyat' : assetId === 'minWage' ? 'Güncel Asgari Ücret' : assetId === 'inflation' ? 'Güncel Değer' : 'Güncel Kur'}
                    </Text>
                    <Text style={styles.detailValue}>
                      {result.currentRate.toFixed(assetId === 'car' || assetId === 'minWage' ? 0 : 4)} ₺
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tarih</Text>
                    <Text style={styles.detailValue}>
                      {new Date(params.date as string).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                </GlassCard>
              </View>

              <TouchableOpacity
                style={styles.homeButton}
                onPress={() => router.push('/')}
              >
                <LinearGradient
                  colors={[colors.primary, '#153558']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <FontAwesome5 name="home" size={20} color="#FFF" />
                  <Text style={styles.homeButtonText}>ANA SAYFAYA DÖN</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 16 },
  headerLogo: { width: 40, height: 40, marginRight: 12, borderRadius: 20 },
  backButton: { padding: 10, backgroundColor: colors.cardBackground, borderRadius: 12, shadowColor: colors.primary, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120 },
  loadingText: { marginTop: 20, fontSize: 16, color: colors.textSecondary, fontWeight: '600' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, padding: 24 },
  errorText: { marginTop: 20, fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: 28, lineHeight: 24 },
  retryButton: { paddingHorizontal: 32, paddingVertical: 14, backgroundColor: colors.primary, borderRadius: 12, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  retryButtonText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  resultCard: { padding: 32, borderRadius: 20, marginBottom: 24 },
  resultHeader: { alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  resultIcon: { width: 200, height: 200, marginBottom: 12 },
  resultLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', textAlign: 'center', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' },
  resultValue: { fontSize: 48, color: colors.text, fontWeight: '800', textAlign: 'center', letterSpacing: -2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  rowLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.2 },
  rowValue: { fontSize: 20, color: colors.text, fontWeight: '700', letterSpacing: -0.5 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, gap: 6 },
  badgeText: { fontSize: 16, fontWeight: '800' },
  detailsContainer: { marginBottom: 28 },
  detailsTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16, letterSpacing: -0.3 },
  detailsCard: { padding: 20, borderRadius: 16, backgroundColor: colors.cardBackground },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  detailLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.2 },
  detailValue: { fontSize: 16, color: colors.text, fontWeight: '700', letterSpacing: -0.3 },
  homeButton: { borderRadius: 14, overflow: 'hidden', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  homeButtonText: { color: colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});