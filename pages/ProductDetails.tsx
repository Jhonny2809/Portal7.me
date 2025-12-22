
import React, { useEffect, useState, useMemo } from 'react';
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

    const { data } = await supabase
      .from('products')
      .select('*')
      .neq('id', currentProduct.id)
      .overlaps('tags', currentProduct.tags)
      .limit(4);

    if (data) setRelatedProducts(data);
  };

  const handleAddToCart = () => {
    if (!product) return;
    const added = addToCart(product);
    if (added) {
      setIsAdding(true);
      setTimeout(() => setIsAdding(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    // Se não estiver no carrinho, adiciona. Se já estiver, o contexto avisa e nós navegamos.
    const alreadyInCart = cart.some(item => item.id === product.id);
    if (!alreadyInCart) {
      addToCart(product);
    }
    navigate('/cart');
  };

  // Helper para extrair ID do vídeo do YouTube
  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    let videoId = '';
    if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('be/')) {
        videoId = url.split('be/')[1].split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  if (!product) return null;

  const embedUrl = getYoutubeEmbedUrl(product.youtube_url);
  const isFree = product.price === 0;

  return (
    <div className="bg-[#FCFCFC] min-h-screen pb-20 font-sans">
      {/* Breadcrumb / Top Bar */}
      <div className="bg-white border-b border-gray-100 py-4 mb-8">
        <div className="container mx-auto px-4 flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
           <Link to="/" className="hover:text-primary transition-colors">Home</Link>
           <ChevronRight size={14} />
           <span className="text-gray-300">Produtos</span>
           <ChevronRight size={14} />
           <span className="text-primary truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* Left Side: Visuals */}
          <div className="space-y-8 animate-slide-up">
             <div className="aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-50 group">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
             </div>
             
             {/* Tags Display */}
             <div className="flex flex-wrap gap-2">
                {product.tags?.map(tag => (
                  <span key={tag} className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10">
                    <Tag size={12} /> {tag}
                  </span>
                ))}
             </div>
          </div>

          {/* Right Side: Details & Actions */}
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-[0.3em]">
                   <Star size={14} fill="currentColor" /> Produto Premium
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">
                   {product.name}
                </h1>
                <div className="flex items-baseline gap-4 pt-2">
                   <span className="text-4xl font-black text-primary">
                      {isFree ? 'Grátis' : CURRENCY_FORMAT.format(product.price)}
                   </span>
                   {!isFree && (
                     <span className="text-sm text-gray-400 font-bold line-through">
                        {CURRENCY_FORMAT.format(product.price * 1.5)}
                     </span>
                   )}
                </div>
             </div>

             <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-col gap-4">
                   <button 
                     onClick={handleBuyNow}
                     className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-primary/95 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3"
                   >
                     Comprar Agora <ChevronRight size={18} />
                   </button>
                   <button 
                     onClick={handleAddToCart}
                     disabled={isAdding}
                     className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] border-2 transition-all flex justify-center items-center gap-3
                        ${isAdding 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'bg-white border-gray-100 text-primary hover:border-primary hover:bg-gray-50'
                        }`}
                   >
                     {isAdding ? (
                       <><Check size={18} className="animate-pop" /> Item no Carrinho</>
                     ) : (
                       <><ShoppingBag size={18} /> Adicionar ao Carrinho</>
                     )}
                   </button>
                </div>
                
                <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                      <ShieldCheck size={16} className="text-green-500" /> Acesso Seguro
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                      <Package size={16} className="text-blue-500" /> Entrega Digital
                   </div>
                </div>
             </div>

             <div className="prose prose-sm max-w-none text-gray-500 font-medium leading-relaxed">
                <h3 className="text-primary font-black uppercase text-xs tracking-widest mb-4">Descrição do Material</h3>
                <p className="whitespace-pre-wrap">{product.description}</p>
             </div>
          </div>
        </div>

        {/* Amostra do Conteúdo (Vídeo) */}
        {embedUrl && (
          <div className="mt-20 space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
             <div className="flex flex-col items-center text-center space-y-4">
                <span className="bg-accent/10 text-accent p-4 rounded-full"><Play size={24} fill="currentColor" /></span>
                <h2 className="text-3xl font-black text-primary uppercase tracking-tighter italic">Amostra do Conteúdo</h2>
                <p className="text-gray-400 font-medium max-w-lg">Conheça os detalhes deste produto em vídeo antes de adquirir sua licença.</p>
             </div>
             <div className="aspect-video w-full max-w-4xl mx-auto rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white bg-black">
                <iframe 
                  className="w-full h-full"
                  src={embedUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
             </div>
          </div>
        )}

        {/* Produtos Relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 space-y-12">
             <div className="flex justify-between items-end border-b border-gray-100 pb-8">
                <div>
                   <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">Produtos Relacionados</h2>
                   <p className="text-gray-400 font-medium mt-2">Você também pode se interessar por estes itens da mesma categoria.</p>
                </div>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                {relatedProducts.map(rp => (
                  <ProductCard key={rp.id} product={rp} />
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
