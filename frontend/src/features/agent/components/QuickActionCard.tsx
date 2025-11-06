import { Card, CardContent } from '@/shared/components/ui/card';
import { Icon } from '@iconify/react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  onClick: () => void;
  className?: string;
}

const QuickActionCard = ({ 
  title, 
  description, 
  icon, 
  iconColor, 
  onClick, 
  className 
}: QuickActionCardProps) => {
  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${className || ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${
            iconColor === 'text-purple-600' ? 'bg-purple-100' :
            iconColor === 'text-orange-600' ? 'bg-orange-100' :
            iconColor === 'text-blue-600' ? 'bg-blue-100' :
            'bg-gray-100'
          }`}>
            <Icon 
              icon={icon} 
              className={`size-6 ${iconColor}`} 
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionCard;