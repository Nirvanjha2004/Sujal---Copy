import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { Separator } from '@/shared/components/ui/separator';

interface EligibilityResult {
  maxLoanAmount: number;
  recommendedEMI: number;
  eligibilityScore: number;
  recommendations: string[];
}

const LoanEligibilityCalculator: React.FC = () => {
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>('');
  const [existingEMIs, setExistingEMIs] = useState<string>('');
  const [employmentType, setEmploymentType] = useState<string>('salaried');
  const [creditScore, setCreditScore] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const calculateEligibility = () => {
    const income = parseFloat(monthlyIncome);
    const expenses = parseFloat(monthlyExpenses) || 0;
    const existingEMI = parseFloat(existingEMIs) || 0;
    const score = parseInt(creditScore) || 750;
    const userAge = parseInt(age) || 30;

    if (!income || income <= 0) {
      alert('Please enter a valid monthly income');
      return;
    }

    // Calculate disposable income
    const disposableIncome = income - expenses - existingEMI;
    
    // EMI to income ratio (typically 40-50% for home loans)
    const maxEMIRatio = employmentType === 'salaried' ? 0.5 : 0.4;
    const maxAffordableEMI = income * maxEMIRatio - existingEMI;
    
    // Credit score multiplier
    let creditMultiplier = 1;
    if (score >= 800) creditMultiplier = 1.2;
    else if (score >= 750) creditMultiplier = 1.1;
    else if (score >= 700) creditMultiplier = 1.0;
    else if (score >= 650) creditMultiplier = 0.9;
    else creditMultiplier = 0.7;

    // Age factor (younger age allows longer tenure)
    const maxTenure = Math.min(30, 65 - userAge);
    const avgInterestRate = 0.085 / 12; // 8.5% annual rate
    const tenureMonths = maxTenure * 12;

    // Calculate max loan amount using EMI formula
    const maxEMI = Math.min(maxAffordableEMI, disposableIncome * 0.6);
    const maxLoanAmount = maxEMI > 0 ? 
      (maxEMI * (Math.pow(1 + avgInterestRate, tenureMonths) - 1)) / 
      (avgInterestRate * Math.pow(1 + avgInterestRate, tenureMonths)) * creditMultiplier : 0;

    // Calculate eligibility score (0-100)
    let eligibilityScore = 0;
    if (disposableIncome > 0) eligibilityScore += 30;
    if (score >= 750) eligibilityScore += 25;
    else if (score >= 700) eligibilityScore += 20;
    else if (score >= 650) eligibilityScore += 15;
    else eligibilityScore += 10;
    
    if (employmentType === 'salaried') eligibilityScore += 20;
    else eligibilityScore += 15;
    
    if (userAge >= 25 && userAge <= 45) eligibilityScore += 15;
    else if (userAge >= 18 && userAge <= 55) eligibilityScore += 10;
    else eligibilityScore += 5;

    if (maxAffordableEMI > existingEMI) eligibilityScore += 10;

    // Generate recommendations
    const recommendations = [];
    if (score < 750) {
      recommendations.push('Improve your credit score to get better loan terms');
    }
    if (disposableIncome < income * 0.3) {
      recommendations.push('Consider reducing monthly expenses to improve eligibility');
    }
    if (existingEMI > income * 0.2) {
      recommendations.push('Consider paying off existing loans to improve eligibility');
    }
    if (userAge > 50) {
      recommendations.push('Consider applying soon as age affects maximum loan tenure');
    }
    if (employmentType === 'self-employed') {
      recommendations.push('Maintain consistent income documentation for better rates');
    }
    if (recommendations.length === 0) {
      recommendations.push('You have good eligibility! Consider comparing offers from multiple lenders');
    }

    setResult({
      maxLoanAmount: Math.max(0, maxLoanAmount),
      recommendedEMI: Math.max(0, maxEMI),
      eligibilityScore: Math.min(100, eligibilityScore),
      recommendations
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const shareResults = () => {
    if (!result) return;

    const shareText = `Loan Eligibility Results:
Monthly Income: ${formatCurrency(parseFloat(monthlyIncome))}
Max Loan Amount: ${formatCurrency(result.maxLoanAmount)}
Recommended EMI: ${formatCurrency(result.recommendedEMI)}
Eligibility Score: ${result.eligibilityScore}/100`;

    if (navigator.share) {
      navigator.share({
        title: 'Loan Eligibility Results',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Loan Eligibility Calculator</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="e.g., 100000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="monthlyExpenses">Monthly Expenses (₹)</Label>
              <Input
                id="monthlyExpenses"
                type="number"
                placeholder="e.g., 30000"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="existingEMIs">Existing EMIs (₹)</Label>
              <Input
                id="existingEMIs"
                type="number"
                placeholder="e.g., 15000"
                value={existingEMIs}
                onChange={(e) => setExistingEMIs(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="employmentType">Employment Type</Label>
              <select
                id="employmentType"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                <option value="salaried">Salaried</option>
                <option value="self-employed">Self Employed</option>
                <option value="business">Business Owner</option>
              </select>
            </div>

            <div>
              <Label htmlFor="creditScore">Credit Score</Label>
              <Input
                id="creditScore"
                type="number"
                placeholder="e.g., 750"
                value={creditScore}
                onChange={(e) => setCreditScore(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g., 35"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <Button onClick={calculateEligibility} className="w-full">
              Check Eligibility
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Eligibility Results</h3>
              
              <div className={`p-4 rounded-lg ${getScoreBackground(result.eligibilityScore)}`}>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Eligibility Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(result.eligibilityScore)}`}>
                    {result.eligibilityScore}/100
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Maximum Loan Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(result.maxLoanAmount)}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Recommended EMI</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(result.recommendedEMI)}
                </p>
              </div>

              <Button onClick={shareResults} variant="outline" className="w-full">
                Share Results
              </Button>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {result && result.recommendations.length > 0 && (
          <div className="mt-8">
            <Separator className="mb-4" />
            <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
            <div className="space-y-2">
              {result.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Disclaimer:</strong> This is an indicative calculation based on the information provided. 
            Actual loan eligibility may vary based on lender policies, documentation, and other factors. 
            Please consult with financial institutions for accurate assessment.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoanEligibilityCalculator;