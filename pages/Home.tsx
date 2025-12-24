
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
             <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] uppercase italic tracking-tighter">
                {section.title || config?.hero_title || 'Portal Sete Premium'}
             </h1>
             <div 
               className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-80 prose prose-invert"
               dangerouslySetInnerHTML={{ __html: section.content || config?.hero_subtitle || '' }}
             />
             <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
                <button 
                  onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                  className="gold-gradient text-primary px-14 py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Explorar Catálogo <ArrowRight size={20} />
                </button>
             </div>
          </div>
          <div className="hidden lg:block animate-fade-in-up">
             <div className="relative aspect-square rounded-[5rem] overflow-hidden border-[12px] border-white/5 shadow-2xl p-1 bg-gradient-to-br from-white/10 to-transparent">
                <img src={section.image_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80'} className="w-full h-full object-cover rounded-[4.5rem]" alt="" />
             </div>
          </div>
       </div>
    </section>
  );

  const renderProductSection = (section: SiteSection) => {
    const filterTag = section.filter_tag?.trim().toLowerCase();
    const filteredProducts = filterTag 
      ? products.filter(p => p.tags?.some(t => t.trim().toLowerCase() === filterTag))
      : products;

    if (filteredProducts.length === 0 && !productsLoading) return null;

    return (
      <section key={section.id} id={`section-${section.id}`} className="py-16 md:py-32 container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-20 gap-6 text-left">
           <div className="max-w-2xl">
              <span className="text-accent font-black text-[10px] md:text-[11px] uppercase tracking-[0.4em] mb-3 block">
                {section.subtitle}
              </span>
              <h2 className="text-3xl md:text-6xl font-black text-primary uppercase italic tracking-tighter leading-none">
                {section.title}
              </h2>
           </div>
           <div className="hidden md:flex bg-white border border-gray-100 px-8 py-4 rounded-2xl shadow-xl items-center gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">{filteredProducts.length} Itens</span>
           </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
          {filteredProducts.map((p, idx) => (
            <div key={p.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>
    );
  };

  if (configLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <Loader2 className="animate-spin text-accent" size={50} />
    </div>
  );

  return (
    <main id="catalog" className="bg-[#F8F9FB]">
      {sections.filter(s => s.is_visible).sort((a,b) => a.display_order - b.display_order).map(s => {
        if (s.type === 'hero') return renderHero(s);
        if (s.type === 'products') return renderProductSection(s);
        if (s.type === 'content' || s.type === 'about') return (
           <section key={s.id} id={`section-${s.id}`} className="py-20 md:py-32 container mx-auto px-6">
              <div className={`bg-white p-8 md:p-20 rounded-[3rem] shadow-2xl flex flex-col items-center gap-12 md:gap-20 ${s.layout === 'content-right' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                 {s.image_url && (
                   <div className="w-full md:w-1/2 aspect-square overflow-hidden rounded-[2.5rem] shadow-2xl flex-shrink-0">
                     <img src={s.image_url} className="w-full h-full object-cover" alt={s.title} />
                   </div>
                 )}
                 <div className="flex-grow space-y-8 text-left">
                    <div>
                      <span className="text-accent font-black text-[10px] uppercase tracking-[0.4em] mb-3 block">{s.subtitle}</span>
                      <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-primary leading-tight">{s.title}</h2>
                    </div>
                    <div 
                      className="text-gray-500 font-medium leading-relaxed text-lg prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: s.content }}
                    />
                    <button className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Saber Mais</button>
                 </div>
              </div>
           </section>
        );
        return null;
      })}
    </main>
  );
};

export default Home;
