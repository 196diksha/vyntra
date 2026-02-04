import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Vyntra</h3>
            <p className="text-gray-300">
              Your one-stop shop for all your shopping needs. Quality products at affordable prices.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
              <li><Link to="/login" className="hover:text-white">Login</Link></li>
              <li><Link to="/register" className="hover:text-white">Register</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/category/electronics" className="hover:text-white">Electronics</Link></li>
              <li><Link to="/category/clothing" className="hover:text-white">Clothing</Link></li>
              <li><Link to="/category/home" className="hover:text-white">Home & Kitchen</Link></li>
              <li><Link to="/category/beauty" className="hover:text-white">Beauty</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Email: support@Vyntra.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Commerce St, Business City</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Vyntra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;