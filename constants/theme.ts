export const colors = {
  primary: '#0A192F', // Deep Midnight Blue
  secondary: '#64FFDA', // Vibrant Teal
  background: '#FFFFFF', // Crisp White
  cardBackground: '#F4F6F8', // Soft Grey
  text: '#0A192F', // Deep Midnight Blue
  textSecondary: '#8892B0', // Muted Blue Grey
  white: '#FFFFFF',
  border: 'rgba(10, 25, 47, 0.08)',
  danger: '#FF3B30', // Alert Crimson Red
  success: '#10B981', // Vibrant Emerald Green
  chipBackground: '#E8EAF6',
  chipText: '#0A192F',
  gray: '#CCD6F6',
  gradient1: '#0A192F',
  gradient2: '#112240',
  profitBg: 'rgba(16, 185, 129, 0.1)',
  lossBg: 'rgba(255, 59, 48, 0.1)',
};

type AssetTheme = {
  colors: string[];
  symbols: string[];
  primary: string;
  secondary: string;
};

export const assetThemes: Record<string, AssetTheme> = {
  dolar: {
    colors: ['#2E7D32', '#43A047', '#66BB6A'],
    symbols: ['$', '$', '$', '$', '$', '$', '$', '$'],
    primary: '#2E7D32',
    secondary: '#43A047'
  },
  euro: {
    colors: ['#1565C0', '#1976D2', '#1E88E5'],
    symbols: ['€', '€', '€', '€', '€', '€', '€', '€'],
    primary: '#1565C0',
    secondary: '#1976D2'
  },
  btc: {
    colors: ['#F57C00', '#FB8C00', '#FF9800'],
    symbols: ['₿', '₿', '₿', '₿', '₿', '₿', '₿', '₿'],
    primary: '#F57C00',
    secondary: '#FB8C00'
  },
  altin: {
    colors: ['#F9A825', '#FBC02D', '#FDD835'],
    symbols: ['◆', '◆', '◆', '◆', '◆', '◆', '◆', '◆'],
    primary: '#F9A825',
    secondary: '#FBC02D'
  },
  car: {
    colors: ['#37474F', '#455A64', '#546E7A'],
    symbols: ['🚗', '🚗', '🚗', '🚗', '🚗', '🚗', '🚗', '🚗'],
    primary: '#37474F',
    secondary: '#455A64'
  },
  stock: {
    colors: ['#00695C', '#00796B', '#00897B'],
    symbols: ['📈', '📉', '📊', '💹', '📈', '📉', '📊', '💹'],
    primary: '#00695C',
    secondary: '#00796B'
  },
  minWage: {
    colors: ['#4527A0', '#512DA8', '#5E35B1'],
    symbols: ['₺', '₺', '₺', '₺', '₺', '₺', '₺', '₺'],
    primary: '#4527A0',
    secondary: '#512DA8'
  },
  inflation: {
    colors: ['#C62828', '#D32F2F', '#E53935'],
    symbols: ['%', '%', '%', '%', '%', '%', '%', '%'],
    primary: '#C62828',
    secondary: '#D32F2F'
  },
  ons_altin: {
    colors: ['#FFD700', '#FFC107', '#FFB300'],
    symbols: ['oz', 'oz', 'oz', 'oz', 'oz', 'oz', 'oz', 'oz'],
    primary: '#FFD700',
    secondary: '#FFC107'
  }
};