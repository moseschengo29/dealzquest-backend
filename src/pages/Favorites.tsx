import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import ProductGrid from '../components/products/ProductGrid';
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

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/user/favorites/');
        setFavorites(response.data.map((item: any) => item.product));
      } catch (error) {
        setError('Failed to load favorites');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Heart className="h-6 w-6 text-red-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Your Favorites</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">
              Save products you love to your favorites for easy access later.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Start shopping
            </a>
          </div>
        ) : (
          <ProductGrid
            products={favorites}
            favorites={favorites.map(fav => fav.id)}
          />
        )}
      </div>
    </div>
  );
};

export default Favorites;