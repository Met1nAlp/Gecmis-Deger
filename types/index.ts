// DOSYA YOLU: types/index.ts

export type AssetId = 'btc' | 'dolar' | 'euro' | 'altin' | 'ons_altin' | 'minWage' | 'stock' | 'inflation' | 'car';

export interface CalculationResult {
  id: AssetId;
  label: string;
  value: number | null;
  amount?: number;
  unit?: string;
  description: string;
  pastPrice?: number;
  currentPrice?: number;
  initialAmount: number;
  currentValue: number;
  profit: number;
  percentageChange: number;
  initialRate: number;
  currentRate: number;
}

// Varlık seçim butonları için tip
export interface Asset {
  id: AssetId;
  label: string;
  icon: string;
  color: string;
  disabled?: boolean; // Hata verenleri pasif göstermek için
}

export interface PortfolioItem {
  id: string;
  assetId: AssetId;
  amount: number;
  initialAmount: number;
  currentValue?: number;
  date: string;
  cryptoId?: string;
  stockSymbol?: string;
  carId?: string;
}