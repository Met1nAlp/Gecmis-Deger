import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { POPULAR_CRYPTOS } from '../api/cryptoApi';
import { POPULAR_STOCKS } from '../api/stockApi';
import historicalDataRaw from '../assets/historicalData.json';
import { GlassCard } from '../components/GlassCard';
import { assetThemes, colors } from '../constants/theme';
import { POPULAR_CARS } from '../data/carData';
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

// Type definition for historical data
type HistoricalData = {
  [key: string]: { [date: string]: number };
};

const historicalData: HistoricalData = historicalDataRaw as HistoricalData;

// Crypto key mapping (Must match the one in useCalculatorHook)
const CRYPTO_KEY_MAP: Record<string, string> = {
  'bitcoin': 'bitcoin',
  'ethereum': 'ethereum',
  'solana': 'solana',
  'avalanche-2': 'avalanche-2',
  'matic-network': 'matic-network',
  'uniswap': 'uniswap',
  'ripple': 'ripple',
  'litecoin': 'litecoin',
  'chainlink': 'chainlink',
  'dogecoin': 'dogecoin',
  'polkadot': 'polkadot',
  'cardano': 'cardano',
  'binancecoin': 'binancecoin',
  'stellar': 'stellar',
};

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const isWeb = Platform.OS === 'web';

const ASSET_LABELS: Record<AssetId, string> = {
  btc: 'Kripto Para',
  dolar: 'Dolar',
  euro: 'Euro',
  altin: 'Altın',
  minWage: 'Asgari Ücret',
  stock: 'Hisse Senedi',
  inflation: 'Enflasyon',
  car: 'Araba',
  ons_altin: 'Ons Altın',
};

export default function CalculatorScreen() {
  const params = useLocalSearchParams<{ assetId: AssetId }>();
  const assetId = params.assetId || 'dolar'; // Default to dolar if undefined
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date(2015, 0, 1));
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateStep, setDateStep] = useState<'year' | 'month' | 'day'>('year');
  const [selectedYear, setSelectedYear] = useState(date.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(date.getMonth());
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const [selectedStock, setSelectedStock] = useState(POPULAR_STOCKS[0].id);
  const [showStockPicker, setShowStockPicker] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(POPULAR_CRYPTOS[0].id);
  const [showCryptoPicker, setShowCryptoPicker] = useState(false);
  const [selectedCar, setSelectedCar] = useState(POPULAR_CARS[0].id);
  const [showCarPicker, setShowCarPicker] = useState(false);

  // Get minimum date based on selected asset
  const getMinDate = () => {
    let assetKey = '';

    if (assetId === 'stock') {
      assetKey = selectedStock.endsWith('.IS') ? selectedStock : `${selectedStock}.IS`;
    } else if (assetId === 'btc') {
      assetKey = CRYPTO_KEY_MAP[selectedCrypto] || selectedCrypto;
    } else if (assetId === 'dolar') {
      assetKey = 'USD';
    } else if (assetId === 'euro') {
      assetKey = 'EUR';
    } else if (assetId === 'altin') {
      assetKey = 'altin';
    }

    if (assetKey && historicalData[assetKey]) {
      const dates = Object.keys(historicalData[assetKey]).sort();
      if (dates.length > 0) {
        return new Date(dates[0]);
      }
    }

    return new Date(2010, 0, 1); // Default fallback
  };

  const minDate = getMinDate();

  // Ensure date is not before minDate when asset changes
  useEffect(() => {
    if (date < minDate) {
      setDate(minDate);
    }
  }, [selectedStock, selectedCrypto, assetId]);


  const theme = assetThemes[assetId];
  const assetLabel = {
    dolar: 'Dolar',
    euro: 'Euro',
    altin: 'Altın',
    btc: 'Kripto Para',
    stock: 'Hisse Senedi',
    minWage: 'Asgari Ücret',
    inflation: 'Enflasyon',
    car: 'Araba',
    ons_altin: 'Ons Altın'
  }[assetId];

  const iconSource = ICONS[assetId];

  const handleCalculate = async () => {
    if (!amount) return;
    setLoading(true);

    // Simulate calculation delay for better UX
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/results',
        params: {
          assetId,
          amount,
          date: date.toISOString(),
          cryptoId: assetId === 'btc' ? selectedCrypto : undefined,
          stockSymbol: assetId === 'stock' ? selectedStock : undefined,
          carId: assetId === 'car' ? selectedCar : undefined
        }
      });
    }, 800);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.background, theme?.primary ? theme.primary + '15' : '#E8EAF6']}
          style={styles.background}
        />

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Hesaplama</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
              <GlassCard style={[styles.formCard, { backgroundColor: theme?.primary ? theme.primary + '05' : colors.cardBackground }]}>
                <View style={styles.formHeader}>
                  {iconSource ? (
                    <Image source={iconSource} style={styles.smallIcon} resizeMode="contain" />
                  ) : (
                    <FontAwesome5 name={assetId === 'minWage' ? 'wallet' : 'percentage'} size={80} color={theme?.primary || colors.primary} />
                  )}
                  <Text style={styles.assetTitle}>{assetLabel}</Text>
                </View>
                {assetId === 'btc' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Kripto Para Birimi</Text>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setShowCryptoPicker(true)}
                    >
                      <View style={styles.selectContent}>
                        <FontAwesome5 name="bitcoin" size={20} color={theme?.primary || colors.primary} style={{ marginRight: 10 }} />
                        <Text style={styles.selectText}>
                          {POPULAR_CRYPTOS.find(c => c.id === selectedCrypto)?.name}
                        </Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}

                {assetId === 'stock' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Hisse Senedi</Text>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setShowStockPicker(true)}
                    >
                      <View style={styles.selectContent}>
                        <MaterialCommunityIcons name="chart-line" size={20} color={theme?.primary || colors.primary} style={{ marginRight: 10 }} />
                        <Text style={styles.selectText}>
                          {POPULAR_STOCKS.find(s => s.id === selectedStock)?.name}
                        </Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}

                {assetId === 'car' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Araba Modeli</Text>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setShowCarPicker(true)}
                    >
                      <View style={styles.selectContent}>
                        <MaterialCommunityIcons name="car" size={20} color={theme?.primary || colors.primary} style={{ marginRight: 10 }} />
                        <Text style={styles.selectText}>
                          {POPULAR_CARS.find(c => c.id === selectedCar)?.name}
                        </Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tutar</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="0.00"
                      keyboardType="numeric"
                      placeholderTextColor="#B0BEC5"
                    />
                    <Text style={styles.currencySymbol}>
                      {assetId === 'dolar' ? '$' : assetId === 'euro' ? '€' : '₺'}
                    </Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tarih</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                    <MaterialCommunityIcons name="calendar" size={24} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </GlassCard>

              <TouchableOpacity
                style={[styles.calculateButton, !amount && styles.disabledButton]}
                onPress={handleCalculate}
                disabled={!amount || loading}
              >
                <LinearGradient
                  colors={!amount ? ['#ccc', '#999'] : [colors.primary, '#153558']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <FontAwesome5 name="calculator" size={20} color="#FFF" />
                      <Text style={styles.calculateButtonText}>HESAPLA</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Tarih Seçim Modalı */}
        <Modal visible={showDatePicker} transparent={true} animationType="slide" onRequestClose={() => { setShowDatePicker(false); setDateStep('year'); }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                {dateStep !== 'year' && (
                  <TouchableOpacity onPress={() => setDateStep(dateStep === 'day' ? 'month' : 'year')} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                  </TouchableOpacity>
                )}
                <Text style={styles.modalTitle}>
                  {dateStep === 'year' ? 'Yıl Seçin' : dateStep === 'month' ? 'Ay Seçin' : 'Gün Seçin'}
                </Text>
                <TouchableOpacity onPress={() => { setShowDatePicker(false); setDateStep('year'); }} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalList}>
                {dateStep === 'year' && Array.from({ length: new Date().getFullYear() - minDate.getFullYear() + 1 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <TouchableOpacity key={year} style={[styles.modalItem, selectedYear === year && styles.modalItemSelected]} onPress={() => { setSelectedYear(year); setDateStep('month'); }}>
                    <Text style={[styles.modalItemText, selectedYear === year && styles.modalItemTextSelected]}>{year}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
                {dateStep === 'month' && ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'].map((month, idx) => (
                  <TouchableOpacity key={idx} style={[styles.modalItem, selectedMonth === idx && styles.modalItemSelected]} onPress={() => { setSelectedMonth(idx); setDateStep('day'); }}>
                    <Text style={[styles.modalItemText, selectedMonth === idx && styles.modalItemTextSelected]}>{month}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
                {dateStep === 'day' && Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }, (_, i) => i + 1).map((day) => (
                  <TouchableOpacity key={day} style={styles.modalItem} onPress={() => { setDate(new Date(selectedYear, selectedMonth, day)); setShowDatePicker(false); setDateStep('year'); }}>
                    <Text style={styles.modalItemText}>{day} {['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][selectedMonth]} {selectedYear}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Kripto Seçim Modalı */}
        <Modal visible={showCryptoPicker} transparent={true} animationType="slide" onRequestClose={() => setShowCryptoPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Kripto Para Seç</Text>
                <TouchableOpacity onPress={() => setShowCryptoPicker(false)} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalList}>
                {POPULAR_CRYPTOS.map((crypto) => (
                  <TouchableOpacity key={crypto.id} style={[styles.modalItem, selectedCrypto === crypto.id && styles.modalItemSelected]} onPress={() => { setSelectedCrypto(crypto.id); setShowCryptoPicker(false); }}>
                    <View style={styles.modalItemContent}>
                      <FontAwesome5 name="bitcoin" size={20} color={selectedCrypto === crypto.id ? colors.primary : colors.textSecondary} />
                      <Text style={[styles.modalItemText, selectedCrypto === crypto.id && styles.modalItemTextSelected]}>{crypto.name}</Text>
                    </View>
                    {selectedCrypto === crypto.id && <MaterialCommunityIcons name="check" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Hisse Senedi Seçim Modalı */}
        <Modal visible={showStockPicker} transparent={true} animationType="slide" onRequestClose={() => setShowStockPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Hisse Senedi Seç</Text>
                <TouchableOpacity onPress={() => setShowStockPicker(false)} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalList}>
                {POPULAR_STOCKS.map((stock) => (
                  <TouchableOpacity key={stock.id} style={[styles.modalItem, selectedStock === stock.id && styles.modalItemSelected]} onPress={() => { setSelectedStock(stock.id); setShowStockPicker(false); }}>
                    <View style={styles.modalItemContent}>
                      <MaterialCommunityIcons name="chart-line" size={20} color={selectedStock === stock.id ? colors.primary : colors.textSecondary} />
                      <Text style={[styles.modalItemText, selectedStock === stock.id && styles.modalItemTextSelected]}>{stock.name}</Text>
                    </View>
                    {selectedStock === stock.id && <MaterialCommunityIcons name="check" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Araba Seçim Modalı */}
        <Modal visible={showCarPicker} transparent={true} animationType="slide" onRequestClose={() => setShowCarPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Araba Seç</Text>
                <TouchableOpacity onPress={() => setShowCarPicker(false)} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalList}>
                {POPULAR_CARS.map((car) => (
                  <TouchableOpacity key={car.id} style={[styles.modalItem, selectedCar === car.id && styles.modalItemSelected]} onPress={() => { setSelectedCar(car.id); setShowCarPicker(false); }}>
                    <View style={styles.modalItemContent}>
                      <MaterialCommunityIcons name="car" size={20} color={selectedCar === car.id ? colors.primary : colors.textSecondary} />
                      <Text style={[styles.modalItemText, selectedCar === car.id && styles.modalItemTextSelected]}>{car.name}</Text>
                    </View>
                    {selectedCar === car.id && <MaterialCommunityIcons name="check" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { padding: 10, backgroundColor: colors.cardBackground, borderRadius: 12, shadowColor: colors.primary, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  content: { padding: 20, paddingBottom: 40 },
  formCard: { padding: 20, borderRadius: 16, backgroundColor: colors.cardBackground, marginBottom: 16 },
  formHeader: { alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  smallIcon: { width: 100, height: 100, marginBottom: 12 },
  assetTitle: { fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 10, letterSpacing: 0.5, textTransform: 'uppercase' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 64,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  input: { flex: 1, fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  currencySymbol: { fontSize: 24, fontWeight: '800', color: colors.textSecondary, marginLeft: 8 },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  selectContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  selectText: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1 },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  dateText: { fontSize: 15, fontWeight: '600', color: colors.text },
  calculateButton: { borderRadius: 14, overflow: 'hidden', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, marginTop: 8 },
  disabledButton: { shadowOpacity: 0.1, elevation: 2 },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  calculateButtonText: { color: colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(10, 25, 47, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '75%', paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, flex: 1, textAlign: 'center' },
  backBtn: { padding: 8, backgroundColor: colors.cardBackground, borderRadius: 10, marginRight: 8 },
  closeButton: { padding: 8, backgroundColor: colors.cardBackground, borderRadius: 10 },
  modalList: { padding: 16 },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: colors.cardBackground, borderRadius: 12, marginBottom: 8 },
  modalItemSelected: { backgroundColor: colors.secondary + '20', borderWidth: 2, borderColor: colors.primary },
  modalItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  modalItemText: { fontSize: 15, color: colors.text, marginLeft: 12, flex: 1, fontWeight: '600' },
  modalItemTextSelected: { fontWeight: '700', color: colors.primary },
});
