import React, { useEffect, useState } from 'react';
import { History, RefreshCw, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSearch } from '../context/SearchContext';
import toast from 'react-hot-toast';

interface SearchHistoryItem {
  id: number;
  query: string;
  timestamp: string;
}

const SearchHistory: React.FC = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { search, setSearchQuery } = useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/user/search-history/');
        setHistory(response.data);
      } catch (error) {
        setError('Failed to load search history');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchHistory();
  }, []);

  const handleSearchAgain = (query: string) => {
    setSearchQuery(query);
    search(query);
    navigate('/search');
  };

  const handleDeleteSearch = async (id: number) => {
    try {
      await axios.delete(`/api/user/search-history/${id}/`);
      setHistory(history.filter(item => item.id !== id));
      toast.success('Search removed from history');
    } catch (error) {
      toast.error('Failed to remove search from history');
    }
  };

  const handleClearHistory = async () => {
    try {
      await axios.delete('/api/user/search-history/');
      setHistory([]);
      toast.success('Search history cleared');
    } catch (error) {
      toast.error('Failed to clear search history');
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <History className="h-6 w-6 text-blue-500 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Your Search History</h1>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No search history yet</h2>
            <p className="text-gray-600 mb-6">
              Your recent searches will appear here for easy access.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Search now
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {history.map((item) => (
                <li key={item.id} className="hover:bg-gray-50">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-lg font-medium text-gray-900">{item.query}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(item.timestamp)}
                      </p>
                    </div>
                    <div className="flex">
                      <button
                        onClick={() => handleSearchAgain(item.query)}
                        className="mr-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded"
                      >
                        Search Again
                      </button>
                      <button
                        onClick={() => handleDeleteSearch(item.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistory;