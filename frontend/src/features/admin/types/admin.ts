export interface AdminTab {
  id: string;
  label: string;
  icon: string;
  description: string;
  badge?: string;
  color?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
  count?: number;
}