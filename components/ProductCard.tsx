
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
    <div className="group bg-white rounded-[2.5rem] p-4 border border-gray-100 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
      <Link to={`/product/${product.id}`} className="block relative aspect-square rounded-[1.8rem] overflow-hidden bg-gray-50 mb-6">
         <img 
           src={product.image_url} 
           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
           alt={product.name} 
         />
         <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
         <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <Star size={12} className="text-accent fill-accent" />
            <span className="text-[9px] font-black uppercase tracking-tighter text-primary">Premium</span>
         </div>
      </Link>

      <div className="flex-grow px-2">
         <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-lg font-black text-primary leading-snug mb-3 line-clamp-2 uppercase italic tracking-tight">{product.name}</h3>
         </Link>
         <div className="flex items-center justify-between mt-auto">
            <div>
               <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest mb-1">Investimento</span>
               <span className="text-xl font-black text-primary">{CURRENCY_FORMAT.format(product.price)}</span>
            </div>
            <button 
              onClick={handleAdd}
              className={`p-4 rounded-2xl transition-all duration-300 shadow-xl ${
                isAdding ? 'bg-green-500 text-white scale-110' : 'bg-primary text-white hover:bg-accent hover:text-primary active:scale-95'
              }`}
            >
              {isAdding ? <Check size={20} /> : <Plus size={20} />}
            </button>
         </div>
      </div>
    </div>
  );
};

export default ProductCard;
