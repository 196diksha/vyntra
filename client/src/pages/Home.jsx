import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowUpRight, FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories] = useState(['All', 'Electronics', 'Clothing', 'Home & Kitchen', 'Beauty']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [heroIndex, setHeroIndex] = useState(0);
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

  const resolveImageUrl = (src) => (
    src?.startsWith('http') ? src : `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}${src}`
  );

  const heroSlides = products
    .filter((item) => item.images?.[0])
    .slice(0, 4)
    .map((item) => ({
      id: item._id,
      image: resolveImageUrl(item.images[0]),
      title: item.name
    }));

  const fallbackSlides = [
    { id: 'hero-1', image: '', title: 'Look 1' },
    { id: 'hero-2', image: '', title: 'Look 2' },
    { id: 'hero-3', image: '', title: 'Look 3' },
    { id: 'hero-4', image: '', title: 'Look 4' }
  ];

  const slides = heroSlides.length > 0 ? heroSlides : fallbackSlides;

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="pb-16">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300 mb-4">Curated drops</p>
              <h1 className="text-4xl md:text-6xl leading-tight mb-6 text-white">
                Discover statement pieces for every vibe.
              </h1>
              <p className="text-lg text-slate-200 mb-8">
                Vyntra blends modern essentials with bold finds. Shop the edit, refresh your wardrobe, and elevate your everyday.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/products" className="btn btn-primary bg-white text-slate-900 hover:bg-amber-200">
                  Shop the Edit
                </Link>
                <Link to="/products" className="btn btn-outline border-white text-white hover:bg-white hover:text-slate-900">
                  Explore Collections
                </Link>
              </div>
              <div className="flex gap-6 mt-10 text-sm text-slate-200">
                <div>
                  <p className="text-2xl font-bold text-white">120+</p>
                  <p className="text-xs uppercase tracking-widest">New arrivals</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">48h</p>
                  <p className="text-xs uppercase tracking-widest">Express ship</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">4.8★</p>
                  <p className="text-xs uppercase tracking-widest">Store rating</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-2xl">
                <div className="relative rounded-2xl overflow-hidden h-72 md:h-80">
                  {slides.map((slide, index) => (
                    <motion.div
                      key={slide.id}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{
                        opacity: heroIndex === index ? 1 : 0,
                        scale: heroIndex === index ? 1 : 1.02
                      }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                      {slide.image ? (
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                          <span className="text-xs uppercase tracking-widest text-white/60">{slide.title}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.3em] text-white/80">
                        {slide.title}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-6 text-xs text-white/70">
                  <span>Premium fabrics</span>
                  <span>Limited drops</span>
                  <span>Designer collabs</span>
                </div>
                <div className="flex gap-2 mt-4">
                  {slides.map((slide, index) => (
                    <button
                      key={`dot-${slide.id}`}
                      type="button"
                      onClick={() => setHeroIndex(index)}
                      className={`h-2 w-6 rounded-full transition ${
                        heroIndex === index ? 'bg-white' : 'bg-white/30'
                      }`}
                      aria-label={`Go to ${slide.title}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl p-6 md:p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Premium Quality', desc: 'Handpicked materials that hold their shape and color.' },
              { title: 'Secure Checkout', desc: 'Encrypted payments with seamless delivery updates.' },
              { title: 'Style Support', desc: 'Personalized picks from our in-house stylists.' }
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">
                  ✦
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold">Shop by Category</h2>
          <Link to="/products" className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-2">
            Browse all <FiArrowUpRight />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                selectedCategory === category
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory === 'All' ? 'Trending Now' : selectedCategory}
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
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                >
                  <Link to={`/product/${product._id}`}>
                    <div className="h-52 overflow-hidden relative">
                      {product.images?.[0] ? (
                        <img 
                          src={resolveImageUrl(product.images[0])} 
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
                          className={i < Math.round(product.rating || 4.5) ? 'text-amber-500' : 'text-slate-200'} 
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">({product.reviews?.length ?? 0})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                      <button
                        type="button"
                        className="p-2 rounded-full bg-slate-900 text-white hover:bg-slate-800"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-amber-100 p-8 text-slate-900">
            <p className="text-xs uppercase tracking-widest text-slate-600">Member perks</p>
            <h3 className="text-2xl font-bold mt-2 mb-4">Earn points on every purchase.</h3>
            <p className="text-sm text-slate-700 mb-6">
              Join Vyntra Rewards for exclusive drops and member-only pricing.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold">
              Join now <FiArrowUpRight />
            </Link>
          </div>
          <div className="rounded-3xl bg-slate-900 p-8 text-white">
            <p className="text-xs uppercase tracking-widest text-slate-400">Just in</p>
            <h3 className="text-2xl font-bold mt-2 mb-4">New season neutrals.</h3>
            <p className="text-sm text-slate-300 mb-6">
              Minimal palettes, maximum impact. Shop elevated essentials curated weekly.
            </p>
            <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold">
              Shop now <FiArrowUpRight />
            </Link>
          </div>
          <div className="rounded-3xl bg-white p-8 border border-slate-100">
            <p className="text-xs uppercase tracking-widest text-slate-400">Shipping</p>
            <h3 className="text-2xl font-bold mt-2 mb-4">Free delivery on ₹1499+.</h3>
            <p className="text-sm text-slate-600 mb-6">
              Faster fulfillment with live tracking for every order.
            </p>
            <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              Learn more <FiArrowUpRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
