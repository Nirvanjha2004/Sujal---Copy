import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { httpClient } from '@/shared/lib/httpClient';
import { Layout } from '@/components/layout/Layout';
import { AdminLayout } from '../layout/AdminLayout';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  propertiesCount: number;
  inquiriesCount: number;
}

const ROLES = [
  { value: 'buyer', label: 'Buyer', description: 'Can search and inquire about properties' },
  { value: 'owner', label: 'Owner', description: 'Can list and manage their own properties' },
  { value: 'agent', label: 'Agent', description: 'Can manage multiple properties and clients' },
  { value: 'builder', label: 'Builder', description: 'Can create and manage development projects' },
  { value: 'admin', label: 'Admin', description: 'Full system access and management' },
];

export function RoleAssignment() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (selectedRole) params.append('role', selectedRole);
      if (searchTerm) params.append('search', searchTerm);

      const response = await httpClient.get<{ success: boolean; data: { users: User[]; total: number; totalPages: number } }>(`/admin/users?${params}`);
      const data = response.data;
      
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      await httpClient.put(`/admin/users/${userId}/status`, { role: newRole });
      setShowRoleModal(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update user role');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      agent: 'bg-blue-100 text-blue-800',
      builder: 'bg-green-100 text-green-800',
      owner: 'bg-yellow-100 text-yellow-800',
      buyer: 'bg-gray-100 text-gray-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleDescription = (role: string) => {
    const roleInfo = ROLES.find(r => r.value === role);
    return roleInfo?.description || '';
  };

  if (loading && users.length === 0) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Assignment</h1>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </div>

          {/* Role Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {ROLES.map((role) => (
              <Card key={role.value} className="p-4">
                <div className="text-center">
                  <Badge className={`${getRoleBadgeColor(role.value)} mb-2`}>
                    {role.label}
                  </Badge>
                  <p className="text-xs text-gray-600">{role.description}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                <div className="flex">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={handleSearch} className="rounded-l-none">
                    <Icon icon="solar:magnifer-bold" className="size-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <Badge className={`${getRoleBadgeColor(user.role)} capitalize mb-1`}>
                            {user.role}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {getRoleDescription(user.role)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant={user.isVerified ? "default" : "secondary"}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Properties: {user.propertiesCount}</div>
                        <div>Inquiries: {user.inquiriesCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRoleModal(user)}
                        >
                          <Icon icon="solar:user-id-bold" className="size-4 mr-1" />
                          Change Role
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <Icon icon="solar:danger-triangle-bold" className="size-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Change User Role</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
              >
                <Icon icon="solar:close-circle-bold" className="size-4" />
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Changing role for: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Current role: <Badge className={getRoleBadgeColor(selectedUser.role)}>{selectedUser.role}</Badge>
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Select new role:</p>
              {ROLES.map((role) => (
                <div
                  key={role.value}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedUser.role === role.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => {
                    if (selectedUser.role !== role.value) {
                      if (confirm(`Are you sure you want to change ${selectedUser.firstName}'s role to ${role.label}?`)) {
                        updateUserRole(selectedUser.id, role.value);
                      }
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className={getRoleBadgeColor(role.value)}>
                        {role.label}
                      </Badge>
                      {selectedUser.role === role.value && (
                        <Badge variant="secondary" className="ml-2">Current</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{role.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}