import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminUsersProps {
  title?: string;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ title = 'Admin Users' }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📥 Fetching users from /api/admin/users');
      
      const response = await api.get('/admin/users');
      
      // Handle response structure: { users: [...] }
      const usersData = response.data.users || response.data;
      console.log('✅ Users fetched successfully:', usersData.length, 'users');
      
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err: any) {
      console.error('❌ Error fetching users:', err);
      
      // Provide user-friendly error messages
      if (err.response?.status === 401) {
        setError('Unauthorized. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view users. Admin access required.');
      } else if (err.response?.status === 404) {
        setError('Users endpoint not found. Backend may not be configured.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch users');
      }
      
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply verification filter
    if (verifiedFilter !== 'all') {
      const isVerifiedValue = verifiedFilter === 'verified';
      filtered = filtered.filter(user => user.isVerified === isVerifiedValue);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, search, roleFilter, verifiedFilter]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Export to CSV
  const handleExport = () => {
    if (filteredUsers.length === 0) {
      alert('No users to export');
      return;
    }

    const headers = ['Name', 'Email', 'Role', 'Verified', 'Created Date'];
    const rows = filteredUsers.map(user => [
      user.name,
      user.email,
      user.role,
      user.isVerified ? 'Yes' : 'No',
      new Date(user.createdAt).toLocaleDateString()
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Statistics
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const verifiedUsers = users.filter(u => u.isVerified).length;

  // Loading state
  if (loading) {
    return (
      <div className="admin-users-container loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="admin-users-container error">
        <div className="error-card">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchUsers}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-container">
      {/* Header */}
      <div className="admin-header">
        <h1>{title}</h1>
        <p className="subtitle">Manage all users in the system</p>
      </div>

      {/* Statistics */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Admins</div>
          <div className="stat-value">{adminUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Verified</div>
          <div className="stat-value">{verifiedUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unverified</div>
          <div className="stat-value">{totalUsers - verifiedUsers}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-section">
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="recruiter">Recruiter</option>
          </select>

          <select
            className="filter-select"
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
          >
            <option value="all">All Verification Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        <div className="action-buttons">
          <button className="btn-refresh" onClick={fetchUsers}>
            ⟳ Refresh
          </button>
          <button className="btn-export" onClick={handleExport}>
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-section">
        {currentUsers.length === 0 ? (
          <div className="no-results">
            <p>
              {filteredUsers.length === 0 && (search || roleFilter !== 'all' || verifiedFilter !== 'all')
                ? 'No users match your filters'
                : 'No users found'}
            </p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user._id || user.id}>
                      <td className="name-cell">
                        <span className="user-name">{user.name}</span>
                      </td>
                      <td className="email-cell">{user.email}</td>
                      <td className="role-cell">
                        <span className={`role-badge role-${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="verified-cell">
                        <span className={`badge ${user.isVerified ? 'badge-verified' : 'badge-unverified'}`}>
                          {user.isVerified ? '✓ Verified' : '✗ Unverified'}
                        </span>
                      </td>
                      <td className="date-cell">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn-pagination"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                <div className="page-info">
                  Page {currentPage} of {totalPages}
                  <br />
                  ({indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length})
                </div>

                <button
                  className="btn-pagination"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
