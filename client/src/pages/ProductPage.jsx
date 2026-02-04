import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiHeart, FiStar } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [related, setRelated] = useState([]);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        setActiveImage(data?.images?.[0] || '');
        setSelectedSize(data?.sizes?.[0] || '');
        setError('');
        if (data?.category) {
          const relatedRes = await axios.get('/api/products', {
            params: { category: data.category }
          });
          const relatedProducts = (relatedRes.data.products || []).filter((p) => p._id !== data._id);
          setRelated(relatedProducts);
        } else {
          setRelated([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product');
        setRelated([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleZoomMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const formatPrice = (value) => (
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)
  );

  const resolveImageUrl = (src) => (
    src?.startsWith('http') ? src : `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}${src}`
  );

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <Link to="/products" className="text-primary hover:underline">&larr; Back to products</Link>

        {loading ? (
          <div className="card p-6 mt-6">Loading product...</div>
        ) : error ? (
          <div className="card p-6 mt-6 text-red-600">{error}</div>
        ) : !product ? (
          <div className="card p-6 mt-6">Product not found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="card p-4">
              <div
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                onMouseMove={handleZoomMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                {activeImage ? (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${resolveImageUrl(activeImage)})`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundSize: isZoomed ? '200%' : 'contain',
                      backgroundRepeat: 'no-repeat',
                      cursor: 'zoom-in'
                    }}
                  >
                    <img
                      src={resolveImageUrl(activeImage)}
                      alt={product.name}
                      className="w-full h-full object-contain opacity-0"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}
              </div>
              {product.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {product.images.slice(0, 4).map((img, index) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`aspect-square bg-gray-100 rounded overflow-hidden border ${
                        activeImage === img ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={resolveImageUrl(img)}
                        alt={`${product.name}-${index}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.brand} • {product.category}</p>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={i < Math.round(product.rating || 4.5) ? 'text-yellow-500' : 'text-gray-300'}
                  />
                ))}
                <span className="text-sm text-gray-500 ml-2">
                  ({product.reviews?.length ?? 4.5} reviews)
                </span>
              </div>
              <p className="text-2xl font-bold mb-4">{formatPrice(product.price)}</p>
              <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
              {product.sizes?.length ? (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2">Sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1 border rounded-full text-sm ${
                          selectedSize === size ? 'border-primary text-primary' : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {!selectedSize && (
                    <p className="text-sm text-red-600 mt-2">Please select a size.</p>
                  )}
                </div>
              ) : null}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => addToCart(product, 1, { size: selectedSize })}
                  disabled={product.sizes?.length > 0 && !selectedSize}
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  className="btn btn-outline flex items-center gap-2"
                  onClick={() => toggleWishlist(product)}
                >
                  <FiHeart className={isInWishlist(product._id) ? 'text-red-500' : ''} />
                  {isInWishlist(product._id) ? 'Wishlisted' : 'Wishlist'}
                </button>
                <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <div className="mt-8">
                <h2 className="text-lg font-bold mb-3">Specifications</h2>
                {product.specifications?.length ? (
                  <div className="space-y-2">
                    {product.specifications.map((spec) => (
                      <div key={`${spec.label}-${spec.value}`} className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">{spec.label}</span>
                        <span className="font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No specifications provided.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && product && related.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">More in {product.category}</h2>
              <Link to="/products" className="text-primary hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {related.map((item) => (
                <div key={item._id} className="card">
                  <Link to={`/product/${item._id}`}>
                    <div className="h-48 overflow-hidden relative">
                      {item.images?.[0] ? (
                        <img
                          src={resolveImageUrl(item.images[0])}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${item._id}`}>
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    </Link>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={i < Math.round(item.rating || 4.5) ? 'text-yellow-500' : 'text-gray-300'}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">({item.reviews?.length ?? 0})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">{formatPrice(item.price)}</span>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => addToCart(item, 1, { size: item.sizes?.[0] || '' })}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
