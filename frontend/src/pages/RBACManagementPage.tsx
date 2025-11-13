import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, UserPlus, Award, Lock, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import KPICard from '../components/KPICard';
import SkeletonLoader from '../components/SkeletonLoader';
import Modal from '../components/Modal';
import api from '../services/api';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: Record<string, string[]>;
}

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  roles: Array<{ id: string; name: string; display_name: string }>;
  permissions: Record<string, string[]>;
  is_superuser: boolean;
}

interface UserRole {
  id: string;
  user: string;
  role: string;
  user_email: string;
  user_name: string;
  role_details: Role;
  assigned_at: string;
  assigned_by_name: string;
}

const RBACManagementPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, usersRes, userRolesRes] = await Promise.all([
        api.get('/rbac/roles/'),
        api.get('/rbac/users/'),
        api.get('/rbac/user-roles/'),
      ]);
      setRoles(rolesRes.data);
      setUsers(usersRes.data);
      setUserRoles(userRolesRes.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load RBAC data');
    } finally {
      setLoading(false);
    }
  };

  const initializeRoles = async () => {
    try {
      await api.post('/rbac/initialize/');
      toast.success('Default roles initialized successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to initialize roles');
    }
  };

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error('Please select both user and role');
      return;
    }

    try {
      await api.post('/rbac/assign-role/', {
        user_id: selectedUser,
        role_id: selectedRole,
      });
      toast.success('Role assigned successfully');
      setIsModalOpen(false);
      setSelectedUser('');
      setSelectedRole('');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to assign role');
    }
  };

  const removeRole = async (userRoleId: string) => {
    if (!confirm('Are you sure you want to remove this role assignment?')) return;

    try {
      await api.delete(`/rbac/user-roles/${userRoleId}/`);
      toast.success('Role removed successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove role');
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'badge-danger';
      case 'analyst':
        return 'badge-primary';
      case 'viewer':
        return 'badge-secondary';
      default:
        return 'badge-info';
    }
  };

  const totalAssignments = userRoles.length;
  const adminCount = users.filter((u) => u.roles.some((r) => r.name === 'admin')).length;
  const analystCount = users.filter((u) => u.roles.some((r) => r.name === 'analyst')).length;

  if (loading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="page-header">
          <h1 className="page-title">RBAC Management</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonLoader type="card" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-danger-500 to-danger-600 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="page-title">RBAC Management</h1>
        </div>
        <div className="flex gap-3">
          {roles.length === 0 && (
            <Button onClick={initializeRoles} variant="outline" icon={<Award size={18} />}>
              Initialize Roles
            </Button>
          )}
          <Button onClick={() => setIsModalOpen(true)} icon={<UserPlus size={18} />}>
            Assign Role
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total Users"
          value={users.length}
          icon={<Users size={24} />}
          color="primary"
        />
        <KPICard
          title="Administrators"
          value={adminCount}
          icon={<Shield size={24} />}
          color="danger"
        />
        <KPICard
          title="Analysts"
          value={analystCount}
          icon={<Award size={24} />}
          color="info"
        />
        <KPICard
          title="Role Assignments"
          value={totalAssignments}
          icon={<Lock size={24} />}
          color="success"
        />
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Users & Assignments
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'roles'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Roles & Permissions
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'users' ? (
            <div className="space-y-4">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {user.full_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {user.is_superuser && (
                            <span className="badge badge-warning">
                              <Shield size={12} className="mr-1" />
                              Superuser
                            </span>
                          )}
                          {user.roles.map((role) => (
                            <span key={role.id} className={`badge ${getRoleBadgeColor(role.name)}`}>
                              {role.display_name}
                            </span>
                          ))}
                          {user.roles.length === 0 && !user.is_superuser && (
                            <span className="text-xs text-gray-500">No roles assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {userRoles
                        .filter((ur) => ur.user === user.id)
                        .map((ur) => (
                          <Button
                            key={ur.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRole(ur.id)}
                            icon={<X size={14} />}
                            className="text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                          >
                            Remove {ur.role_details.display_name}
                          </Button>
                        ))}
                    </div>
                  </div>

                  {/* Permissions Preview */}
                  {Object.keys(user.permissions).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Permissions:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(user.permissions).map(([resource, actions]) => (
                          <div
                            key={resource}
                            className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded"
                          >
                            <span className="font-medium capitalize">{resource}:</span>{' '}
                            {(actions as string[]).join(', ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-hover"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {role.display_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Permissions:
                    </h4>
                    {Object.entries(role.permissions).map(([resource, actions]) => (
                      <div key={resource} className="space-y-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                          {resource}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(actions as string[]).map((action) => (
                            <span
                              key={action}
                              className="inline-flex items-center gap-1 text-xs bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-400 px-2 py-0.5 rounded"
                            >
                              <Check size={10} />
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser('');
          setSelectedRole('');
        }}
        title="Assign Role to User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="select"
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="select"
            >
              <option value="">Choose a role...</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedUser('');
                setSelectedRole('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={assignRole}>Assign Role</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RBACManagementPage;
