import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories] = useState(['All', 'Electronics', 'Clothing', 'Home & Kitchen', 'Beauty']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: page,
        ...(selectedCategory !== 'All' ? { category: selectedCategory } : {}),
        ...(search.trim() ? { keyword: search.trim() } : {})
      };
      const { data } = await axios.get('/api/products', { params });
      setProducts(data.products || []);
      setPages(data.pages || 1);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, page]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const formatPrice = (value) => (
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)
  );

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Products</h1>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              className="border rounded-lg px-3 py-2 w-64"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => {
                  setSelectedCategory(category);
                  setPage(1);
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="card p-6">Loading products...</div>
        ) : error ? (
          <div className="card p-6 text-red-600">{error}</div>
        ) : products.length === 0 ? (
          <div className="card p-6">No products found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="card">
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
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                          onClick={() => addToCart(product, 1, { size: product.sizes?.[0] || '' })}
                          aria-label="Add to cart"
                        >
                          <FiShoppingCart />
                        </button>
                        <Link to={`/product/${product._id}`} className="text-primary hover:underline">
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                className="btn btn-outline"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">Page {page} of {pages}</span>
              <button
                className="btn btn-outline"
                onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                disabled={page === pages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
