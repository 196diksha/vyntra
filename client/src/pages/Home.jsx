import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['All', 'Electronics', 'Clothing', 'Home & Kitchen', 'Beauty']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'All' ? { category: selectedCategory } : {};
      const { data } = await axios.get('/api/products', { params });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const formatPrice = (value) => (
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)
  );

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 mb-12 text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Vyntra</h1>
            <p className="text-xl mb-6">Discover amazing products at unbeatable prices</p>
            <Link to="/products" className="btn btn-outline text-white">
              Shop Now
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h2>
            <Link to="/products" className="text-primary hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="bg-gray-300 h-48" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2" />
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4" />
                    <div className="h-6 bg-gray-300 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {products.map(product => (
                <motion.div 
                  key={product._id} 
                  className="card"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <Link to={`/product/${product._id}`}>
                    <div className="h-48 overflow-hidden relative">
                      {product.images?.[0] ? (
                        <img 
                          src={`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}${product.images[0]}`} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          No image
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          toggleWishlist(product);
                        }}
                        className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow"
                        aria-label="Toggle wishlist"
                      >
                        <FiHeart
                          className={isInWishlist(product._id) ? 'text-red-500' : 'text-gray-600'}
                        />
                      </button>
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    </Link>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FiStar 
                          key={i} 
                          className={i < Math.round(product.rating || 4.5) ? 'text-yellow-500' : 'text-gray-300'} 
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">({product.reviews?.length ?? 0})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                      <button
                        type="button"
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                        onClick={() => addToCart(product, 1, { size: product.sizes?.[0] || '' })}
                        aria-label="Add to cart"
                      >
                        <FiShoppingCart />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
