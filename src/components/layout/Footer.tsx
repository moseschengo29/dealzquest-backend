import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <ShoppingBag className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">DealFinder</span>
            </div>
            <p className="text-gray-300 mb-4">
              Your one-stop shop for finding the best deals across Kenyan e-commerce sites.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-300 hover:text-white">Search</Link>
              </li>
              <li>
                <Link to="/favorites" className="text-gray-300 hover:text-white">Favorites</Link>
              </li>
              <li>
                <Link to="/history" className="text-gray-300 hover:text-white">Search History</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Supported Stores</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Jumia Kenya</li>
              <li className="text-gray-300">Kilimall</li>
              <li className="text-gray-300">Masoko</li>
              <li className="text-gray-300">SkyGarden</li>
              <li className="text-gray-300">Jiji Kenya</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                Nairobi, Kenya
              </li>
              <li className="flex items-center text-gray-300">
                <Phone className="h-5 w-5 mr-2 text-blue-400" />
                +254 700 000000
              </li>
              <li className="flex items-center text-gray-300">
                <Mail className="h-5 w-5 mr-2 text-blue-400" />
                support@dealfinder.co.ke
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6">
          <p className="text-center text-gray-300 text-sm">
            &copy; {new Date().getFullYear()} DealFinder Kenya. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;