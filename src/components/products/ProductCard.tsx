import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    source: string;
    url: string;
    rating: number;
  };
  isFavorite?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isFavorite = false }) => {
  const { isAuthenticated } = useAuth();
  const [favorite, setFavorite] = React.useState(isFavorite);
  
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }
    
    try {
      if (favorite) {
        await axios.delete(`/api/user/favorites/${product.id}/`);
        toast.success('Removed from favorites');
      } else {
        await axios.post('/api/user/favorites/', { product_id: product.id });
        toast.success('Added to favorites');
      }
      setFavorite(!favorite);
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleFavoriteToggle}
            className={`absolute top-2 right-2 p-2 rounded-full ${
              favorite ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
            } shadow hover:shadow-md transition-all duration-200`}
          >
            <Heart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {product.source}
            </span>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm text-gray-600">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2" title={product.name}>
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xl font-bold text-gray-900">KSh {product.price.toLocaleString()}</span>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;