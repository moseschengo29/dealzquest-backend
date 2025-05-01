import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Tag, Zap, ThumbsUp } from 'lucide-react';
import SearchForm from '../components/search/SearchForm';
import ProductGrid from '../components/products/ProductGrid';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { recommendedProducts, fetchRecommendedProducts } = useSearch();

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecommendedProducts();
    }
  }, [isAuthenticated]);

  const categories = [
    { name: 'Electronics', icon: <Zap className="h-6 w-6 mb-2" /> },
    { name: 'Fashion', icon: <Tag className="h-6 w-6 mb-2" /> },
    { name: 'Home & Furniture', icon: <ThumbsUp className="h-6 w-6 mb-2" /> },
    { name: 'Trending', icon: <TrendingUp className="h-6 w-6 mb-2" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Find the Best Deals in Kenya
            </motion.h1>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-4 max-w-2xl mx-auto text-xl"
            >
              Compare prices across multiple Kenyan online stores and save money
            </motion.p>
          </div>
        </div>
      </motion.div>
      
      <SearchForm />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
        >
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            >
              <div className="text-blue-600 flex justify-center">
                {category.icon}
              </div>
              <h3 className="font-medium text-gray-900">{category.name}</h3>
            </div>
          ))}
        </motion.div>
        
        {isAuthenticated && recommendedProducts.length > 0 && (
          <ProductGrid 
            products={recommendedProducts} 
            title="Recommended For You" 
          />
        )}
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Search Products</h3>
              <p className="text-gray-600">
                Enter what you're looking for and we'll search across multiple Kenyan stores.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Compare Prices</h3>
              <p className="text-gray-600">
                See prices from different retailers all in one place to find the best deals.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Save Money</h3>
              <p className="text-gray-600">
                Choose the best option and save money on your purchase in Kenya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;