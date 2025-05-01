import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  source: string;
  url: string;
  rating: number;
  description?: string;
}

interface SearchResults {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

interface SearchHistory {
  id: number;
  query: string;
  timestamp: string;
}

interface SearchContextType {
  searchQuery: string;
  searchResults: SearchResults;
  searchHistory: SearchHistory[];
  recommendedProducts: Product[];
  setSearchQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  fetchSearchHistory: () => Promise<void>;
  fetchRecommendedProducts: () => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({
    products: [],
    isLoading: false,
    error: null
  });
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  const search = async (query: string) => {
    setSearchResults({
      ...searchResults,
      isLoading: true,
      error: null
    });

    try {
      const response = await axios.get(`/api/products/search/?q=${query}`);
      setSearchResults({
        products: response.data,
        isLoading: false,
        error: null
      });
      
      // If authenticated, save search to history
      if (isAuthenticated) {
        await axios.post('/api/user/search-history/', { query });
        fetchSearchHistory();
      }
    } catch (error) {
      setSearchResults({
        ...searchResults,
        isLoading: false,
        error: 'An error occurred while searching. Please try again.'
      });
    }
  };

  const fetchSearchHistory = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await axios.get('/api/user/search-history/');
      setSearchHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch search history', error);
    }
  };

  const fetchRecommendedProducts = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await axios.get('/api/products/recommended/');
      setRecommendedProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch recommendations', error);
    }
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        searchHistory,
        recommendedProducts,
        setSearchQuery,
        search,
        fetchSearchHistory,
        fetchRecommendedProducts
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};