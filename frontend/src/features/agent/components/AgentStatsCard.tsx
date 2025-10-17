import { Card, CardContent } from '../../../components/ui/card';

interface AgentStatsCardProps {
  label: string;
  value: number;
  className?: string;
}

const AgentStatsCard = ({ label, value, className }: AgentStatsCardProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="text-sm text-gray-600 mb-1">{label}</div>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );
};

export default AgentStatsCard;