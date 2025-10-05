import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import EMICalculator from './EMICalculator';
import LoanEligibilityCalculator from './LoanEligibilityCalculator';
import PropertyComparisonCalculator from './PropertyComparisonCalculator';

type CalculatorType = 'overview' | 'emi' | 'eligibility' | 'comparison';

const CalculatorsPage: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('overview');

  const calculators = [
    {
      id: 'emi' as CalculatorType,
      title: 'EMI Calculator',
      description: 'Calculate your monthly EMI payments for home loans',
      icon: '🏦',
      features: ['Monthly EMI calculation', 'Total interest payable', 'Payment breakdown', 'Shareable results']
    },
    {
      id: 'eligibility' as CalculatorType,
      title: 'Loan Eligibility',
      description: 'Check how much loan you can get based on your income',
      icon: '📊',
      features: ['Maximum loan amount', 'Eligibility score', 'Personalized recommendations', 'Multiple income types']
    },
    {
      id: 'comparison' as CalculatorType,
      title: 'Property Comparison',
      description: 'Compare multiple properties financially',
      icon: '⚖️',
      features: ['Side-by-side comparison', 'ROI calculation', 'Total cost analysis', 'Best value highlighting']
    }
  ];

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'emi':
        return <EMICalculator />;
      case 'eligibility':
        return <LoanEligibilityCalculator />;
      case 'comparison':
        return <PropertyComparisonCalculator />;
      default:
        return null;
    }
  };

  if (activeCalculator !== 'overview') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setActiveCalculator('overview')}
                variant="outline"
                size="sm"
              >
                ← Back to Calculators
              </Button>
              <h1 className="text-xl font-semibold">
                {calculators.find(c => c.id === activeCalculator)?.title}
              </h1>
            </div>
          </div>
        </div>
        <div className="py-6">
          {renderCalculator()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Financial Calculators</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Make informed property investment decisions with our comprehensive financial tools. 
              Calculate EMIs, check loan eligibility, and compare properties side-by-side.
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Cards */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {calculators.map((calculator) => (
            <Card key={calculator.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">{calculator.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{calculator.title}</h3>
                <p className="text-gray-600 text-sm">{calculator.description}</p>
              </div>

              <div className="space-y-2 mb-6">
                {calculator.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setActiveCalculator(calculator.id)}
                className="w-full"
              >
                Use Calculator
              </Button>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Why Use Our Calculators?</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Accurate Calculations:</strong> Based on current market rates and standard banking formulas
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Comprehensive Analysis:</strong> Consider all costs including maintenance, registration, and taxes
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Easy Comparison:</strong> Compare multiple properties and loan options side-by-side
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Shareable Results:</strong> Save and share your calculations with family or advisors
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tips for Property Investment</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Budget Planning:</strong> Keep your EMI under 40% of your monthly income
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Credit Score:</strong> Maintain a credit score above 750 for better interest rates
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Down Payment:</strong> Higher down payment reduces EMI and total interest
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Hidden Costs:</strong> Factor in registration, maintenance, and other charges
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="mt-8">
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <h3 className="text-lg font-semibold mb-2 text-yellow-800">Important Disclaimer</h3>
            <p className="text-sm text-yellow-700">
              These calculators provide indicative results based on the information you provide. 
              Actual loan terms, interest rates, and eligibility may vary based on lender policies, 
              market conditions, and individual circumstances. Please consult with qualified financial 
              advisors and lenders for personalized advice and accurate assessments before making 
              any financial decisions.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalculatorsPage;