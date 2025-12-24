
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Order, Product, ProductFile } from '../types';
import { CURRENCY_FORMAT } from '../constants';
import { 
  Download, Clock, FileText, Loader2, 
  PackageOpen, Settings, RefreshCw, Package, Plus, Zap, AlertCircle,
  Check, ChevronRight, ArrowLeft, Library
} from 'lucide-react';

interface ProductWithFiles extends Product {
  files: ProductFile[];
}

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<ProductWithFiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login?redirect=dashboard'); return; }
    if (user) { 
      setFullName(user.full_name || ''); 
      fetchUserData(); 
    }
  }, [user, authLoading]);

  const fetchUserData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      const approvedOrderIds = (ordersData || [])
        .filter(o => o.status === 'approved' || o.status === 'completed')
        .map(o => o.id);

      if (approvedOrderIds.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            product_id,
            products:products (*)
          `)
          .in('order_id', approvedOrderIds);

        if (itemsError) throw itemsError;

        if (itemsData && itemsData.length > 0) {
          const productsMap = new Map<string, any>();
          
          itemsData.forEach((item: any) => {
            const prod = Array.isArray(item.products) ? item.products[0] : item.products;
            if (prod) productsMap.set(String(prod.id), prod);
          });

          const uniqueProductIds = Array.from(productsMap.keys());
          
          if (uniqueProductIds.length > 0) {
            const { data: filesData, error: filesError } = await supabase
              .from('product_files')
              .select('*')
              .in('product_id', uniqueProductIds);
            
            if (filesError) throw filesError;

            const productsWithFiles = uniqueProductIds.map(id => {
              const product = productsMap.get(id);
              const files = filesData?.filter(f => String(f.product_id) === String(id)) || [];
              return { ...product, files };
            });

            setPurchasedProducts(productsWithFiles);
          }
        }
      }
    } catch (err: any) { console.error(err.message); } 
    finally { setLoading(false); }
  };

  const currentProduct = selectedProductId 
    ? purchasedProducts.find(p => String(p.id) === selectedProductId) 
    : null;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-primary"><Loader2 className="animate-spin text-accent" size={50} /></div>;

  return (
    <div className="bg-[#F8F9FB] min-h-screen font-sans">
      <div className="container mx-auto px-6 py-20 max-w-6xl">
        <div className="mb-16 animate-fade-in-up flex flex-col md:flex-row md:justify-between md:items-end gap-6 text-left">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-1 bg-accent rounded-full"></div>
                 <span className="text-[11px] font-black uppercase text-accent tracking-[0.4em]">Área de Membros</span>
              </div>
              <h1 className="text-5xl font-black text-primary uppercase italic tracking-tighter">Minha Conta</h1>
           </div>
           <button onClick={fetchUserData} className="w-fit p-4 bg-white border border-gray-100 rounded-3xl shadow-xl text-gray-400 hover:text-primary transition-all active:scale-95 flex items-center gap-2 group">
             <RefreshCw size={20} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
             <span className="text-[10px] font-black uppercase tracking-widest px-2">Atualizar Acessos</span>
           </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-80 flex-shrink-0">
            <nav className="bg-white rounded-4xl p-5 border border-gray-100 shadow-2xl space-y-3 sticky top-32">
              {[
                { id: 'orders', label: 'Meus Pedidos', icon: <Clock size={18}/> },
                { id: 'downloads', label: 'Meus Arquivos', icon: <Library size={18}/> },
                { id: 'details', label: 'Meus Dados', icon: <Settings size={18}/> }
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => { 
                    setSearchParams({ tab: tab.id });
                    if (tab.id !== 'downloads') setSelectedProductId(null);
                  }} 
                  className={`w-full flex items-center gap-4 px-8 py-5 rounded-3xl transition-all text-[11px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-primary text-white shadow-xl translate-x-2' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-grow animate-fade-in-up">
            {activeTab === 'orders' && (
              <div className="space-y-4">
                 {orders.map(order => (
                   <div key={order.id} className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                     <div className="flex items-center gap-8 text-left">
                        <div className="bg-primary/5 p-6 rounded-3xl text-primary"><FileText size={32} /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">Cód. #{order.id.slice(0,8).toUpperCase()}</p>
                          <p className="text-primary font-black text-3xl tracking-tighter italic">{CURRENCY_FORMAT.format(order.total)}</p>
                        </div>
                     </div>
                     <div className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${(order.status === 'approved' || order.status === 'completed') ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {(order.status === 'approved' || order.status === 'completed') ? 'Confirmado' : 'Processando'}
                     </div>
                   </div>
                 ))}
                 {orders.length === 0 && !loading && <p className="text-center p-20 text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhum pedido encontrado</p>}
              </div>
            )}

            {activeTab === 'downloads' && (
              <div className="space-y-8">
                 {!selectedProductId ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
                     {purchasedProducts.map(prod => (
                       <button key={prod.id} onClick={() => setSelectedProductId(prod.id)} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all group flex items-center gap-6">
                          <img src={prod.image_url} className="w-24 h-24 rounded-3xl object-cover shadow-xl group-hover:scale-105 transition-all" />
                          <div className="flex-grow">
                             <h3 className="text-xl font-black text-primary uppercase italic mb-2 leading-tight">{prod.name}</h3>
                             <span className="bg-primary/5 text-primary px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">Acessar</span>
                          </div>
                       </button>
                     ))}
                   </div>
                 ) : (
                   <div className="space-y-8 text-left animate-fade-in">
                      <button onClick={() => setSelectedProductId(null)} className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-400 hover:text-primary tracking-widest">
                         <ArrowLeft size={16} /> Voltar para Coleção
                      </button>

                      {currentProduct && (
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
                          <div className="p-10 bg-primary text-white flex flex-col md:flex-row items-center gap-10">
                            <img src={currentProduct.image_url} className="h-32 w-32 rounded-[2rem] object-cover shadow-2xl border-4 border-white/10" />
                            <div className="text-center md:text-left flex-grow">
                              <h3 className="font-black text-4xl uppercase italic tracking-tighter mb-3">{currentProduct.name}</h3>
                              <span className="bg-accent text-primary px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Membro VIP</span>
                            </div>
                          </div>

                          <div className="p-12 space-y-16">
                            {[
                              { id: 'main', label: currentProduct.download_label_main || 'Principais', text: currentProduct.download_text_main, icon: <Package size={18}/> },
                              { id: 'extras', label: currentProduct.download_label_extras || 'Extras', text: currentProduct.download_text_extras, icon: <Plus size={18}/> },
                              { id: 'bonus', label: currentProduct.download_label_bonus || 'Bônus', text: currentProduct.download_text_bonus, icon: <Zap size={18}/> }
                            ].map(cat => {
                              const files = currentProduct.files.filter(f => f.category === cat.id);
                              const hasContent = (cat.text && cat.text.replace(/<[^>]*>?/gm, '').trim().length > 0) || (cat.text && cat.text.includes('<a'));
                              
                              if (!hasContent && files.length === 0) return null;

                              return (
                                <div key={cat.id} className="space-y-8">
                                  <h4 className="text-[11px] font-black uppercase text-gray-400 flex items-center gap-4 tracking-[0.4em]">
                                    <span className="text-accent">{cat.icon}</span> {cat.label}
                                  </h4>
                                  
                                  {hasContent && (
                                    <div className="bg-primary/5 p-8 rounded-4xl border border-primary/5 relative overflow-hidden">
                                       <div className="relative z-10 prose prose-primary prose-sm max-w-none 
                                          prose-a:text-[#3B82F6] prose-a:font-black prose-a:underline hover:prose-a:text-accent transition-all 
                                          prose-p:text-gray-600 prose-p:font-medium prose-p:leading-relaxed">
                                          <div dangerouslySetInnerHTML={{ __html: cat.text! }} />
                                       </div>
                                    </div>
                                  )}

                                  {files.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                      {files.map(file => (
                                        <button 
                                          key={file.id} 
                                          onClick={() => window.open(file.file_path, '_blank')} 
                                          className="flex items-center gap-6 p-7 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:bg-primary hover:text-white transition-all text-left group shadow-sm hover:shadow-2xl"
                                        >
                                          <div className="bg-white group-hover:bg-white/10 p-5 rounded-2xl text-primary group-hover:text-white shadow-sm transition-colors">
                                            <FileText size={24} />
                                          </div>
                                          <div className="flex-grow truncate">
                                            <span className="text-sm font-black block truncate mb-1 uppercase italic tracking-tight">{file.file_name}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Download Livre</span>
                                          </div>
                                          <Download size={24} className="opacity-20 group-hover:opacity-100 transition-all" />
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                   </div>
                 )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
