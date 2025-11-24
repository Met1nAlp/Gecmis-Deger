import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { POPULAR_CRYPTOS } from '../api/cryptoApi';
import { GlassCard } from '../components/GlassCard';
import { assetThemes, colors } from '../constants/theme';
import { usePortfolio } from '../hooks/usePortfolio';
import { AssetId, PortfolioItem } from '../types';

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

export default function PortfolioScreen() {
  const { portfolio, loading, loadPortfolio, addToPortfolio, removeFromPortfolio } = usePortfolio();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetId>('dolar');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(POPULAR_CRYPTOS[0].id);
  const [showCryptoPicker, setShowCryptoPicker] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleAdd = async () => {
    if (!amount) {
      Alert.alert('Hata', 'Lütfen bir tutar girin.');
      return;
    }

    try {
      await addToPortfolio({
        assetId: selectedAsset,
        amount: Number(amount),
        initialAmount: Number(amount),
        date: date.toISOString(),
        cryptoId: selectedAsset === 'btc' ? selectedCrypto : undefined,
      });
      setShowAddModal(false);
      setAmount('');
      setDate(new Date());
      Alert.alert('Başarılı', 'Yatırım portföye eklendi.');
    } catch (error) {
      Alert.alert('Hata', 'Yatırım eklenirken bir sorun oluştu.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Sil',
      'Bu yatırımı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await removeFromPortfolio(id);
          }
        }
      ]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getTotalValue = () => {
    return portfolio.reduce((total, item) => total + (item.currentValue || 0), 0);
  };

  const getTotalProfit = () => {
    const totalCurrent = getTotalValue();
    const totalInitial = portfolio.reduce((total, item) => total + item.initialAmount, 0);
    return totalCurrent - totalInitial;
  };

  const renderPortfolioItem = (item: PortfolioItem) => {
    const theme = assetThemes[item.assetId];
    const iconSource = ICONS[item.assetId];
    const profit = (item.currentValue || 0) - item.initialAmount;
    const isProfit = profit >= 0;

    return (
      <GlassCard key={item.id} style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIconContainer}>
            {iconSource ? (
              <Image source={iconSource} style={styles.itemIcon3D} resizeMode="contain" />
            ) : (
              <FontAwesome5 name={item.assetId === 'minWage' ? 'wallet' : 'percentage'} size={24} color={theme.primary} />
            )}
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>
              {item.assetId === 'btc'
                ? POPULAR_CRYPTOS.find(c => c.id === item.cryptoId)?.name || 'Bitcoin'
                : theme.symbols[0] === '$' ? 'Dolar' : theme.symbols[0] === '€' ? 'Euro' : 'Altın'}
            </Text>
            <Text style={styles.itemDate}>
              {new Date(item.date).toLocaleDateString('tr-TR')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.itemValues}>
          <View>
            <Text style={styles.valueLabel}>Yatırım</Text>
            <Text style={styles.valueText}>{formatCurrency(item.initialAmount)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.valueLabel}>Güncel Değer</Text>
            <Text style={[styles.valueText, { color: colors.primary }]}>
              {formatCurrency(item.currentValue || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.itemFooter}>
          <View style={[styles.badge, { backgroundColor: isProfit ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)' }]}>
            <MaterialCommunityIcons name={isProfit ? 'trending-up' : 'trending-down'} size={16} color={isProfit ? colors.success : colors.danger} />
            <Text style={[styles.badgeText, { color: isProfit ? colors.success : colors.danger }]}>
              {isProfit ? '+' : ''}{formatCurrency(profit)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => router.push({
              pathname: '/results',
              params: {
                amount: item.amount.toString(),
                date: item.date,
                assetId: item.assetId,
                cryptoId: item.cryptoId,
                isFromPortfolio: 'true'
              }
            })}
          >
            <Text style={styles.detailsButtonText}>Detaylar</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, '#E8EAF6']}
        style={styles.background}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Portföyüm</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <GlassCard style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Toplam Portföy Değeri</Text>
            <Text style={styles.summaryValue}>{formatCurrency(getTotalValue())}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summarySubLabel}>Toplam Kar/Zarar:</Text>
              <Text style={[styles.summarySubValue, { color: getTotalProfit() >= 0 ? '#4CAF50' : '#FF5252' }]}>
                {getTotalProfit() >= 0 ? '+' : ''}{formatCurrency(getTotalProfit())}
              </Text>
            </View>
          </GlassCard>

          <Text style={styles.sectionTitle}>Yatırımlarım</Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : portfolio.length > 0 ? (
            <View style={styles.listContainer}>
              {portfolio.map(renderPortfolioItem)}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="wallet-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Henüz yatırım eklemediniz.</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.emptyButtonText}>İlk Yatırımını Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Yatırım Ekle</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Varlık Türü</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assetSelector}>
                {Object.keys(assetThemes).map((key) => {
                  if (key === 'minWage' || key === 'inflation') return null;
                  const isSelected = selectedAsset === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.assetChip, isSelected && styles.assetChipSelected]}
                      onPress={() => setSelectedAsset(key as AssetId)}
                    >
                      <Text style={[styles.assetChipText, isSelected && styles.assetChipTextSelected]}>
                        {key === 'btc' ? 'Kripto' : key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {selectedAsset === 'btc' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Kripto Para</Text>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setShowCryptoPicker(true)}
                  >
                    <Text style={styles.selectText}>
                      {POPULAR_CRYPTOS.find(c => c.id === selectedCrypto)?.name}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tutar</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor="#B0BEC5"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tarih</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {date.toLocaleDateString('tr-TR')}
                  </Text>
                  <MaterialCommunityIcons name="calendar" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
                <LinearGradient
                  colors={[colors.primary, '#153558']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.saveButtonText}>KAYDET</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Crypto Picker Modal */}
      <Modal
        visible={showCryptoPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCryptoPicker(false)}
      >
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
                <TouchableOpacity
                  key={crypto.id}
                  style={[
                    styles.modalItem,
                    selectedCrypto === crypto.id && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setSelectedCrypto(crypto.id);
                    setShowCryptoPicker(false);
                  }}
                >
                  <View style={styles.modalItemContent}>
                    <FontAwesome5 name="bitcoin" size={20} color={selectedCrypto === crypto.id ? colors.primary : colors.textSecondary} />
                    <Text style={[
                      styles.modalItemText,
                      selectedCrypto === crypto.id && styles.modalItemTextSelected
                    ]}>
                      {crypto.name}
                    </Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: colors.primary, letterSpacing: -0.5 },
  addButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  content: { padding: 24, paddingBottom: 100 },
  summaryCard: { padding: 24, borderRadius: 24, backgroundColor: colors.primary, marginBottom: 32 },
  summaryLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8, fontWeight: '600' },
  summaryValue: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 16, letterSpacing: -1 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12 },
  summarySubLabel: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  summarySubValue: { fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 },
  listContainer: { gap: 16 },
  itemCard: { padding: 16, borderRadius: 20, backgroundColor: '#fff' },
  itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  itemIconContainer: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemIcon3D: { width: 32, height: 32 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  itemDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  deleteButton: { padding: 8 },
  itemValues: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  valueLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  valueText: { fontSize: 16, fontWeight: '700', color: colors.text },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  detailsButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsButtonText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40, padding: 20 },
  emptyText: { marginTop: 16, fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
  emptyButton: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 12 },
  emptyButtonText: { color: '#fff', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  closeButton: { padding: 4 },
  modalBody: { padding: 24 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8, marginLeft: 4 },
  assetSelector: { flexDirection: 'row', marginBottom: 24 },
  assetChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F8F9FA', marginRight: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  assetChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  assetChipText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  assetChipTextSelected: { color: '#fff' },
  inputGroup: { marginBottom: 24 },
  input: { backgroundColor: '#F8F9FA', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', fontSize: 16, fontWeight: '600', color: colors.text },
  selectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F9FA', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  selectText: { fontSize: 16, fontWeight: '600', color: colors.text },
  dateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F9FA', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  dateText: { fontSize: 16, fontWeight: '600', color: colors.text },
  saveButton: { borderRadius: 16, overflow: 'hidden', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, marginTop: 8 },
  buttonGradient: { alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  modalList: { padding: 16 },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, marginBottom: 8, backgroundColor: '#f8f9fa' },
  modalItemSelected: { backgroundColor: '#E8EAF6', borderColor: colors.primary, borderWidth: 1 },
  modalItemContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalItemText: { fontSize: 16, fontWeight: '600', color: colors.text },
  modalItemTextSelected: { color: colors.primary },
});
