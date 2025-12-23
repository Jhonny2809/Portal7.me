
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { CURRENCY_FORMAT } from '../constants';
import { useCart } from '../context/CartContext';
import { Plus, Check, Star, ShoppingBag } from 'lucide-react';

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (addToCart(product)) {
      setIsAdding(true);
      setTimeout(() => setIsAdding(false), 2000);
    }
  };

  return (
    <div className="group bg-white rounded-2xl md:rounded-[2.5rem] p-2 md:p-4 border border-gray-100 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
      <Link to={`/product/${product.id}`} className="block relative aspect-square rounded-xl md:rounded-[1.8rem] overflow-hidden bg-gray-50 mb-4 md:mb-6">
         <img 
           src={product.image_url} 
           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
           alt={product.name} 
         />
         <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
         <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-white/90 backdrop-blur-md px-2 md:px-3 py-1 md:py-1.5 rounded-full flex items-center gap-1 md:gap-1.5 shadow-sm">
            <Star size={10} className="text-accent fill-accent" />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tighter text-primary">Premium</span>
         </div>
      </Link>

      <div className="flex-grow px-1 md:px-2">
         <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-sm md:text-lg font-black text-primary leading-tight md:leading-snug mb-2 md:mb-3 line-clamp-2 uppercase italic tracking-tight">{product.name}</h3>
         </Link>
         <div className="flex items-center justify-between mt-auto pb-1 md:pb-0">
            <div>
               <span className="text-[7px] md:text-[9px] font-black uppercase text-gray-400 block tracking-widest mb-0.5">Investimento</span>
               <span className="text-sm md:text-xl font-black text-primary">{CURRENCY_FORMAT.format(product.price)}</span>
            </div>
            <button 
              onClick={handleAdd}
              className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 shadow-xl ${
                isAdding ? 'bg-green-500 text-white scale-110' : 'bg-primary text-white hover:bg-accent hover:text-primary active:scale-95'
              }`}
            >
              {isAdding ? <Check size={16} className="md:w-5 md:h-5" /> : <Plus size={16} className="md:w-5 md:h-5" />}
            </button>
         </div>
      </div>
    </div>
  );
};

export default ProductCard;
