
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { 
  Plus, Trash2, Layout as LayoutIcon, Settings, 
  Check, Loader2, Package, X, FolderOpen, Edit3, MessageCircle,
  CreditCard, Target, Upload, FileText, AlertCircle, Save,
  Zap, Download, Tag, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { Product, SiteSection, ProductFile } from '../types';

const Admin: React.FC = () => {
  const { config, refreshConfig } = useSite();
  const [activeTab, setActiveTab] = useState<'settings' | 'sections' | 'products' | 'payments' | 'pixel'>('settings');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  const productImgRef = useRef<HTMLInputElement>(null);
  const productFileRef = useRef<HTMLInputElement>(null);
  const sectionImgRef = useRef<HTMLInputElement>(null);

  const [settingsForm, setSettingsForm] = useState({
    contact_email: '', 
    contact_phone: '', 
    facebook_pixel_id: '',
    facebook_pixel_token: '',
    instagram_url: '',
    whatsapp_number: '',
    whatsapp_group_url: '',
    hero_title: '', 
    hero_subtitle: '',
    top_banner_text: '',
    mercadopago_public_key: '',
    mercadopago_access_token: ''
  });

  const [sections, setSections] = useState<SiteSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingSection, setEditingSection] = useState<Partial<SiteSection> | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productFiles, setProductFiles] = useState<ProductFile[]>([]);
  const [activeFileCategory, setActiveFileCategory] = useState('main');

  useEffect(() => {
    if (config) {
      setSettingsForm({
        contact_email: config.contact_email || '',
        contact_phone: config.contact_phone || '',
        facebook_pixel_id: config.facebook_pixel_id || '',
        facebook_pixel_token: config.facebook_pixel_token || '',
        instagram_url: config.instagram_url || '',
        whatsapp_number: config.whatsapp_number || '',
        whatsapp_group_url: config.whatsapp_group_url || '',
        hero_title: config.hero_title || '',
        hero_subtitle: config.hero_subtitle || '',
        top_banner_text: config.top_banner_text || '',
        mercadopago_public_key: config.mercadopago_public_key || '',
        mercadopago_access_token: config.mercadopago_access_token || ''
      });
    }
    fetchSections();
    fetchProducts();
  }, [config]);

  const fetchSections = async () => {
    const { data } = await supabase.from('sections').select('*').order('display_order');
    if (data) setSections(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchProductFiles = async (productId: string) => {
    const { data } = await supabase.from('product_files').select('*').eq('product_id', productId);
    if (data) setProductFiles(data);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setActiveFileCategory('main');
    fetchProductFiles(product.id);
  };

  const handleSaveSettings = async (fields: string[]) => {
    if (!config?.id) return;
    setLoading(true);
    try {
      const dataToUpdate = fields.reduce((acc, field) => ({ ...acc, [field]: (settingsForm as any)[field] }), {});
      const { error } = await supabase.from('site_config').update(dataToUpdate).eq('id', config.id);
      if (error) throw error;
      setMsg({ type: 'success', text: 'Configurações atualizadas!' });
      await refreshConfig();
    } catch (e: any) { setMsg({ type: 'error', text: e.message }); }
    finally { setLoading(false); }
  };

  const handleSaveSection = async () => {
    setLoading(true);
    try {
      if (editingSection?.id) {
        const { id, ...updateData } = editingSection as any;
        delete updateData.created_at;
        await supabase.from('sections').update(updateData).eq('id', id);
      } else {
        const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.display_order)) : 0;
        await supabase.from('sections').insert([{ ...editingSection, display_order: maxOrder + 1 }]);
      }
      setEditingSection(null);
      await fetchSections();
      setMsg({ type: 'success', text: 'Layout atualizado!' });
    } catch (e: any) { setMsg({ type: 'error', text: e.message }); }
    finally { setLoading(false); }
  };

  const handleSaveProduct = async () => {
    setLoading(true);
    try {
      if (editingProduct?.id) {
        const { id, ...updateData } = editingProduct as any;
        delete updateData.created_at;
        await supabase.from('products').update(updateData).eq('id', id);
      } else {
        await supabase.from('products').insert([editingProduct]);
      }
      setEditingProduct(null);
      await fetchProducts();
      setMsg({ type: 'success', text: 'Produto salvo!' });
    } catch (e: any) { setMsg({ type: 'error', text: e.message }); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct?.id) return;
    setUploadingFile(true);
    try {
      const fileName = `${editingProduct.id}/${activeFileCategory}_${Date.now()}_${file.name}`;
      await supabase.storage.from('product-files').upload(fileName, file);
      const { data: urlData } = supabase.storage.from('product-files').getPublicUrl(fileName);
      await supabase.from('product_files').insert({
        product_id: editingProduct.id,
        file_name: file.name,
        file_path: urlData.publicUrl,
        category: activeFileCategory
      });
      fetchProductFiles(editingProduct.id);
      setMsg({ type: 'success', text: 'Arquivo de download adicionado!' });
    } catch (err: any) { setMsg({ type: 'error', text: err.message }); }
    finally { setUploadingFile(false); }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl p-4 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium outline-none";
  const labelClass = "block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em] ml-1";

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-primary">
      {/* Hidden Upload Inputs */}
      <input type="file" ref={productImgRef} className="hidden" accept="image/*" onChange={async (e) => {
        const file = e.target.files?.[0]; if (!file) return; setUploadingImage(true);
        const fileName = `assets/${Date.now()}_${file.name}`;
        await supabase.storage.from('site-assets').upload(fileName, file);
        const { data } = supabase.storage.from('site-assets').getPublicUrl(fileName);
        if(editingProduct) setEditingProduct({ ...editingProduct, image_url: data.publicUrl });
        if(editingSection) setEditingSection({ ...editingSection, image_url: data.publicUrl });
        setUploadingImage(false);
      }} />
      <input type="file" ref={sectionImgRef} className="hidden" accept="image/*" onChange={async (e) => {
        const file = e.target.files?.[0]; if (!file) return; setUploadingImage(true);
        const fileName = `assets/${Date.now()}_${file.name}`;
        await supabase.storage.from('site-assets').upload(fileName, file);
        const { data } = supabase.storage.from('site-assets').getPublicUrl(fileName);
        if(editingSection) setEditingSection({ ...editingSection, image_url: data.publicUrl });
        setUploadingImage(false);
      }} />
      <input type="file" ref={productFileRef} className="hidden" onChange={handleFileUpload} />

      <header className="bg-primary text-white px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
           <div className="bg-accent p-2 rounded-xl text-primary shadow-lg"><Settings size={20} /></div>
           <h1 className="text-sm font-black uppercase tracking-[0.3em]">Portal Sete <span className="text-accent">Admin</span></h1>
        </div>
        <div className="flex gap-1.5 bg-white/5 p-1 rounded-2xl overflow-x-auto">
           {[
             { id: 'settings', label: 'Geral', icon: <Edit3 size={14}/> },
             { id: 'sections', label: 'Layout', icon: <LayoutIcon size={14}/> },
             { id: 'products', label: 'Produtos', icon: <Package size={14}/> },
             { id: 'payments', label: 'Financeiro', icon: <CreditCard size={14}/> },
             { id: 'pixel', label: 'Marketing', icon: <Target size={14}/> }
           ].map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-primary shadow-xl' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
               {tab.icon} {tab.label}
             </button>
           ))}
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-6xl flex-grow">
        {msg && (
          <div className={`mb-8 p-5 rounded-3xl flex items-center gap-4 animate-fade-in-up border ${msg.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
             {msg.type === 'success' ? <Check size={20}/> : <AlertCircle size={20}/>}
             <p className="text-xs font-bold uppercase tracking-wide">{msg.text}</p>
             <button onClick={()=>setMsg(null)} className="ml-auto p-2"><X size={16}/></button>
          </div>
        )}

        {/* ABA: CONFIGURAÇÕES GERAIS */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in-up">
             <section className="bg-white p-10 rounded-4xl shadow-xl border border-gray-100 space-y-8">
                <h2 className="text-xl font-black italic uppercase text-primary border-b pb-4 flex items-center gap-3"><Edit3 className="text-accent" /> Textos da Home</h2>
                <div className="space-y-6">
                   <div><label className={labelClass}>Aviso de Topo</label><input className={inputClass} value={settingsForm.top_banner_text} onChange={e => setSettingsForm({...settingsForm, top_banner_text: e.target.value})} placeholder="Ex: Use o cupom VIP7" /></div>
                   <div><label className={labelClass}>Título Principal (Hero)</label><input className={inputClass} value={settingsForm.hero_title} onChange={e => setSettingsForm({...settingsForm, hero_title: e.target.value})} /></div>
                   <div><label className={labelClass}>Subtítulo</label><textarea className={`${inputClass} h-32`} value={settingsForm.hero_subtitle} onChange={e => setSettingsForm({...settingsForm, hero_subtitle: e.target.value})} /></div>
                   <button onClick={() => handleSaveSettings(['top_banner_text', 'hero_title', 'hero_subtitle'])} disabled={loading} className="w-full gold-gradient text-primary py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3">
                     {loading ? <Loader2 className="animate-spin"/> : 'Salvar Textos'}
                   </button>
                </div>
             </section>
             <section className="bg-white p-10 rounded-4xl shadow-xl border border-gray-100 space-y-8">
                <h2 className="text-xl font-black italic uppercase text-primary border-b pb-4 flex items-center gap-3"><MessageCircle className="text-accent" /> Canais de Contato</h2>
                <div className="space-y-6">
                   <div><label className={labelClass}>WhatsApp Suporte</label><input className={inputClass} value={settingsForm.whatsapp_number} onChange={e => setSettingsForm({...settingsForm, whatsapp_number: e.target.value})} /></div>
                   <div><label className={labelClass}>Link Grupo VIP</label><input className={inputClass} value={settingsForm.whatsapp_group_url} onChange={e => setSettingsForm({...settingsForm, whatsapp_group_url: e.target.value})} /></div>
                   <div><label className={labelClass}>Instagram URL</label><input className={inputClass} value={settingsForm.instagram_url} onChange={e => setSettingsForm({...settingsForm, instagram_url: e.target.value})} /></div>
                   <div><label className={labelClass}>E-mail de Contato</label><input className={inputClass} value={settingsForm.contact_email} onChange={e => setSettingsForm({...settingsForm, contact_email: e.target.value})} /></div>
                   <button onClick={() => handleSaveSettings(['whatsapp_number', 'whatsapp_group_url', 'instagram_url', 'contact_email'])} disabled={loading} className="w-full bg-primary text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3">
                     {loading ? <Loader2 className="animate-spin"/> : 'Atualizar Contatos'}
                   </button>
                </div>
             </section>
          </div>
        )}

        {/* ABA: LAYOUT (SEÇÕES) */}
        {activeTab === 'sections' && (
          <div className="space-y-8 animate-fade-in-up">
            {editingSection ? (
              <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 space-y-10">
                 <div className="flex justify-between items-center"><h3 className="text-2xl font-black uppercase italic">Configurar Seção</h3><button onClick={()=>setEditingSection(null)} className="p-3 bg-gray-50 rounded-full hover:bg-gray-100"><X/></button></div>
                 <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div onClick={()=>productImgRef.current?.click()} className="aspect-video rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden relative shadow-inner group">
                          {editingSection.image_url ? <img src={editingSection.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-all" /> : <div className="text-center text-gray-300 font-black uppercase text-[10px] tracking-widest"><Upload className="mx-auto mb-2"/><p>Imagem da Seção</p></div>}
                          {uploadingImage && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-primary"/></div>}
                       </div>
                       <div><label className={labelClass}>Tipo de Seção</label><select className={inputClass} value={editingSection.type} onChange={e => setEditingSection({...editingSection, type: e.target.value as any})}><option value="hero">Capa (Hero)</option><option value="products">Vitrine de Produtos</option><option value="content">Texto e Imagem</option></select></div>
                    </div>
                    <div className="space-y-6">
                       <div><label className={labelClass}>Título da Seção</label><input className={inputClass} value={editingSection.title || ''} onChange={e => setEditingSection({...editingSection, title: e.target.value})} /></div>
                       <div><label className={labelClass}>Conteúdo/Descrição</label><textarea className={`${inputClass} h-32`} value={editingSection.content || ''} onChange={e => setEditingSection({...editingSection, content: e.target.value})} /></div>
                       {editingSection.type === 'products' && (<div><label className={labelClass}>Filtrar por Tag</label><input className={inputClass} placeholder="Ex: curso-vip" value={editingSection.filter_tag || ''} onChange={e => setEditingSection({...editingSection, filter_tag: e.target.value})} /></div>)}
                       <div className="flex items-center gap-4"><button onClick={()=>setEditingSection({...editingSection, is_visible: !editingSection.is_visible})} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${editingSection.is_visible ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{editingSection.is_visible ? 'Publicada' : 'Oculta'}</button></div>
                       <button onClick={handleSaveSection} className="w-full gold-gradient text-primary py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl">Salvar Seção</button>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-end"><h2 className="text-3xl font-black uppercase italic tracking-tighter">Estrutura da Home</h2><button onClick={()=>setEditingSection({type:'products', is_visible:true})} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">+ Nova Seção</button></div>
                <div className="grid gap-4">{sections.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between hover:shadow-xl transition-all group">
                     <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-2xl ${s.is_visible ? 'bg-primary/5 text-primary' : 'bg-gray-100 text-gray-300'}`}><LayoutIcon size={20}/></div>
                        <div><h4 className="font-bold text-primary italic uppercase tracking-tight">{s.title || s.type.toUpperCase()}</h4><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.type} • {s.is_visible ? 'Visível' : 'Oculto'}</span></div>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={()=>setEditingSection(s)} className="p-3 bg-gray-50 rounded-xl hover:text-primary transition-all"><Edit3 size={18}/></button>
                        <button onClick={async()=>{if(confirm('Excluir seção?')){await supabase.from('sections').delete().eq('id', s.id); fetchSections();}}} className="p-3 bg-gray-50 rounded-xl hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                     </div>
                  </div>
                ))}</div>
              </div>
            )}
          </div>
        )}

        {/* ABA: PRODUTOS */}
        {activeTab === 'products' && (
          <div className="animate-fade-in-up space-y-10">
            {editingProduct ? (
              <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl space-y-12">
                 <div className="flex justify-between items-center"><h3 className="text-2xl font-black uppercase italic">Configurar Infoproduto</h3><button onClick={()=>setEditingProduct(null)} className="p-3 bg-gray-50 rounded-full hover:bg-gray-100"><X/></button></div>
                 <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                       <div onClick={()=>productImgRef.current?.click()} className="aspect-square rounded-[3rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden relative shadow-inner group">
                          {editingProduct.image_url ? <img src={editingProduct.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-all" /> : <div className="text-center text-gray-300 font-black uppercase text-[10px] tracking-widest"><Upload className="mx-auto mb-2"/><p>Capa do Produto</p></div>}
                          {uploadingImage && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-primary"/></div>}
                       </div>
                       <div className="bg-gray-50 p-8 rounded-4xl space-y-6">
                          <h4 className="text-[10px] font-black uppercase text-accent tracking-[0.3em] flex items-center gap-2"><FolderOpen size={14}/> Rótulos do Dashboard</h4>
                          <input className={inputClass} placeholder="Ex: Arquivos Principais" value={editingProduct.download_label_main || ''} onChange={e => setEditingProduct({...editingProduct, download_label_main: e.target.value})} />
                          <input className={inputClass} placeholder="Ex: Materiais de Apoio" value={editingProduct.download_label_extras || ''} onChange={e => setEditingProduct({...editingProduct, download_label_extras: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div><label className={labelClass}>Nome do Produto</label><input className={inputClass} value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} /></div>
                       <div className="grid grid-cols-2 gap-4">
                          <div><label className={labelClass}>Valor (R$)</label><input type="number" step="0.01" className={inputClass} value={editingProduct.price || 0} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} /></div>
                          <div><label className={labelClass}>Status</label><button onClick={()=>setEditingProduct({...editingProduct, is_active: !editingProduct.is_active})} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${editingProduct.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{editingProduct.is_active ? 'Visível' : 'Oculto'}</button></div>
                       </div>
                       <div>
                          <label className={labelClass}>Categorias (Tags Separadas por Vírgula)</label>
                          <div className="relative">
                             <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                             <input className={`${inputClass} pl-12`} placeholder="Ex: curso, vip, vitalicio" value={editingProduct.tags?.join(', ') || ''} onChange={e => setEditingProduct({...editingProduct, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t !== '')})} />
                          </div>
                       </div>
                       <div><label className={labelClass}>Descrição Premium</label><textarea className={`${inputClass} h-32`} value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} /></div>
                       <button onClick={handleSaveProduct} className="w-full gold-gradient text-primary py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 hover:brightness-105 transition-all">Sincronizar Catálogo</button>
                    </div>
                 </div>

                 {editingProduct.id && (
                   <div className="p-10 bg-gray-900 rounded-[3.5rem] text-white space-y-8">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-8">
                         <div><h4 className="text-xl font-black uppercase italic tracking-tighter text-accent">Gestão de Arquivos</h4><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estes itens serão liberados após a compra</p></div>
                         <div className="flex bg-white/5 p-1 rounded-2xl">
                            {['main', 'extras', 'bonus'].map(cat => (
                              <button key={cat} onClick={() => setActiveFileCategory(cat)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeFileCategory === cat ? 'bg-accent text-primary shadow-lg' : 'text-gray-400 hover:text-white'}`}>{cat}</button>
                            ))}
                         </div>
                         <button onClick={() => productFileRef.current?.click()} disabled={uploadingFile} className="bg-accent text-primary px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                            {uploadingFile ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>} Adicionar Link
                         </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {productFiles.filter(f => f.category === activeFileCategory).map(file => (
                           <div key={file.id} className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-accent/30 transition-all">
                              <div className="flex items-center gap-4 truncate pr-4">
                                 <div className="p-3 bg-accent/20 text-accent rounded-xl"><FileText size={20}/></div>
                                 <p className="text-xs font-bold truncate">{file.file_name}</p>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => window.open(file.file_path, '_blank')} className="p-2.5 bg-white/5 rounded-xl hover:text-accent"><Download size={16}/></button>
                                 <button onClick={async() => {if(confirm('Apagar arquivo?')){await supabase.from('product_files').delete().eq('id', file.id); fetchProductFiles(editingProduct.id!)}}} className="p-2.5 bg-white/5 rounded-xl hover:text-red-500"><Trash2 size={16}/></button>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-end"><h2 className="text-3xl font-black uppercase italic tracking-tighter">Produtos no Ar</h2><button onClick={()=>setEditingProduct({name:'', price:0, is_active:true, tags:[]})} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all">+ Adicionar Produto</button></div>
                <div className="grid gap-6">{products.map(p => (
                  <div key={p.id} className="bg-white p-5 rounded-4xl border border-gray-100 flex items-center justify-between hover:shadow-2xl transition-all">
                     <div className="flex items-center gap-6"><div className="w-20 h-20 rounded-3xl overflow-hidden shadow-md"><img src={p.image_url} className="w-full h-full object-cover" /></div><div><h4 className="text-lg font-black uppercase italic tracking-tight">{p.name}</h4><span className="text-accent font-black text-[10px] uppercase tracking-widest">R$ {p.price.toFixed(2)} • {p.is_active ? 'Ativo' : 'Rascunho'}</span></div></div>
                     <button onClick={()=>handleEditProduct(p)} className="px-8 py-4 bg-gray-50 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">Gerenciar</button>
                  </div>
                ))}</div>
              </div>
            )}
          </div>
        )}

        {/* ABA: FINANCEIRO (PAYMENTS) */}
        {activeTab === 'payments' && (
          <div className="max-w-3xl mx-auto space-y-10 animate-fade-in-up">
             <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 space-y-10">
                <div className="flex items-center gap-5 border-b border-gray-50 pb-8">
                   <div className="bg-[#009EE3]/10 p-5 rounded-[2rem] text-[#009EE3]"><CreditCard size={32} /></div>
                   <div><h2 className="text-2xl font-black uppercase italic">Mercado Pago Gateway</h2><p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Configuração de Chaves</p></div>
                </div>
                <div className="space-y-6">
                   <div><label className={labelClass}>Public Key (Frontend)</label><input className={inputClass} value={settingsForm.mercadopago_public_key} onChange={e => setSettingsForm({...settingsForm, mercadopago_public_key: e.target.value})} placeholder="APP_USR-..." /></div>
                   <div><label className={labelClass}>Access Token (Backend)</label><input type="password" className={inputClass} value={settingsForm.mercadopago_access_token} onChange={e => setSettingsForm({...settingsForm, mercadopago_access_token: e.target.value})} placeholder="••••••••••••••••••••" /></div>
                   <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 flex gap-4 text-blue-700">
                      <Zap className="shrink-0" size={20}/><p className="text-[10px] font-bold uppercase leading-relaxed">As chaves de produção garantem que você receba os pagamentos instantaneamente.</p>
                   </div>
                   <button onClick={() => handleSaveSettings(['mercadopago_public_key', 'mercadopago_access_token'])} disabled={loading} className="w-full bg-[#009EE3] text-white py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all">
                     {loading ? <Loader2 className="animate-spin"/> : <><Save size={18}/> Salvar Chaves Financeiras</>}
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* ABA: MARKETING (PIXEL) */}
        {activeTab === 'pixel' && (
          <div className="max-w-3xl mx-auto space-y-10 animate-fade-in-up">
             <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 space-y-10">
                <div className="flex items-center gap-5 border-b border-gray-50 pb-8">
                   <div className="bg-indigo-50 p-5 rounded-[2rem] text-indigo-600"><Target size={32} /></div>
                   <div><h2 className="text-2xl font-black uppercase italic">Marketing & Track</h2><p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Pixel e API do Facebook</p></div>
                </div>
                <div className="space-y-6">
                   <div><label className={labelClass}>ID do Pixel (Facebook)</label><input className={inputClass} value={settingsForm.facebook_pixel_id} onChange={e => setSettingsForm({...settingsForm, facebook_pixel_id: e.target.value})} placeholder="Ex: 12345678910" /></div>
                   <div><label className={labelClass}>Conversion API Token</label><textarea className={`${inputClass} h-32`} value={settingsForm.facebook_pixel_token} onChange={e => setSettingsForm({...settingsForm, facebook_pixel_token: e.target.value})} placeholder="EAAB..." /></div>
                   <button onClick={() => handleSaveSettings(['facebook_pixel_id', 'facebook_pixel_token'])} disabled={loading} className="w-full bg-primary text-white py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all">
                     {loading ? <Loader2 className="animate-spin"/> : <><Save size={18}/> Salvar Rastreamento</>}
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
