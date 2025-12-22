
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Order, Product, ProductFile } from '../types';
import { CURRENCY_FORMAT } from '../constants';
import { 
  Download, Clock, FileText, Loader2, 
  PackageOpen, Settings, RefreshCw, Package, Plus, Zap, AlertCircle,
  Check, ChevronRight, ArrowLeft, LayoutGrid, Library
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
  
  // Estado para controlar qual produto está sendo visualizado na aba de downloads
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
            if (prod) {
              productsMap.set(String(prod.id), prod);
            }
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
        } else {
          setPurchasedProducts([]);
        }
      } else {
        setPurchasedProducts([]);
      }
    } catch (err: any) { 
      console.error("Erro Dashboard:", err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!user) return; 
    setProfileLoading(true);
    try {
      await supabase.from('profiles').upsert({ id: user.id, email: user.email, full_name: fullName });
      await refreshProfile(); 
      alert('Dados atualizados!');
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setProfileLoading(false); 
    }
  };

  // Encontra o produto selecionado atualmente
  const currentProduct = selectedProductId 
    ? purchasedProducts.find(p => String(p.id) === selectedProductId) 
    : null;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-primary"><Loader2 className="animate-spin text-accent" size={50} /></div>;

  return (
    <div className="bg-[#F8F9FB] min-h-screen font-sans">
      <div className="container mx-auto px-6 py-20 max-w-6xl">
        <div className="mb-16 animate-fade-in-up flex flex-col md:flex-row md:justify-between md:items-end gap-6">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-1 bg-accent rounded-full"></div>
                 <span className="text-[11px] font-black uppercase text-accent tracking-[0.4em]">Área de Membros</span>
              </div>
              <h1 className="text-5xl font-black text-primary uppercase italic tracking-tighter">Minha Conta</h1>
           </div>
           <button onClick={fetchUserData} className="w-fit p-4 bg-white border border-gray-100 rounded-3xl shadow-xl text-gray-400 hover:text-primary transition-all active:scale-95 flex items-center gap-2 group">
             <RefreshCw size={20} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
             <span className="text-[10px] font-black uppercase tracking-widest px-2">Sincronizar Acessos</span>
           </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-80 flex-shrink-0">
            <nav className="bg-white rounded-4xl p-5 border border-gray-100 shadow-2xl space-y-3 sticky top-32">
              {[
                { id: 'orders', label: 'Meus Pedidos', icon: <Clock size={18}/> },
                { id: 'downloads', label: 'Meus Arquivos', icon: <Download size={18}/> },
                { id: 'details', label: 'Dados do Perfil', icon: <Settings size={18}/> }
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
                  {activeTab === tab.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-grow animate-fade-in-up">
            {activeTab === 'orders' && (
              <div className="space-y-4">
                 {orders.length === 0 && !loading ? (
                   <div className="bg-white p-24 rounded-4xl text-center border-2 border-dashed border-gray-100">
                     <PackageOpen size={64} className="mx-auto text-gray-100 mb-6" />
                     <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Nenhum pedido realizado ainda.</p>
                   </div>
                 ) : (
                   orders.map(order => (
                     <div key={order.id} className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl flex flex-col md:flex-row justify-between items-center hover:scale-[1.01] transition-all gap-6">
                       <div className="flex items-center gap-8">
                          <div className="bg-primary/5 p-6 rounded-3xl text-primary shadow-sm"><FileText size={32} /></div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] mb-1">Cód. #{order.id.slice(0,8).toUpperCase()}</p>
                            <p className="text-primary font-black text-3xl tracking-tighter italic">{CURRENCY_FORMAT.format(order.total)}</p>
                          </div>
                       </div>
                       <div className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${(order.status === 'approved' || order.status === 'completed') ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                          {(order.status === 'approved' || order.status === 'completed') ? 'Confirmado' : 'Processando'}
                       </div>
                     </div>
                   ))
                 )}
              </div>
            )}

            {activeTab === 'downloads' && (
              <div className="space-y-8">
                 {purchasedProducts.length === 0 && !loading ? (
                   <div className="bg-white p-24 rounded-4xl text-center border-2 border-dashed border-gray-100">
                     <Download size={64} className="mx-auto text-gray-100 mb-6" />
                     <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Sua biblioteca está vazia.</p>
                   </div>
                 ) : (
                   <>
                     {/* VISTA 1: GALERIA DE PRODUTOS */}
                     {!selectedProductId ? (
                       <div className="animate-fade-in-up">
                          <div className="flex items-center gap-4 mb-10">
                             <Library className="text-accent" size={24} />
                             <h2 className="text-2xl font-black text-primary uppercase italic tracking-tighter">Minha Biblioteca</h2>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
                            {purchasedProducts.map(prod => (
                              <button 
                                key={prod.id} 
                                onClick={() => setSelectedProductId(String(prod.id))}
                                className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all group text-left flex items-center gap-8"
                              >
                                 <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                                    <img src={prod.image_url} alt="" className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-grow">
                                    <h3 className="text-xl font-black text-primary uppercase italic leading-none mb-3 group-hover:text-accent transition-colors">{prod.name}</h3>
                                    <div className="flex items-center gap-3">
                                       <span className="bg-primary/5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase text-primary tracking-widest">
                                          {prod.files.length} Arquivos
                                       </span>
                                       <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest flex items-center gap-1">
                                          Acessar <ChevronRight size={10} />
                                       </span>
                                    </div>
                                 </div>
                              </button>
                            ))}
                          </div>
                       </div>
                     ) : (
                       /* VISTA 2: ARQUIVOS DO PRODUTO SELECIONADO */
                       <div className="animate-fade-in-up space-y-8">
                          <button 
                            onClick={() => setSelectedProductId(null)} 
                            className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-400 hover:text-primary transition-colors tracking-[0.2em] mb-4"
                          >
                             <ArrowLeft size={16} /> Voltar para a Galeria
                          </button>

                          {currentProduct && (
                            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
                              <div className="p-10 bg-primary text-white flex flex-col md:flex-row items-center gap-10">
                                <img src={currentProduct.image_url} alt="" className="h-32 w-32 rounded-[2rem] object-cover shadow-2xl border-4 border-white/10" />
                                <div className="text-center md:text-left flex-grow">
                                  <h3 className="font-black text-4xl uppercase italic tracking-tighter mb-3">{currentProduct.name}</h3>
                                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <span className="bg-accent text-primary px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Acesso VIP</span>
                                    <span className="bg-white/10 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Check size={14}/> Vitalício</span>
                                  </div>
                                </div>
                              </div>

                              <div className="p-12 space-y-12 bg-white">
                                {[
                                  { id: 'main', label: currentProduct.download_label_main || 'Arquivos Principais', icon: <Package size={18}/> },
                                  { id: 'extras', label: currentProduct.download_label_extras || 'Materiais de Apoio', icon: <Plus size={18}/> },
                                  { id: 'bonus', label: currentProduct.download_label_bonus || 'Conteúdo Bônus', icon: <Zap size={18}/> }
                                ].map(cat => {
                                  const files = currentProduct.files.filter(f => f.category === cat.id);
                                  if (files.length === 0) return null;
                                  return (
                                    <div key={cat.id} className="space-y-6">
                                      <h4 className="text-[11px] font-black uppercase text-gray-400 flex items-center gap-4 tracking-[0.4em]">
                                        <span className="text-accent">{cat.icon}</span> {cat.label}
                                      </h4>
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
                                              <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Baixar Conteúdo Digital</span>
                                            </div>
                                            <Download size={24} className="opacity-20 group-hover:opacity-100 group-hover:translate-y-1 transition-all" />
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                       </div>
                     )}
                   </>
                 )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="bg-white p-14 rounded-5xl border border-gray-100 shadow-2xl max-w-2xl animate-fade-in-up">
                 <h3 className="text-2xl font-black text-primary uppercase italic mb-12 border-b pb-6">Meus Dados</h3>
                 <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div>
                       <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest mb-3 block">Nome Completo</label>
                       <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-3xl p-6 text-sm font-bold focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all shadow-inner outline-none" value={fullName} onChange={e => setFullName(e.target.value)} />
                    </div>
                    <div className="opacity-50">
                       <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest mb-3 block">E-mail de Cadastro</label>
                       <input type="email" disabled className="w-full bg-gray-100 border border-gray-200 rounded-3xl p-6 text-sm font-bold cursor-not-allowed outline-none" value={user?.email} />
                    </div>
                    <button type="submit" disabled={profileLoading} className="w-full gold-gradient text-primary py-7 rounded-3xl font-black uppercase text-xs tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                      {profileLoading ? <Loader2 className="animate-spin mx-auto" size={24}/> : 'Salvar Alterações'}
                    </button>
                 </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
