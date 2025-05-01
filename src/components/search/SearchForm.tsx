import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearch } from '../../context/SearchContext';

const SearchForm: React.FC = () => {
  const { searchQuery, setSearchQuery, search } = useSearch();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery);
      search(localQuery);
      navigate('/search');
    }
  };

  const clearSearch = () => {
    setLocalQuery('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="relative">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search for products across Kenyan stores..."
            className="w-full h-14 px-6 py-4 pl-14 pr-12 text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          {localQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-14 flex items-center pr-4"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center px-6 text-white bg-blue-600 rounded-r-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default SearchForm;