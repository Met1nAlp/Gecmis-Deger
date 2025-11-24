import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { POPULAR_CRYPTOS, fetchCurrentCryptoPrice } from '../api/cryptoApi';
import { fetchCurrentCurrencyRate } from '../api/currencyApi';
import { fetchCurrentGoldPrice } from '../api/goldApi';
import { GlassCard } from '../components/GlassCard';
import { colors } from '../constants/theme';

// 3D Icons
const iconDollar = require('../assets/images/icon_dollar.png');
const iconEuro = require('../assets/images/icon_euro.png');
const iconGold = require('../assets/images/icon_gold.png');
const iconBitcoin = require('../assets/images/icon_bitcoin.png');
const appLogo = require('../assets/images/app-logo.png');

export default function RatesScreen() {
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(POPULAR_CRYPTOS[0].id);
  const [showCryptoPicker, setShowCryptoPicker] = useState(false);

  const loadRates = async () => {
    try {
      const [usdData, eurData, goldData, cryptoData] = await Promise.all([
        fetchCurrentCurrencyRate('USD'),
        fetchCurrentCurrencyRate('EUR'),
        fetchCurrentGoldPrice(),
        fetchCurrentCryptoPrice(selectedCrypto),
      ]);

      setRates({
        usd: usdData,
        eur: eurData,
        gold: goldData,
        crypto: cryptoData
      });
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  useEffect(() => {
    if (rates) updateCrypto();
  }, [selectedCrypto]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRates();
  };

  const updateCrypto = async () => {
    const data = await fetchCurrentCryptoPrice(selectedCrypto);
    setRates((prev: any) => prev ? { ...prev, crypto: data } : prev);
  };

  const getStatusColor = (source: string) => {
    if (source.includes('Yedek') || source.includes('Tahmini')) return colors.secondary;
    if (source.includes('Hata')) return colors.danger;
    return colors.success;
  };

  const RateCard = ({ iconSource, title, data, prefix = '₺', assetId }: any) => (
    <TouchableOpacity activeOpacity={0.85} onPress={() => router.push({ pathname: '/calculator', params: { assetId } })} style={styles.gridCard}>
      <Image source={iconSource} style={styles.cardBgIcon} resizeMode="contain" />
      <View style={styles.cardTextContainer}>
        <Text style={styles.gridCardTitle}>{title}</Text>
        <Text style={styles.gridCardValue}>{prefix}{data.rate || data.price ? (data.rate || data.price).toFixed(2) : '0.00'}</Text>
      </View>
    </TouchableOpacity>
  );

  const SelectableRateCard = ({ iconSource, title, data, prefix = '₺', onPress }: any) => (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.gridCard}>
      <Image source={iconSource} style={styles.cardBgIcon} resizeMode="contain" />
      <View style={styles.cardTextContainer}>
        <Text style={styles.gridCardTitle}>{title}</Text>
        <Text style={styles.gridCardValue}>{prefix}{data.rate || data.price ? (data.rate || data.price).toFixed(2) : '0.00'}</Text>
      </View>
      <View style={styles.swapIcon}>
        <MaterialCommunityIcons name="swap-vertical" size={16} color={colors.text} style={{ opacity: 0.6 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={[colors.background, '#E8EAF6']}
        style={styles.background}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={appLogo} style={styles.appLogo} resizeMode="contain" />
            <View>
              <Text style={styles.headerTitle}>Piyasa Durumu</Text>
              <Text style={styles.headerSubtitle}>Güncel Finansal Veriler</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.refreshIcon} onPress={onRefresh}>
            <MaterialCommunityIcons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
          ) : rates ? (
            <View style={styles.gridWrapper}>
              <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                <RateCard
                  iconSource={iconDollar}
                  title="Amerikan Doları"
                  data={rates.usd}
                  assetId="dolar"
                />
                <RateCard
                  iconSource={iconEuro}
                  title="Euro"
                  data={rates.eur}
                  assetId="euro"
                />
              </View>
              <View style={styles.gridRow}>
                <RateCard
                  iconSource={iconGold}
                  title="Gram Altın"
                  data={rates.gold}
                  assetId="altin"
                />
                <SelectableRateCard
                  iconSource={iconBitcoin}
                  title={POPULAR_CRYPTOS.find(c => c.id === selectedCrypto)?.name}
                  data={rates.crypto}
                  prefix="$"
                  onPress={() => setShowCryptoPicker(true)}
                />
              </View>
            </View>
            </View>
          ) : (
            <Text style={styles.errorText}>Veriler yüklenemedi.</Text>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={() => router.push('/select')}
          >
            <LinearGradient
              colors={[colors.primary, '#153558']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <FontAwesome5 name="calculator" size={18} color="#FFF" />
              <Text style={styles.calculateButtonText}>Hesaplama Yap</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Kripto Seçim Modalı */}
      <Modal visible={showCryptoPicker} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kripto Para Seçin</Text>
              <TouchableOpacity onPress={() => setShowCryptoPicker(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {POPULAR_CRYPTOS.map((crypto) => (
                <TouchableOpacity
                  key={crypto.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedCrypto(crypto.id);
                    setShowCryptoPicker(false);
                  }}
                >
                  <View style={styles.pickerItemContent}>
                    <Text style={styles.pickerItemTitle}>{crypto.name}</Text>
                  </View>
                  {selectedCrypto === crypto.id && (
                    <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appLogo: {
    width: 48,
    height: 48,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  headerSubtitle: { fontSize: 15, color: colors.textSecondary, marginTop: 6, fontWeight: '500' },
  refreshIcon: { padding: 12, backgroundColor: colors.cardBackground, borderRadius: 12, shadowColor: colors.primary, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 100 },
  gridWrapper: { flex: 1, justifyContent: 'center', paddingVertical: 40 },
  gridContainer: { gap: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  gridCard: {
    flex: 1,
    height: 160,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  cardTextContainer: {
    zIndex: 1,
  },
  gridCardTitle: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, letterSpacing: 0.2 },
  gridCardValue: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  swapIcon: { position: 'absolute', top: 12, right: 12, zIndex: 2 },
  errorText: { textAlign: 'center', color: colors.danger, marginTop: 20 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  calculateButton: { borderRadius: 14, overflow: 'hidden', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  calculateButtonText: { color: colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  closeButton: { padding: 4 },
  modalBody: { padding: 16 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, marginBottom: 8, backgroundColor: '#f8f9fa' },
  pickerItemContent: { flex: 1 },
  pickerItemTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
});
