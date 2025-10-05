import React from 'react';
import { Badge } from '../ui/badge';

export type InquiryStatus = 'new' | 'contacted' | 'closed';

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
  className?: string;
}

const statusConfig = {
  new: {
    label: 'New',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  contacted: {
    label: 'Contacted',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  },
  closed: {
    label: 'Closed',
    variant: 'outline' as const,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  },
};

export const InquiryStatusBadge: React.FC<InquiryStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
};