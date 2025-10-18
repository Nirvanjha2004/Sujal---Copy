import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Reusable card wrapper component for consistent auth form styling
 * Provides consistent layout and styling for all auth-related forms
 */
export function AuthCard({ title, children, className }: AuthCardProps) {
  return (
    <Card className={`shadow-2xl ${className || ''}`}>
      {title && (
        <CardHeader>
          <CardTitle className="text-center">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}