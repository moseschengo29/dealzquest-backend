import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, ExternalLink, Star, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ProductGrid from '../components/products/ProductGrid';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  source: string;
  url: string;
  rating: number;
  description?: string;
  specs?: Record<string, string>;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/products/${id}/`);
        setProduct(response.data);
        
        // Fetch similar products
        const similarResponse = await axios.get(`/api/products/similar/${id}/`);
        setSimilarProducts(similarResponse.data);
        
        // Check if product is in favorites
        if (isAuthenticated) {
          const favoritesResponse = await axios.get('/api/user/favorites/');
          const favoriteIds = favoritesResponse.data.map((fav: any) => fav.product_id);
          setIsFavorite(favoriteIds.includes(id));
        }
      } catch (error) {
        setError('Failed to load product details');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id, isAuthenticated]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }
    
    try {
      if (isFavorite) {
        await axios.delete(`/api/user/favorites/${id}/`);
        toast.success('Removed from favorites');
      } else {
        await axios.post('/api/user/favorites/', { product_id: id });
        toast.success('Added to favorites');
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  // Dummy images for the gallery (in a real app, these would come from the API)
  const productImages = product ? [
    product.image,
    // Simulate additional product images for demo purposes
    product.image.replace('?tr=w-400', '?tr=w-400&angle=30'),
    product.image.replace('?tr=w-400', '?tr=w-400&angle=60')
  ] : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Product not found'}
        </div>
        <Link to="/search" className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to search results
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/search" className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to search results
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div>
              <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={productImages[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-96 object-contain"
                />
              </div>
              
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                      currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`Product view ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {product.source}
                </span>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-700">{product.rating.toFixed(1)}</span>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                KSh {product.price.toLocaleString()}
              </div>

              {product.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              )}

              {product.specs && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Specifications</h2>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="col-span-2">
                        <dt className="text-sm font-medium text-gray-500">{key}</dt>
                        <dd className="text-sm text-gray-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <div className="flex space-x-4 mt-8">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  View on {product.source}
                </a>
                <button
                  onClick={handleFavoriteToggle}
                  className={`p-3 rounded-md border ${
                    isFavorite
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-12">
            <ProductGrid
              products={similarProducts.slice(0, 4)}
              title="Similar Products You Might Like"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;