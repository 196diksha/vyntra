const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const totalSales = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    const recentSales = totalSales[0] ? totalSales[0].total : 0;
    
    // Sales data for chart (last 7 days)
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    const dailySales = await Order.aggregate([
      { $match: { 
          isPaid: true, 
          createdAt: { $gte: lastWeek, $lte: today } 
      }},
      { 
        $group: { 
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } 
          }, 
          total: { $sum: "$totalPrice" } 
        } 
      },
      { $sort: { "_id": 1 } }
    ]);
    
    // Format data for chart
    const chartData = {
      labels: dailySales.map(item => item._id),
      data: dailySales.map(item => item.total)
    };
    
    res.json({
      userCount,
      productCount,
      orderCount,
      recentSales,
      recentOrders: orders,
      chartData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      if (user.role === 'admin') {
        return res.status(400).json({ message: 'Cannot delete admin user' });
      }
      
      await user.remove();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
