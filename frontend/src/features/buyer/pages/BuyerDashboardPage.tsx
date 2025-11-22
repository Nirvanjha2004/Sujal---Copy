import { Layout } from '@/shared/components/layout/Layout';
import { BuyerDashboard } from '../components/BuyerDashboard';

export function BuyerDashboardPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <BuyerDashboard />
      </div>
    </Layout>
  );
}