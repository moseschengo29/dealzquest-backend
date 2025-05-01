import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, ArrowDownUp, Check } from 'lucide-react';
import SearchForm from '../components/search/SearchForm';
import ProductGrid from '../components/products/ProductGrid';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  source: string;
  url: string;
  rating: number;
}

const SearchResults: React.FC = () => {
  const location = useLocation();
  const { searchQuery, searchResults, search } = useSearch();
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('relevance');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch user favorites if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchFavorites = async () => {
        try {
          const response = await axios.get('/api/user/favorites/');
          setFavorites(response.data.map((fav: any) => fav.product_id));
        } catch (error) {
          console.error('Failed to fetch favorites', error);
        }
      };
      fetchFavorites();
    }
  }, [isAuthenticated]);

  // Parse query from URL if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryParam = params.get('q');
    if (queryParam && queryParam !== searchQuery) {
      search(queryParam);
    }
  }, [location.search]);

  const { products, isLoading, error } = searchResults;

  // Apply sorting and filtering
  const filteredAndSortedProducts = [...products]
    .filter(product => product.price >= priceRange[0] && product.price <= priceRange[1])
    .sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0; // relevance, keep original order
      }
    });

  // Get available sources from products
  const sources = [...new Set(products.map(product => product.source))];

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchForm />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
              <span className="ml-2 text-sm text-gray-500">
                ({filteredAndSortedProducts.length} items)
              </span>
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={toggleFilters}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ArrowDownUp className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 border-b"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="0"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-24 border border-gray-300 rounded-md p-2 text-sm"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      min="0"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                      className="w-24 border border-gray-300 rounded-md p-2 text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Sources</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {sources.map((source) => (
                      <div key={source} className="flex items-center">
                        <input type="checkbox" id={source} className="h-4 w-4 text-blue-600" defaultChecked />
                        <label htmlFor={source} className="ml-2 text-sm text-gray-700">
                          {source}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <ProductGrid 
          products={filteredAndSortedProducts} 
          favorites={favorites}
          emptyMessage={
            searchQuery 
              ? `No products found for "${searchQuery}". Try a different search term.` 
              : "No products available."
          }
        />
      </div>
    </div>
  );
};

export default SearchResults;