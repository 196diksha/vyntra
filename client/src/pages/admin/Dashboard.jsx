import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign } from 'react-icons/fi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
 const [stats, setStats] = useState({
  userCount: 0,
  productCount: 0,
  orderCount: 0,
  recentSales: 0,
  recentOrders: [],
  chartData: { 
    labels: [], 
    data: [] 
  }
});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/admin/dashboard');
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard ', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Overview (Last 7 Days)',
      },
    },
  };

  const chartData = {
    labels: stats.chartData.labels,
    datasets: [
      {
        label: 'Sales ($)',
        data: stats.chartData.data,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color} text-white mr-4`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-24" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={FiUsers} 
                title="Total Users" 
                value={stats.userCount} 
                color="bg-blue-500" 
              />
              <StatCard 
                icon={FiPackage} 
                title="Total Products" 
                value={stats.productCount} 
                color="bg-green-500" 
              />
              <StatCard 
                icon={FiShoppingBag} 
                title="Total Orders" 
                value={stats.orderCount} 
                color="bg-yellow-500" 
              />
              <StatCard 
                icon={FiDollarSign} 
                title="Recent Sales" 
                value={`$${stats.recentSales.toFixed(2)}`} 
                color="bg-purple-500" 
              />
            </div>
            
            {/* Sales Chart */}
            <div className="card mb-8 p-6">
              <Line options={chartOptions} data={chartData} />
            </div>
            
            {/* Recent Orders */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                {stats.recentOrders.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentOrders.map(order => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order._id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.user?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${order.totalPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                ) : (
                  <p className="text-gray-500">No recent orders</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
