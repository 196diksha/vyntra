import { Link } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const formatPrice = (value) => (
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)
);

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totals } = useCart();

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Your Cart</h1>
          {items.length > 0 && (
            <button type="button" onClick={clearCart} className="text-sm text-red-600 hover:underline">
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty.</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={`${item._id}-${item.size || 'nosize'}`} className="card p-4 flex flex-col sm:flex-row gap-4">
                  <Link to={`/product/${item._id}`} className="w-full sm:w-32">
                    <div className="h-32 bg-gray-100 rounded overflow-hidden">
                      {item.images?.[0] ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}${item.images[0]}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${item._id}`}>
                      <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-2">
                      {item.brand} • {item.category}
                      {item.size ? ` • Size ${item.size}` : ''}
                    </p>
                    <p className="font-semibold mb-3">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600">Qty</label>
                      <input
                        type="number"
                        min="1"
                        max={item.stock || 999}
                        value={item.quantity || 1}
                        onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                        className="w-20 border rounded px-2 py-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-800 ml-auto"
                        aria-label="Remove from cart"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-6 h-fit">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t my-3" />
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <button type="button" className="btn btn-primary w-full">
                Proceed to Checkout
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Checkout flow is not wired yet. This is a UI placeholder.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
