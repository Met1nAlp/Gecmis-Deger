// Türkiye Yıllık Enflasyon Oranları (TÜİK)
export const inflationData: { [year: number]: number } = {
  2025: 45.0, // Tahmini
  2024: 52.0,
  2023: 64.77,
  2022: 72.31,
  2021: 36.08,
  2020: 14.60,
  2019: 11.84,
  2018: 20.30,
  2017: 11.92,
  2016: 8.53,
  2015: 8.81,
  2014: 8.17,
  2013: 7.40,
  2012: 6.16,
  2011: 10.45,
  2010: 6.40,
  2009: 6.53,
  2008: 10.06,
  2007: 8.39,
  2006: 9.65,
  2005: 7.72,
};

export const getInflationRate = (year: number): number => {
  return inflationData[year] || 0;
};

export const calculateCumulativeInflation = (startYear: number, endYear: number): number => {
  let cumulative = 1;
  
  for (let year = startYear; year <= endYear; year++) {
    const rate = getInflationRate(year);
    cumulative *= (1 + rate / 100);
  }
  
  return (cumulative - 1) * 100;
};
