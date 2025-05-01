import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, History, User, Menu, X, LogOut, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { searchQuery, setSearchQuery, search } = useSearch();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      search(searchQuery);
      navigate('/search');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">DealFinder</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center flex-1 px-8">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-3xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-700 bg-gray-100 rounded-r-full hover:bg-gray-200"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <>
                <Link to="/favorites" className="p-2 mx-1 rounded-full hover:bg-gray-100">
                  <Heart className="h-5 w-5 text-gray-600" />
                </Link>
                <Link to="/history" className="p-2 mx-1 rounded-full hover:bg-gray-100">
                  <History className="h-5 w-5 text-gray-600" />
                </Link>
                <div className="relative ml-3">
                  <div className="flex items-center">
                    <button
                      onClick={logout}
                      className="p-2 mx-1 rounded-full hover:bg-gray-100"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5 text-gray-600" />
                    </button>
                    <span className="text-sm font-medium text-gray-700 ml-2">
                      {user?.username}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <User className="h-5 w-5 mr-1" />
                Login
              </Link>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-700 bg-gray-100 rounded-r-full hover:bg-gray-200"
              >
                Search
              </button>
            </div>
          </form>

          {isAuthenticated ? (
            <>
              <Link
                to="/favorites"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                <div className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" /> Favorites
                </div>
              </Link>
              <Link
                to="/history"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                <div className="flex items-center">
                  <History className="h-5 w-5 mr-2" /> Search History
                </div>
              </Link>
              <button
                onClick={() => {
                  logout();
                  toggleMenu();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <LogOut className="h-5 w-5 mr-2" /> Logout ({user?.username})
                </div>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" /> Login
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;