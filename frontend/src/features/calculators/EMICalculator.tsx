import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';

interface EMIResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  monthlyBreakdown: Array<{
    month: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

const EMICalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [loanTenure, setLoanTenure] = useState<string>('');
  const [result, setResult] = useState<EMIResult | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const calculateEMI = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const tenure = parseInt(loanTenure) * 12; // Convert years to months

    if (!principal || !rate || !tenure) {
      alert('Please fill in all fields with valid numbers');
      return;
    }

    // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
    const totalAmount = emi * tenure;
    const totalInterest = totalAmount - principal;

    // Calculate monthly breakdown
    const monthlyBreakdown = [];
    let balance = principal;

    for (let month = 1; month <= tenure; month++) {
      const interestPayment = balance * rate;
      const principalPayment = emi - interestPayment;
      balance -= principalPayment;

      monthlyBreakdown.push({
        month,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }

    setResult({
      emi,
      totalAmount,
      totalInterest,
      monthlyBreakdown
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const shareResults = () => {
    if (!result) return;

    const shareText = `EMI Calculator Results:
Loan Amount: ${formatCurrency(parseFloat(loanAmount))}
Interest Rate: ${interestRate}% per annum
Loan Tenure: ${loanTenure} years
Monthly EMI: ${formatCurrency(result.emi)}
Total Amount: ${formatCurrency(result.totalAmount)}
Total Interest: ${formatCurrency(result.totalInterest)}`;

    if (navigator.share) {
      navigator.share({
        title: 'EMI Calculator Results',
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
        <h2 className="text-2xl font-bold mb-6">EMI Calculator</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
              <Input
                id="loanAmount"
                type="number"
                placeholder="e.g., 5000000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="interestRate">Interest Rate (% per annum)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                placeholder="e.g., 8.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="loanTenure">Loan Tenure (Years)</Label>
              <Input
                id="loanTenure"
                type="number"
                placeholder="e.g., 20"
                value={loanTenure}
                onChange={(e) => setLoanTenure(e.target.value)}
              />
            </div>

            <Button onClick={calculateEMI} className="w-full">
              Calculate EMI
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Calculation Results</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Monthly EMI</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(result.emi)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(result.totalAmount)}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Total Interest</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(result.totalInterest)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={shareResults} variant="outline" className="flex-1">
                  Share Results
                </Button>
                <Button 
                  onClick={() => setShowBreakdown(!showBreakdown)} 
                  variant="outline"
                  className="flex-1"
                >
                  {showBreakdown ? 'Hide' : 'Show'} Breakdown
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Breakdown Table */}
        {result && showBreakdown && (
          <div className="mt-8">
            <Separator className="mb-4" />
            <h3 className="text-xl font-semibold mb-4">Monthly Payment Breakdown</h3>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Month</th>
                    <th className="p-2 text-right">Principal</th>
                    <th className="p-2 text-right">Interest</th>
                    <th className="p-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.monthlyBreakdown.slice(0, 12).map((month) => (
                    <tr key={month.month} className="border-b">
                      <td className="p-2">{month.month}</td>
                      <td className="p-2 text-right">{formatCurrency(month.principal)}</td>
                      <td className="p-2 text-right">{formatCurrency(month.interest)}</td>
                      <td className="p-2 text-right">{formatCurrency(month.balance)}</td>
                    </tr>
                  ))}
                  {result.monthlyBreakdown.length > 12 && (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-gray-500">
                        ... and {result.monthlyBreakdown.length - 12} more months
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EMICalculator;