import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const baseStorageKey = 'cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const { currentUser } = useAuth();
  const storageKey = currentUser?._id ? `${baseStorageKey}:${currentUser._id}` : `${baseStorageKey}:guest`;

  useEffect(() => {
    setHydrated(false);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    } else {
      setItems([]);
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, hydrated, storageKey]);

  const addToCart = (product, qty = 1, options = {}) => {
    const size = options.size || null;
    setItems((prev) => {
      const existing = prev.find((item) => item._id === product._id && (item.size || null) === size);
      if (existing) {
        const newQty = Math.min((existing.quantity || 1) + qty, product.stock || 999);
        return prev.map((item) =>
          item._id === product._id && (item.size || null) === size
            ? { ...item, quantity: newQty }
            : item
        );
      }
      return [{ ...product, quantity: qty, size }, ...prev];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    return { subtotal };
  }, [items]);

  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totals
  }), [items, totals]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
