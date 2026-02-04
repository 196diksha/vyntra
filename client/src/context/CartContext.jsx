import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const STORAGE_KEY = 'cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

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
