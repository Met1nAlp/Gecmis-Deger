// Türkiye Asgari Ücret Verileri (Net)
export const minWageData: { [year: number]: number } = {
  2025: 22104.00,
  2024: 17002.12,
  2023: 11402.32,
  2022: 5004.00,
  2021: 3577.50,
  2020: 2943.00,
  2019: 2558.40,
  2018: 2029.50,
  2017: 1777.50,
  2016: 1647.00,
  2015: 1273.50,
  2014: 1071.00,
  2013: 978.60,
  2012: 886.50,
  2011: 796.50,
  2010: 729.00,
  2009: 693.00,
  2008: 638.70,
  2007: 585.00,
  2006: 531.00,
  2005: 488.70,
};

export const getMinimumWage = (year: number): number => {
  return minWageData[year] || 0;
};

export const getMinimumWageGrowth = (startYear: number, endYear: number): number => {
  const startWage = getMinimumWage(startYear);
  const endWage = getMinimumWage(endYear);
  
  if (startWage === 0 || endWage === 0) return 0;
  
  return ((endWage - startWage) / startWage) * 100;
};
