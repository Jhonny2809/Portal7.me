
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Product, SiteSection } from '../types';
import ProductCard from '../components/ProductCard';
import { Loader2, Rocket, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useSite } from '../context/SiteContext';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const { sections, config, loading: configLoading } = useSite();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setProductsLoading(false);
    }
  };

  const renderHero = (section: SiteSection) => (
    <section key={section.id} id={`section-${section.id}`} className="relative min-h-[90vh] flex items-center overflow-hidden bg-primary">
       <div className="absolute inset-0 z-0">
          {section.image_url ? (
            <img src={section.image_url} className="w-full h-full object-cover opacity-20 scale-105" alt="" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-[#112235] to-primary"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent"></div>
       </div>

       <div className="container mx-auto px-6 relative z-10 py-24 text-center lg:text-left grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12 animate-fade-in-up">
             <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full text-accent font-black text-[10px] uppercase tracking-[0.3em] backdrop-blur-md">
                <Zap size={14} className="animate-pulse" /> Entrega Digital Imediata
             </div>
             <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] uppercase italic tracking-tighter">
                {section.title || config?.hero_title || 'Portal Sete Premium'}
             </h1>
             <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-80">
                {section.content || config?.hero_subtitle || 'A maior biblioteca de recursos digitais para profissionais que exigem excelência.'}
             </p>
             <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
                <button 
                  onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                  className="gold-gradient text-primary px-14 py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Explorar Catálogo <ArrowRight size={20} />
                </button>
             </div>
             <div className="flex flex-wrap justify-center lg:justify-start gap-10 opacity-30 pt-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest"><ShieldCheck size={18}/> Checkout Seguro</div>
                <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest"><Zap size={18}/> Acesso Vitalício</div>
             </div>
          </div>
          <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
             <div className="relative aspect-square rounded-[5rem] overflow-hidden border-[12px] border-white/5 shadow-2xl p-1 bg-gradient-to-br from-white/10 to-transparent">
                <img src={section.image_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80'} className="w-full h-full object-cover rounded-[4.5rem]" alt="" />
             </div>
          </div>
       </div>
    </section>
  );

  const renderProductSection = (section: SiteSection) => {
    // Lógica SQL-like de filtragem via Tags (Fundamental para o Portal Sete)
    const filterTag = section.filter_tag?.trim().toLowerCase();
    const filteredProducts = filterTag 
      ? products.filter(p => p.tags?.some(t => t.trim().toLowerCase() === filterTag))
      : products;

    if (filteredProducts.length === 0 && !productsLoading) return null;

    return (
      <section key={section.id} id={`section-${section.id}`} className="py-40 container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
           <div className="max-w-2xl">
              <span className="text-accent font-black text-[11px] uppercase tracking-[0.4em] mb-4 block">Seleção Especial</span>
              <h2 className="text-5xl md:text-6xl font-black text-primary uppercase italic tracking-tighter leading-none">
                {section.title || 'Novidades da Semana'}
              </h2>
           </div>
           <div className="bg-white border border-gray-100 px-8 py-4 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
              <span className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">{filteredProducts.length} Licenças VIP</span>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {productsLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-white rounded-5xl border border-gray-100 animate-pulse overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent animate-shimmer"></div>
              </div>
            ))
          ) : (
            filteredProducts.map((p, idx) => (
              <div key={p.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <ProductCard product={p} />
              </div>
            ))
          )}
        </div>
      </section>
    );
  };

  if (configLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="animate-spin text-accent" size={50} strokeWidth={3} />
        <span className="text-accent font-black uppercase text-xs tracking-[0.5em]">Portal Sete</span>
      </div>
    </div>
  );

  return (
    <main id="catalog" className="bg-[#F8F9FB]">
      {sections.length > 0 ? (
        sections.filter(s => s.is_visible).sort((a,b) => a.display_order - b.display_order).map(s => {
          if (s.type === 'hero') return renderHero(s);
          if (s.type === 'products') return renderProductSection(s);
          return null;
        })
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center p-20 text-center bg-primary">
           <div className="bg-white/5 p-16 rounded-5xl border border-white/10 animate-fade-in-up">
              <Rocket size={80} className="text-accent mb-8 mx-auto animate-bounce" strokeWidth={1.5} />
              <h1 className="text-4xl font-black uppercase italic text-white tracking-tighter">Estamos de volta em breve</h1>
              <p className="text-gray-400 mt-4 max-w-sm mx-auto font-medium">O portal está sendo otimizado com novos recursos de elite.</p>
           </div>
        </div>
      )}
    </main>
  );
};

export default Home;
