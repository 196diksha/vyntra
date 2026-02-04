import { Link } from 'react-router-dom';
import { FiHeart, FiStar } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';

const formatPrice = (value) => (
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)
);

const Wishlist = () => {
  const { items, toggleWishlist } = useWishlist();

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

        {items.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-gray-600 mb-4">Your wishlist is empty.</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((product) => (
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
                    >
                      <FiHeart className="text-red-500" />
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
                        className={i < Math.round((product.rating || 4.5)) ? 'text-yellow-500' : 'text-gray-300'}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">({product.reviews?.length ?? 0})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
