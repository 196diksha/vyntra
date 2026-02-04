import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      setSearchQuery('');
    }
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            Vyntra
          </Link>

          {/* Search Bar (Desktop) */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-1/3"
          >
            <FiSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent border-none outline-none w-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative p-2">
              <FiShoppingCart className="text-xl" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                </span>
              )}
            </Link>
            <Link to="/wishlist" className="relative p-2">
              <FiHeart className="text-xl" />
            </Link>
            
            {currentUser ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 p-2">
                  <FiUser className="text-xl" />
                  <span className="hidden md:inline text-sm">{currentUser.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    Profile
                  </Link>
                  {currentUser.role === 'admin' && (
                    <Link to="/admin/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="text-sm font-medium">Login</Link>
                <Link to="/register" className="text-sm font-medium">Register</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Search Bar (Mobile) */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <FiSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent border-none outline-none w-full text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="py-2">Home</Link>
              <Link to="/cart" className="py-2">Cart</Link>
              <Link to="/wishlist" className="py-2">Wishlist</Link>
              {currentUser ? (
                <>
                  <Link to="/profile" className="py-2">Profile</Link>
                  {currentUser.role === 'admin' && (
                    <Link to="/admin/dashboard" className="py-2">Admin Dashboard</Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="py-2 text-left text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="py-2">Login</Link>
                  <Link to="/register" className="py-2">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
