import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/api/orders/myorders');
        setOrders(data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="card p-6 mb-8">
          <p className="text-sm text-gray-600">Name</p>
          <p className="text-lg font-semibold">{currentUser?.name || 'User'}</p>
          <p className="text-sm text-gray-600 mt-4">Email</p>
          <p className="text-lg font-semibold">{currentUser?.email || 'N/A'}</p>
          <p className="text-sm text-gray-600 mt-4">Role</p>
          <p className="text-lg font-semibold capitalize">{currentUser?.role || 'user'}</p>
        </div>

        <h2 className="text-2xl font-bold mb-4">My Orders</h2>
        {loading ? (
          <div className="card p-6">Loading orders...</div>
        ) : error ? (
          <div className="card p-6 text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div className="card p-6">No orders found.</div>
        ) : (
          <div className="card p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {order._id.substring(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        ${order.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
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

export default Profile;
