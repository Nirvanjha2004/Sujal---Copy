import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';


interface PropertyData {
  id: string;
  name: string;
  price: number;
  area: number;
  loanAmount: number;
  interestRate: number;
  tenure: number;
  maintenanceCost: number;
  registrationCost: number;
  otherCosts: number;
}

interface ComparisonResult {
  property: PropertyData;
  emi: number;
  totalCost: number;
  totalInterest: number;
  pricePerSqft: number;
  monthlyMaintenance: number;
  totalInitialCost: number;
  roi: number;
}

const PropertyComparisonCalculator: React.FC = () => {
  const [properties, setProperties] = useState<PropertyData[]>([
    {
      id: '1',
      name: 'Property 1',
      price: 0,
      area: 0,
      loanAmount: 0,
      interestRate: 8.5,
      tenure: 20,
      maintenanceCost: 0,
      registrationCost: 0,
      otherCosts: 0
    },
    {
      id: '2',
      name: 'Property 2',
      price: 0,
      area: 0,
      loanAmount: 0,
      interestRate: 8.5,
      tenure: 20,
      maintenanceCost: 0,
      registrationCost: 0,
      otherCosts: 0
    }
  ]);

  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [activeTab, setActiveTab] = useState('input');

  const updateProperty = (index: number, field: keyof PropertyData, value: string | number) => {
    const updatedProperties = [...properties];
    updatedProperties[index] = {
      ...updatedProperties[index],
      [field]: typeof value === 'string' ? (isNaN(parseFloat(value)) ? value : parseFloat(value)) : value
    };
    setProperties(updatedProperties);
  };

  const addProperty = () => {
    if (properties.length < 3) {
      const newProperty: PropertyData = {
        id: (properties.length + 1).toString(),
        name: `Property ${properties.length + 1}`,
        price: 0,
        area: 0,
        loanAmount: 0,
        interestRate: 8.5,
        tenure: 20,
        maintenanceCost: 0,
        registrationCost: 0,
        otherCosts: 0
      };
      setProperties([...properties, newProperty]);
    }
  };

  const removeProperty = (index: number) => {
    if (properties.length > 2) {
      const updatedProperties = properties.filter((_, i) => i !== index);
      setProperties(updatedProperties);
    }
  };

  const calculateComparison = () => {
    const calculatedResults: ComparisonResult[] = properties.map((property) => {
      const { price, area, loanAmount, interestRate, tenure, maintenanceCost, registrationCost, otherCosts } = property;
      
      // EMI Calculation
      const monthlyRate = interestRate / 100 / 12;
      const tenureMonths = tenure * 12;
      const emi = loanAmount > 0 ? 
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
        (Math.pow(1 + monthlyRate, tenureMonths) - 1) : 0;

      // Total costs
      const totalInterest = (emi * tenureMonths) - loanAmount;
      const totalCost = price + totalInterest;
      const pricePerSqft = area > 0 ? price / area : 0;
      const monthlyMaintenance = maintenanceCost / 12;
      const totalInitialCost = price - loanAmount + registrationCost + otherCosts;
      
      // Simple ROI calculation (assuming 5% annual appreciation)
      const futureValue = price * Math.pow(1.05, tenure);
      const roi = ((futureValue - totalCost) / totalCost) * 100;

      return {
        property,
        emi,
        totalCost,
        totalInterest,
        pricePerSqft,
        monthlyMaintenance,
        totalInitialCost,
        roi
      };
    });

    setResults(calculatedResults);
    setActiveTab('comparison');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBestValue = (field: keyof ComparisonResult, isLowerBetter: boolean = true) => {
    if (results.length === 0) return null;
    
    const values = results.map(r => r[field] as number);
    const bestValue = isLowerBetter ? Math.min(...values) : Math.max(...values);
    return bestValue;
  };

  const isBestValue = (value: number, field: keyof ComparisonResult, isLowerBetter: boolean = true) => {
    const bestValue = getBestValue(field, isLowerBetter);
    return bestValue === value;
  };

  const shareResults = () => {
    if (results.length === 0) return;

    const shareText = `Property Comparison Results:\n\n${results.map((result) => 
      `${result.property.name}:
Price: ${formatCurrency(result.property.price)}
EMI: ${formatCurrency(result.emi)}
Price per sq ft: ${formatCurrency(result.pricePerSqft)}
Total Cost: ${formatCurrency(result.totalCost)}`
    ).join('\n\n')}`;

    if (navigator.share) {
      navigator.share({
        title: 'Property Comparison Results',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Property Comparison Calculator</h2>
        
        <div className="mb-6">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'input' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('input')}
            >
              Property Details
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'comparison' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('comparison')}
            >
              Comparison Results
            </button>
          </div>
        </div>

        {activeTab === 'input' && (
          <div>
            <div className="grid gap-6">
              {properties.map((property, propertyIndex) => (
                <Card key={property.id} className="p-4 border-2">
                  <div className="flex justify-between items-center mb-4">
                    <Input
                      value={property.name}
                      onChange={(e) => updateProperty(propertyIndex, 'name', e.target.value)}
                      className="text-lg font-semibold border-none p-0 focus:ring-0"
                      placeholder="Property Name"
                    />
                    {properties.length > 2 && (
                      <Button
                        onClick={() => removeProperty(propertyIndex)}
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Property Price (₹)</Label>
                      <Input
                        type="number"
                        value={property.price || ''}
                        onChange={(e) => updateProperty(propertyIndex, 'price', e.target.value)}
                        placeholder="e.g., 5000000"
                      />
                    </div>

                    <div>
                      <Label>Area (sq ft)</Label>
                      <Input
                        type="number"
                        value={property.area_sqft || ''}
                        onChange={(e) => updateProperty(propertyIndex, 'area_sqft', e.target.value)}
                        placeholder="e.g., 1200"
                      />
                    </div>

                    <div>
                      <Label>Loan Amount (₹)</Label>
                      <Input
                        type="number"
                        value={property.loanAmount || ''}
                        onChange={(e) => updateProperty(propertyIndex, 'loanAmount', e.target.value)}
                        placeholder="e.g., 4000000"
                      />
                    </div>

                    <div>
                      <Label>Interest Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={property.interestRate || ''}
                        onChange={(e) => updateProperty(propertyIndex, 'interestRate', e.target.value)}
                        placeholder="e.g., 8.5"
                      />
                    </div>

                    <div>
                      <Label>Loan Tenure (Years)</Label>
                      <Input
                        type="number"
                        value={property.tenure || ''}
                        onChange={(e) => updateProperty(propertyIndex, 'tenure', e.target.value)}
                        placeholder="e.g., 20"
                      />
                    </div>

                    <div>
                      <Label>Annual Maintenance (₹)</Label>
                      <Input
                        type="number"
                        value={property.maintenanceCost || ''}
                        onChange={(e) => updateProperty(propertyIndex, 'maintenanceCost', e.target.value)}
                        placeholder="e.g., 60000"
                      />
                    </div>

                    <div>
                      <Label>Registration Cost (₹)</Label>
                      <Input
                        type="number"
                        value={property.registrationCost || ''}
                        onChange={(e) => updateProperty(propertyIndex, 'registrationCost', e.target.value)}
                        placeholder="e.g., 300000"
                      />
                    </div>

                    <div>
                      <Label>Other Costs (₹)</Label>
                      <Input
                        type="number"
                        value={property.otherCosts || ''}
                        onChange={(e) => updateProperty(propertyIndex, 'otherCosts', e.target.value)}
                        placeholder="e.g., 100000"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              {properties.length < 3 && (
                <Button onClick={addProperty} variant="outline">
                  Add Property
                </Button>
              )}
              <Button onClick={calculateComparison} className="flex-1">
                Compare Properties
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && results.length > 0 && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Comparison Results</h3>
              <Button onClick={shareResults} variant="outline">
                Share Results
              </Button>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Lowest EMI</h4>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(getBestValue('emi', true) || 0)}
                </p>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Best Price/sq ft</h4>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(getBestValue('pricePerSqft', true) || 0)}
                </p>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Lowest Total Cost</h4>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(getBestValue('totalCost', true) || 0)}
                </p>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Best ROI</h4>
                <p className="text-lg font-bold text-orange-600">
                  {(getBestValue('roi', false) || 0).toFixed(1)}%
                </p>
              </Card>
            </div>

            {/* Detailed Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Property</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Price/sq ft</th>
                    <th className="p-3 text-right">Monthly EMI</th>
                    <th className="p-3 text-right">Total Cost</th>
                    <th className="p-3 text-right">Initial Cost</th>
                    <th className="p-3 text-right">Monthly Maintenance</th>
                    <th className="p-3 text-right">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.property.id} className="border-b">
                      <td className="p-3 font-medium">{result.property.name}</td>
                      <td className="p-3 text-right">{formatCurrency(result.property.price)}</td>
                      <td className={`p-3 text-right ${isBestValue(result.pricePerSqft, 'pricePerSqft', true) ? 'bg-blue-50 font-bold text-blue-600' : ''}`}>
                        {formatCurrency(result.pricePerSqft)}
                      </td>
                      <td className={`p-3 text-right ${isBestValue(result.emi, 'emi', true) ? 'bg-green-50 font-bold text-green-600' : ''}`}>
                        {formatCurrency(result.emi)}
                      </td>
                      <td className={`p-3 text-right ${isBestValue(result.totalCost, 'totalCost', true) ? 'bg-purple-50 font-bold text-purple-600' : ''}`}>
                        {formatCurrency(result.totalCost)}
                      </td>
                      <td className="p-3 text-right">{formatCurrency(result.totalInitialCost)}</td>
                      <td className="p-3 text-right">{formatCurrency(result.monthlyMaintenance)}</td>
                      <td className={`p-3 text-right ${isBestValue(result.roi, 'roi', false) ? 'bg-orange-50 font-bold text-orange-600' : ''}`}>
                        {result.roi.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>• Best values are highlighted in the comparison table</p>
                <p>• ROI calculation assumes 5% annual property appreciation</p>
                <p>• Consider location, amenities, and future development plans in your decision</p>
                <p>• Consult with financial advisors for personalized investment advice</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Please fill in property details and calculate to see comparison results.</p>
            <Button onClick={() => setActiveTab('input')} className="mt-4">
              Go to Property Details
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PropertyComparisonCalculator;