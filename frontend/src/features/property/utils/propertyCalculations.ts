import { Property, PropertyType } from '../types';

/**
 * Calculate EMI (Equated Monthly Installment) for property loan
 */
export const calculateEMI = (
  principal: number,
  annualRate: number,
  tenureYears: number
): number => {
  const monthlyRate = annualRate / (12 * 100);
  const tenureMonths = tenureYears * 12;
  
  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }
  
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
              (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  
  return Math.round(emi);
};

/**
 * Calculate total interest payable over loan tenure
 */
export const calculateTotalInterest = (
  principal: number,
  annualRate: number,
  tenureYears: number
): number => {
  const emi = calculateEMI(principal, annualRate, tenureYears);
  const totalAmount = emi * tenureYears * 12;
  return Math.round(totalAmount - principal);
};

/**
 * Calculate loan eligibility based on income
 */
export const calculateLoanEligibility = (
  monthlyIncome: number,
  existingEMIs: number = 0,
  annualRate: number = 8.5,
  tenureYears: number = 20,
  foirRatio: number = 0.5 // Fixed Obligation to Income Ratio
): {
  eligibleAmount: number;
  maxEMI: number;
  recommendedDownPayment: number;
} => {
  const maxEMI = (monthlyIncome * foirRatio) - existingEMIs;
  
  if (maxEMI <= 0) {
    return {
      eligibleAmount: 0,
      maxEMI: 0,
      recommendedDownPayment: 0
    };
  }
  
  const monthlyRate = annualRate / (12 * 100);
  const tenureMonths = tenureYears * 12;
  
  let eligibleAmount = 0;
  if (monthlyRate === 0) {
    eligibleAmount = maxEMI * tenureMonths;
  } else {
    eligibleAmount = (maxEMI * (Math.pow(1 + monthlyRate, tenureMonths) - 1)) /
                    (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths));
  }
  
  const recommendedDownPayment = eligibleAmount * 0.2; // 20% down payment
  
  return {
    eligibleAmount: Math.round(eligibleAmount),
    maxEMI: Math.round(maxEMI),
    recommendedDownPayment: Math.round(recommendedDownPayment)
  };
};

/**
 * Calculate property affordability score (0-100)
 */
export const calculateAffordabilityScore = (
  propertyPrice: number,
  monthlyIncome: number,
  downPayment: number = 0,
  existingEMIs: number = 0
): number => {
  const loanAmount = propertyPrice - downPayment;
  const eligibility = calculateLoanEligibility(monthlyIncome, existingEMIs);
  
  if (eligibility.eligibleAmount === 0) return 0;
  
  const affordabilityRatio = eligibility.eligibleAmount / loanAmount;
  const score = Math.min(affordabilityRatio * 100, 100);
  
  return Math.round(score);
};

/**
 * Calculate property investment returns (for rental properties)
 */
export const calculateRentalYield = (
  propertyPrice: number,
  monthlyRent: number,
  maintenanceCost: number = 0,
  propertyTax: number = 0
): {
  grossYield: number;
  netYield: number;
  monthlyNetIncome: number;
  annualNetIncome: number;
} => {
  const annualRent = monthlyRent * 12;
  const annualExpenses = (maintenanceCost * 12) + propertyTax;
  const annualNetIncome = annualRent - annualExpenses;
  
  const grossYield = (annualRent / propertyPrice) * 100;
  const netYield = (annualNetIncome / propertyPrice) * 100;
  
  return {
    grossYield: Math.round(grossYield * 100) / 100,
    netYield: Math.round(netYield * 100) / 100,
    monthlyNetIncome: Math.round(annualNetIncome / 12),
    annualNetIncome: Math.round(annualNetIncome)
  };
};

/**
 * Calculate property appreciation over time
 */
export const calculatePropertyAppreciation = (
  currentValue: number,
  purchaseValue: number,
  yearsHeld: number
): {
  totalAppreciation: number;
  totalAppreciationPercent: number;
  annualAppreciationRate: number;
} => {
  const totalAppreciation = currentValue - purchaseValue;
  const totalAppreciationPercent = (totalAppreciation / purchaseValue) * 100;
  
  let annualAppreciationRate = 0;
  if (yearsHeld > 0) {
    annualAppreciationRate = (Math.pow(currentValue / purchaseValue, 1 / yearsHeld) - 1) * 100;
  }
  
  return {
    totalAppreciation: Math.round(totalAppreciation),
    totalAppreciationPercent: Math.round(totalAppreciationPercent * 100) / 100,
    annualAppreciationRate: Math.round(annualAppreciationRate * 100) / 100
  };
};

/**
 * Calculate stamp duty and registration charges
 */
export const calculateStampDuty = (
  propertyValue: number,
  state: string,
  buyerGender: 'male' | 'female' | 'joint' = 'male'
): {
  stampDuty: number;
  registrationCharges: number;
  totalCharges: number;
} => {
  // Default rates (varies by state)
  let stampDutyRate = 0.05; // 5%
  let registrationRate = 0.01; // 1%
  
  // State-specific rates (simplified)
  const stateRates: Record<string, { stampDuty: number; registration: number; femaleDiscount?: number }> = {
    'maharashtra': { stampDuty: 0.05, registration: 0.01, femaleDiscount: 0.01 },
    'karnataka': { stampDuty: 0.05, registration: 0.01, femaleDiscount: 0.01 },
    'delhi': { stampDuty: 0.06, registration: 0.01, femaleDiscount: 0.02 },
    'gujarat': { stampDuty: 0.049, registration: 0.01, femaleDiscount: 0.01 },
    'rajasthan': { stampDuty: 0.05, registration: 0.01, femaleDiscount: 0.01 },
    'uttar pradesh': { stampDuty: 0.07, registration: 0.01, femaleDiscount: 0.02 }
  };
  
  const stateKey = state.toLowerCase();
  if (stateRates[stateKey]) {
    stampDutyRate = stateRates[stateKey].stampDuty;
    registrationRate = stateRates[stateKey].registration;
    
    // Apply female buyer discount
    if (buyerGender === 'female' && stateRates[stateKey].femaleDiscount) {
      stampDutyRate -= stateRates[stateKey].femaleDiscount!;
    }
  }
  
  const stampDuty = propertyValue * stampDutyRate;
  const registrationCharges = propertyValue * registrationRate;
  const totalCharges = stampDuty + registrationCharges;
  
  return {
    stampDuty: Math.round(stampDuty),
    registrationCharges: Math.round(registrationCharges),
    totalCharges: Math.round(totalCharges)
  };
};

/**
 * Calculate total cost of property ownership
 */
export const calculateTotalOwnershipCost = (
  propertyPrice: number,
  downPayment: number,
  loanAmount: number,
  interestRate: number,
  tenureYears: number,
  state: string,
  maintenancePercentage: number = 0.02, // 2% of property value annually
  insurancePercentage: number = 0.003 // 0.3% of property value annually
): {
  emi: number;
  totalInterest: number;
  stampDutyAndRegistration: number;
  maintenanceCost: number;
  insuranceCost: number;
  totalCost: number;
  totalCostWithoutInterest: number;
} => {
  const emi = calculateEMI(loanAmount, interestRate, tenureYears);
  const totalInterest = calculateTotalInterest(loanAmount, interestRate, tenureYears);
  const { totalCharges: stampDutyAndRegistration } = calculateStampDuty(propertyPrice, state);
  
  const annualMaintenance = propertyPrice * maintenancePercentage;
  const annualInsurance = propertyPrice * insurancePercentage;
  const maintenanceCost = annualMaintenance * tenureYears;
  const insuranceCost = annualInsurance * tenureYears;
  
  const totalCost = propertyPrice + totalInterest + stampDutyAndRegistration + 
                   maintenanceCost + insuranceCost;
  const totalCostWithoutInterest = propertyPrice + stampDutyAndRegistration + 
                                  maintenanceCost + insuranceCost;
  
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    stampDutyAndRegistration: Math.round(stampDutyAndRegistration),
    maintenanceCost: Math.round(maintenanceCost),
    insuranceCost: Math.round(insuranceCost),
    totalCost: Math.round(totalCost),
    totalCostWithoutInterest: Math.round(totalCostWithoutInterest)
  };
};

/**
 * Calculate property price per square foot comparison
 */
export const calculatePriceComparison = (
  properties: Property[]
): {
  averagePricePerSqft: number;
  medianPricePerSqft: number;
  minPricePerSqft: number;
  maxPricePerSqft: number;
  pricePerSqftData: Array<{ id: number; pricePerSqft: number; title: string }>;
} => {
  const pricePerSqftData = properties
    .filter(p => p.area && p.area > 0)
    .map(p => ({
      id: p.id,
      pricePerSqft: Math.round(p.price / p.area),
      title: p.title
    }));
  
  if (pricePerSqftData.length === 0) {
    return {
      averagePricePerSqft: 0,
      medianPricePerSqft: 0,
      minPricePerSqft: 0,
      maxPricePerSqft: 0,
      pricePerSqftData: []
    };
  }
  
  const prices = pricePerSqftData.map(p => p.pricePerSqft).sort((a, b) => a - b);
  
  const averagePricePerSqft = Math.round(
    prices.reduce((sum, price) => sum + price, 0) / prices.length
  );
  
  const medianPricePerSqft = prices.length % 2 === 0
    ? Math.round((prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2)
    : prices[Math.floor(prices.length / 2)];
  
  return {
    averagePricePerSqft,
    medianPricePerSqft,
    minPricePerSqft: prices[0],
    maxPricePerSqft: prices[prices.length - 1],
    pricePerSqftData
  };
};

/**
 * Calculate break-even point for rental investment
 */
export const calculateBreakEvenPoint = (
  propertyPrice: number,
  downPayment: number,
  monthlyRent: number,
  monthlyExpenses: number,
  annualAppreciationRate: number = 0.05
): {
  breakEvenYears: number;
  breakEvenMonths: number;
  totalCashFlow: number;
  totalAppreciation: number;
} => {
  const initialInvestment = downPayment;
  const monthlyNetCashFlow = monthlyRent - monthlyExpenses;
  
  if (monthlyNetCashFlow <= 0 && annualAppreciationRate <= 0) {
    return {
      breakEvenYears: Infinity,
      breakEvenMonths: Infinity,
      totalCashFlow: 0,
      totalAppreciation: 0
    };
  }
  
  let months = 0;
  let totalCashFlow = 0;
  let currentPropertyValue = propertyPrice;
  
  while (months < 360) { // Max 30 years
    months++;
    totalCashFlow += monthlyNetCashFlow;
    
    // Calculate appreciation monthly
    const monthlyAppreciationRate = annualAppreciationRate / 12;
    currentPropertyValue *= (1 + monthlyAppreciationRate);
    
    const totalAppreciation = currentPropertyValue - propertyPrice;
    const totalReturn = totalCashFlow + totalAppreciation;
    
    if (totalReturn >= initialInvestment) {
      return {
        breakEvenYears: Math.floor(months / 12),
        breakEvenMonths: months % 12,
        totalCashFlow: Math.round(totalCashFlow),
        totalAppreciation: Math.round(totalAppreciation)
      };
    }
  }
  
  return {
    breakEvenYears: Infinity,
    breakEvenMonths: Infinity,
    totalCashFlow: Math.round(totalCashFlow),
    totalAppreciation: Math.round(currentPropertyValue - propertyPrice)
  };
};

/**
 * Calculate property investment score (0-100)
 */
export const calculateInvestmentScore = (
  property: Property,
  monthlyRent?: number,
  marketAppreciationRate: number = 0.05
): number => {
  let score = 50; // Base score
  
  // Location score (based on city tier - simplified)
  const tier1Cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune'];
  const tier2Cities = ['ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore'];
  
  const cityLower = property.city.toLowerCase();
  if (tier1Cities.includes(cityLower)) {
    score += 20;
  } else if (tier2Cities.includes(cityLower)) {
    score += 10;
  }
  
  // Property type score
  if (property.propertyType === 'apartment') {
    score += 10; // High liquidity
  } else if (property.propertyType === 'house') {
    score += 5;
  }
  
  // Rental yield score (if rental data available)
  if (monthlyRent) {
    const { netYield } = calculateRentalYield(property.price, monthlyRent);
    if (netYield >= 6) score += 15;
    else if (netYield >= 4) score += 10;
    else if (netYield >= 2) score += 5;
  }
  
  // Price per sqft reasonableness
  if (property.area) {
    const pricePerSqft = property.price / property.area;
    // Reasonable price per sqft varies by city, this is simplified
    if (pricePerSqft < 8000) score += 10;
    else if (pricePerSqft > 15000) score -= 10;
  }
  
  // Property age/status
  if (property.status === 'new') {
    score += 5;
  } else if (property.status === 'under_construction') {
    score -= 5; // Higher risk
  }
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Calculate carpet area from built-up area
 */
export const calculateCarpetArea = (
  builtUpArea: number,
  propertyType: PropertyType
): number => {
  // Typical carpet area percentages
  const carpetAreaPercentages: Record<PropertyType, number> = {
    apartment: 0.7, // 70% of built-up area
    house: 0.8,     // 80% of built-up area
    villa: 0.85,    // 85% of built-up area
    plot: 1.0,      // Same as built-up for plots
    commercial: 0.75, // 75% of built-up area
    land: 1.0       // Same as built-up for land
  };
  
  const percentage = carpetAreaPercentages[propertyType] || 0.75;
  return Math.round(builtUpArea * percentage);
};

/**
 * Calculate loading percentage (built-up vs carpet area)
 */
export const calculateLoadingPercentage = (
  builtUpArea: number,
  carpetArea: number
): number => {
  if (carpetArea === 0) return 0;
  return Math.round(((builtUpArea - carpetArea) / carpetArea) * 100);
};