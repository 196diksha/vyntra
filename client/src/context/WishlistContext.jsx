import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

const STORAGE_KEY = 'wishlist';

export const WishlistProvider = ({ children }) => {
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

  const isInWishlist = (productId) => items.some((item) => item._id === productId);

  const toggleWishlist = (product) => {
    setItems((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      if (exists) {
        return prev.filter((item) => item._id !== product._id);
      }
      return [{ ...product }, ...prev];
    });
  };

  const value = useMemo(() => ({
    items,
    isInWishlist,
    toggleWishlist
  }), [items]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
