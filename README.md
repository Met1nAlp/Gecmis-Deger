# 💰 Varlık Değer Hesaplayıcı

Türkiye'deki enflasyon ve varlık değerlerini geçmişe dönük hesaplayan React Native (Expo) mobil uygulaması.

## 🚀 Özellikler

- **Çoklu Varlık Desteği**: Dolar, Euro, Altın, Bitcoin, Hisse Senetleri, Arabalar
- **Geçmiş Veri Analizi**: Geçmiş tarihlerdeki değerleri bugünkü değerle karşılaştırma
- **Portföy Takibi**: Varlıklarınızı kaydedin ve takip edin
- **Canlı Kurlar**: Güncel döviz, altın ve kripto para kurları
- **Modern UI/UX**: Glassmorphism tasarım ve animasyonlar

## 📱 Desteklenen Varlıklar

- 💵 Dolar (USD)
- 💶 Euro (EUR)
- 🥇 Altın (Gram/Ons)
- ₿ Kripto Paralar (Bitcoin, Ethereum, Solana, vb.)
- 📈 Hisse Senetleri (BIST)
- 🚗 Arabalar (Popüler modeller)
- 💼 Asgari Ücret
- 📊 Enflasyon

## 🛠️ Kurulum

### Gereksinimler

- Node.js (v18+)
- npm veya yarn
- Expo CLI
- iOS Simulator veya Android Emulator (opsiyonel)

### Adımlar

1. Projeyi klonlayın:
```bash
git clone <repo-url>
cd <proje-adi>
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun:
```bash
cp .env.example .env
```

4. Uygulamayı başlatın:
```bash
npm start
```

## 🔑 API Anahtarları

Uygulama aşağıdaki API'leri kullanır:

- **TCMB API**: Döviz kurları (anahtar gerektirmez)
- **CoinGecko API**: Kripto para verileri (anahtar gerektirmez)
- **Alpha Vantage**: Hisse senedi verileri
- **FreeGoldPrice.org**: Altın fiyatları

`.env.example` dosyasını `.env` olarak kopyalayıp kendi API anahtarlarınızı ekleyin.

## 📂 Proje Yapısı

```
├── app/                    # Ekranlar (Expo Router)
│   ├── (tabs)/            # Tab navigasyon ekranları
│   ├── calculator.tsx     # Hesaplama ekranı
│   ├── results.tsx        # Sonuç ekranı
│   └── ...
├── api/                   # API servisleri
├── assets/                # Görseller ve veriler
├── components/            # Yeniden kullanılabilir bileşenler
├── constants/             # Sabitler ve tema
├── data/                  # Statik veriler
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript tipleri
└── utils/                 # Yardımcı fonksiyonlar
```

## 🎨 Teknolojiler

- **React Native** - Mobil uygulama framework'ü
- **Expo** - React Native geliştirme platformu
- **TypeScript** - Tip güvenliği
- **Expo Router** - Dosya tabanlı navigasyon
- **AsyncStorage** - Yerel veri saklama
- **Linear Gradient** - Gradient efektleri
- **Vector Icons** - İkon kütüphanesi

## 📱 Ekran Görüntüleri

*(Ekran görüntüleri eklenecek)*

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

Metin Alp

## 🙏 Teşekkürler

- TCMB - Döviz kuru verileri
- CoinGecko - Kripto para verileri
- Alpha Vantage - Hisse senedi verileri
- FreeGoldPrice.org - Altın fiyat verileri
