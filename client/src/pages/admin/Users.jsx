import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState('');
  const { currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/users');
      setUsers(data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRoleChange = async (userId, nextRole) => {
    try {
      setUpdatingUserId(userId);
      await axios.put(`/api/admin/users/${userId}/role`, { role: nextRole });
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingUserId('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="mt-2 text-sm text-gray-500">
              Promote or demote users here instead of changing roles directly in the database.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="card p-6">Loading users...</div>
        ) : error ? (
          <div className="card p-6 text-red-600">{error}</div>
        ) : users.length === 0 ? (
          <div className="card p-6">No users found.</div>
        ) : (
          <div className="card p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            user.role === 'admin'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex justify-end gap-3">
                          {user.role === 'admin' ? (
                            <button
                              onClick={() => handleRoleChange(user._id, 'user')}
                              disabled={updatingUserId === user._id || currentUser?._id === user._id}
                              className="rounded-md border border-amber-300 px-3 py-1 text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Make User
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(user._id, 'admin')}
                              disabled={updatingUserId === user._id}
                              className="rounded-md border border-indigo-300 px-3 py-1 text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Make Admin
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={user.role === 'admin'}
                            className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
