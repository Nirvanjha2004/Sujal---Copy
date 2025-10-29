import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { Inquiry } from '@/features/dashboard/hooks/useInquiries';

interface InquiryListProps {
  inquiries: Inquiry[];
  isLoading?: boolean;
  onInquiryClick?: (inquiry: Inquiry) => void;
  showEmpty?: boolean;
  maxItems?: number;
  title?: string;
}

function InquiryCard({ inquiry, onClick }: { inquiry: Inquiry; onClick?: () => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return 'solar:bell-bold';
      case 'contacted':
        return 'solar:chat-round-bold';
      case 'closed':
        return 'solar:check-circle-bold';
      default:
        return 'solar:question-circle-bold';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const targetName = inquiry.property?.title || inquiry.project?.name || 'Unknown';
  const targetType = inquiry.property ? 'Property' : inquiry.project ? 'Project' : 'Unknown';
  const targetIcon = inquiry.property ? 'solar:home-2-bold' : 'solar:buildings-2-bold';

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
        inquiry.status === 'new' ? 'border-l-blue-500' : 
        inquiry.status === 'contacted' ? 'border-l-yellow-500' : 'border-l-green-500'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground truncate">{inquiry.name}</h4>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getStatusColor(inquiry.status))}
                >
                  <Icon icon={getStatusIcon(inquiry.status)} className="size-3 mr-1" />
                  {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Icon icon={targetIcon} className="size-4" />
                <span className="truncate">{targetName}</span>
                <span className="text-xs">({targetType})</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {formatDate(inquiry.created_at)}
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon icon="solar:letter-bold" className="size-4" />
              <span className="truncate">{inquiry.email}</span>
            </div>
            {inquiry.phone && (
              <div className="flex items-center gap-1">
                <Icon icon="solar:phone-bold" className="size-4" />
                <span>{inquiry.phone}</span>
              </div>
            )}
          </div>

          {/* Message Preview */}
          <div className="text-sm text-foreground">
            <p className="line-clamp-2 leading-relaxed">
              {inquiry.message}
            </p>
          </div>

          {/* Location Info for Projects */}
          {inquiry.project && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon icon="solar:map-point-bold" className="size-3" />
              <span>{inquiry.project.city}, {inquiry.project.state}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function InquiryList({ 
  inquiries, 
  isLoading = false, 
  onInquiryClick,
  showEmpty = true,
  maxItems,
  title = "Recent Inquiries"
}: InquiryListProps) {
  // Ensure inquiries is always an array
  const safeInquiries = Array.isArray(inquiries) ? inquiries : [];
  const displayInquiries = maxItems ? safeInquiries.slice(0, maxItems) : safeInquiries;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:chat-round-bold" className="size-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:chat-round-bold" className="size-5 text-primary" />
            {title}
            {safeInquiries.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {safeInquiries.length}
              </Badge>
            )}
          </CardTitle>
          {maxItems && safeInquiries.length > maxItems && (
            <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              View All ({safeInquiries.length})
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayInquiries.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayInquiries.map((inquiry) => (
              <InquiryCard
                key={inquiry.id}
                inquiry={inquiry}
                onClick={() => onInquiryClick?.(inquiry)}
              />
            ))}
          </div>
        ) : showEmpty ? (
          <div className="text-center py-12">
            <Icon icon="solar:chat-round-bold" className="size-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No inquiries yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Inquiries from potential buyers for your properties and projects will appear here
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}