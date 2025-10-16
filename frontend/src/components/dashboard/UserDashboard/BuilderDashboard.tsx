import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
  location: string;
  phase: string;
  units: number;
  sold: number;
  status: string;
}

interface BuilderDashboardProps {
  stats: {
    totalProjects: number;
    activeProjects: number;
    unitsListed: number;
    unitsAvailable: number;
    totalInquiries: number;
    messages: number;
  };
  recentProjects: Project[];
}

export function BuilderDashboard({ stats, recentProjects }: BuilderDashboardProps) {
  const { state } = useAuth();
  const navigate = useNavigate();

  const actions = [
    {
      title: 'New Project',
      description: 'Start a new construction project',
      icon: 'solar:hammer-bold',
      action: () => navigate('/builder/new-project'),
      color: 'bg-primary'
    },
    {
      title: 'Project Portfolio',
      description: 'Manage all construction projects',
      icon: 'solar:buildings-2-bold',
      action: () => navigate('/builder/projects'),
      color: 'bg-blue-600'
    },
    {
      title: 'Buyer Communication',
      description: 'Messages and project inquiries',
      icon: 'solar:letter-bold',
      action: () => navigate('/dashboard/messages'),
      color: 'bg-indigo-600'
    }
  ];

  const statsCards = [
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      total: stats.totalProjects,
      icon: 'solar:buildings-2-bold',
      color: 'bg-primary/10 text-primary',
      subtitle: `${stats.totalProjects} total projects`
    },
    {
      title: 'Units Available',
      value: stats.unitsAvailable,
      total: stats.unitsListed,
      icon: 'solar:home-2-bold',
      color: 'bg-blue-100 text-blue-600',
      subtitle: `${stats.unitsListed} total units`
    },
    {
      title: 'Inquiries',
      value: stats.totalInquiries,
      icon: 'solar:chat-round-bold',
      color: 'bg-orange-100 text-orange-600',
      subtitle: 'This month'
    },
    {
      title: 'Messages',
      value: stats.messages,
      icon: 'solar:letter-bold',
      color: 'bg-green-100 text-green-600',
      subtitle: 'Unread messages'
    }
  ];

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
          Welcome back, {state.user?.firstName} {state.user?.lastName}!
        </h1>
        <p className="text-muted-foreground">
          Manage your construction projects and development portfolio
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 ${stat.color} rounded-full`}>
                  <Icon icon={stat.icon} className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.total && (
                      <span className="text-sm text-muted-foreground">
                        / {stat.total}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-heading font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6" onClick={action.action}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${action.color} rounded-full`}>
                    <Icon icon={action.icon} className="size-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon icon="solar:buildings-2-bold" className="size-5" />
                Recent Projects
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/builder/projects')}
              >
                View All Projects
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        <Badge className={getProjectStatusColor(project.status)}>
                          {project.phase}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <Icon icon="solar:map-point-bold" className="size-4 inline mr-1" />
                        {project.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Units: {project.units}
                        </span>
                        <span className="text-muted-foreground">
                          Sold: {project.sold}
                        </span>
                        <span className="text-muted-foreground">
                          Available: {project.units - project.sold}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/builder/projects/${project.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/builder/projects/${project.id}/units`)}
                      >
                        Manage Units
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon icon="solar:buildings-2-bold" className="size-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first construction project
                </p>
                <Button onClick={() => navigate('/builder/new-project')}>
                  <Icon icon="solar:hammer-bold" className="size-4 mr-2" />
                  Create New Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}