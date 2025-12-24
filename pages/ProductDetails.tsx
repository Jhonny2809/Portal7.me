
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Product } from '../types';
import { CURRENCY_FORMAT } from '../constants';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, ArrowLeft, Check, ShieldCheck, 
  Play, Tag, Star, Package, ChevronRight 
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      navigate('/');
      return;
    }

    setProduct(data);
    fetchRelatedProducts(data);
    setLoading(false);
  };

  const fetchRelatedProducts = async (currentProduct: Product) => {
    if (!currentProduct.tags || currentProduct.tags.length === 0) return;
    const { data } = await supabase.from('products').select('*').neq('id', currentProduct.id).overlaps('tags', currentProduct.tags).limit(4);
    if (data) setRelatedProducts(data);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (addToCart(product)) {
      setIsAdding(true);
      setTimeout(() => setIsAdding(false), 2000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  if (!product) return null;

  return (
    <div className="bg-[#FCFCFC] min-h-screen pb-20 font-sans">
      <div className="bg-white border-b border-gray-100 py-4 mb-8">
        <div className="container mx-auto px-4 flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
           <Link to="/" className="hover:text-primary transition-colors">Home</Link>
           <ChevronRight size={14} />
           <span className="text-primary truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="space-y-8 animate-slide-up">
             <div className="aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-50 group">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
             </div>
             <div className="flex flex-wrap gap-2">
                {product.tags?.map(tag => (
                  <span key={tag} className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10">
                    <Tag size={12} /> {tag}
                  </span>
                ))}
             </div>
          </div>

          <div className="space-y-8 animate-slide-up text-left">
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-[0.3em]">
                   <Star size={14} fill="currentColor" /> Produto Premium
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight uppercase italic tracking-tighter">
                   {product.name}
                </h1>
                <div className="flex items-baseline gap-4 pt-2">
                   <span className="text-4xl font-black text-primary">{CURRENCY_FORMAT.format(product.price)}</span>
                </div>
             </div>

             <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <button 
                  onClick={() => { addToCart(product); navigate('/cart'); }}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-primary/95 transition-all flex justify-center items-center gap-3"
                >
                  Comprar Agora <ChevronRight size={18} />
                </button>
                <button 
                  onClick={handleAddToCart}
                  className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] border-2 transition-all flex justify-center items-center gap-3 ${isAdding ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-100 text-primary'}`}
                >
                  {isAdding ? <><Check size={18}/> No Carrinho</> : <><ShoppingBag size={18} /> Adicionar ao Carrinho</>}
                </button>
                <div className="pt-4 border-t border-gray-50 flex justify-between">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase"><ShieldCheck size={16} className="text-green-500" /> Acesso Seguro</div>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase"><Package size={16} className="text-blue-500" /> Digital</div>
                </div>
             </div>

             <div className="prose prose-sm max-w-none text-gray-500 font-medium leading-relaxed">
                <h3 className="text-primary font-black uppercase text-xs tracking-widest mb-4">Sobre o Material</h3>
                <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
