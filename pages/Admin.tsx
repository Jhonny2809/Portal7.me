
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { 
  Plus, Trash2, Layout as LayoutIcon, Settings, 
  Check, Loader2, Package, X, FolderOpen, Edit3, MessageCircle,
  CreditCard, Target, Upload, FileText, AlertCircle, Save,
  Zap, Download, Tag, ChevronRight, Eye, EyeOff, Link as LinkIcon,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, 
  AlignCenter, Eraser, Quote, Globe, Youtube, Info, ExternalLink
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { Product, SiteSection, ProductFile } from '../types';

// Premium Rich Text Editor with Custom Link Dialog (Bypasses Sandbox Issues)
const RichTextEditor: React.FC<{ 
  value: string; 
  onChange: (val: string) => void; 
  label: string;
  id?: string;
  minHeight?: string;
}> = ({ value, onChange, label, id, minHeight = "250px" }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // Sync content with external value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, id]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, val: string = '') => {
    const selection = window.getSelection();
    
    if (command === 'createLink') {
      if (!selection || selection.rangeCount === 0 || selection.toString().trim().length === 0) {
        alert("Por favor, selecione o texto que deseja transformar em link primeiro.");
        return;
      }
      // Clone range to maintain selection reference after focus loss from Modal/Prompt
      const range = selection.getRangeAt(0).cloneRange();
      setSavedRange(range);
      setShowLinkModal(true);
      setUrlInput('');
    } else {
      editorRef.current?.focus();
      document.execCommand(command, false, val);
      handleInput();
    }
  };

  const confirmLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const url = urlInput.trim();
    if (savedRange && url) {
      const selection = window.getSelection();
      if (selection && editorRef.current) {
        // Restore focus and selection
        editorRef.current.focus();
        selection.removeAllRanges();
        selection.addRange(savedRange);
        
        // Normalize URL
        let finalUrl = url;
        if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl)) {
          finalUrl = 'https://' + finalUrl;
        }
        
        // Execute command
        document.execCommand('createLink', false, finalUrl);
        
        // Post-process links to add target="_blank" and premium styling
        const links = editorRef.current.getElementsByTagName('a');
        for (let i = 0; i < links.length; i++) {
          if (links[i].getAttribute('href') === finalUrl) {
            links[i].setAttribute('target', '_blank');
            links[i].setAttribute('rel', 'noopener noreferrer');
            links[i].style.color = '#D4AF37';
            links[i].style.textDecoration = 'underline';
            links[i].style.fontWeight = 'bold';
          }
        }
        
        handleInput();
      }
    }
    closeLinkModal();
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
    setSavedRange(null);
    setUrlInput('');
  };

  return (
    <div className="space-y-3 text-left relative">
      <label className="block text-[10px] font-black text-primary/40 mb-1 uppercase tracking-[0.25em] ml-1">{label}</label>
      
      <div className="bg-[#121A26] border border-[#222D3D] rounded-3xl overflow-hidden shadow-2xl relative group transition-all focus-within:ring-2 focus-within:ring-accent/20">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-3 bg-[#1C2635] border-b border-[#222D3D]">
          <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} title="Negrito" />
          <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} title="Itálico" />
          <ToolbarButton onClick={() => execCommand('underline')} icon={Underline} title="Sublinhado" />
          <div className="w-px h-5 bg-[#222D3D] mx-2" />
          <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} title="Lista" />
          <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={AlignCenter} title="Centralizar" />
          <div className="w-px h-5 bg-[#222D3D] mx-2" />
          <ToolbarButton onClick={() => execCommand('createLink')} icon={LinkIcon} title="Inserir Link" />
          <ToolbarButton onClick={() => execCommand('removeFormat')} icon={Eraser} title="Limpar Estilo" />
        </div>

        {/* Content Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          style={{ minHeight }}
          className="p-10 text-gray-300 text-base leading-relaxed focus:outline-none prose prose-invert prose-sm max-w-none 
            prose-a:text-accent prose-a:font-bold prose-a:underline hover:prose-a:text-white transition-all selection:bg-accent/30"
          placeholder="Comece a digitar seu conteúdo..."
        />

        {/* Custom Link Modal (Anti-Sandbox Solution) */}
        {showLinkModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fade-in">
            <form onSubmit={confirmLink} className="bg-[#1C2635] border border-white/10 p-8 rounded-[2.5rem] shadow-3xl w-full max-w-sm space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-accent/20 text-accent rounded-xl"><LinkIcon size={16} /></div>
                  <h4 className="text-white text-[11px] font-black uppercase tracking-widest">Inserir Link</h4>
                </div>
                <button type="button" onClick={closeLinkModal} className="text-gray-500 hover:text-white transition-colors"><X size={20}/></button>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Cole a URL abaixo</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="https://exemplo.com"
                  className="w-full bg-[#121A26] border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-accent transition-all placeholder:text-gray-700"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit"
                  className="flex-grow bg-accent text-primary font-black py-5 rounded-2xl text-[11px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-accent/5"
                >
                  Aplicar Link
                </button>
                <button 
                  type="button"
                  onClick={closeLinkModal}
                  className="px-6 bg-white/5 text-gray-400 font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Visual status indicators */}
        <div className="absolute bottom-6 right-6 bg-accent/20 text-accent rounded-full p-2 shadow-xl pointer-events-none border border-accent/20">
          <Check size={14} strokeWidth={4} />
        </div>
      </div>
    </div>
  );
};

const ToolbarButton = ({ onClick, icon: Icon, title }: any) => (
  <button 
    type="button" 
    onMouseDown={e => e.preventDefault()} 
    onClick={onClick} 
    title={title} 
    className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-gray-500 hover:text-accent flex items-center justify-center"
  >
    <Icon size={16} />
  </button>
);

const Admin: React.FC = () => {
  const { config, refreshConfig } = useSite();
  const [activeTab, setActiveTab] = useState<'settings' | 'sections' | 'products' | 'payments' | 'pixel'>('settings');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  const productImgRef = useRef<HTMLInputElement>(null);
  const sectionImgRef = useRef<HTMLInputElement>(null);
  const productFileRef = useRef<HTMLInputElement>(null);

  const [sections, setSections] = useState<SiteSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingSection, setEditingSection] = useState<Partial<SiteSection> | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productFiles, setProductFiles] = useState<ProductFile[]>([]);
  const [activeFileCategory, setActiveFileCategory] = useState('main');

  const [settingsForm, setSettingsForm] = useState({
    contact_email: '', contact_phone: '', facebook_pixel_id: '',
    facebook_pixel_token: '', instagram_url: '', whatsapp_number: '',
    whatsapp_group_url: '', hero_title: '', hero_subtitle: '',
    top_banner_text: '', mercadopago_public_key: '', mercadopago_access_token: ''
  });

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
      const updateData: any = {};
      fields.forEach(f => updateData[f] = (settingsForm as any)[f]);
      const { error } = await supabase.from('site_config').update(updateData).eq('id', config.id);
      if (error) throw error;
      await refreshConfig();
      setMsg({ type: 'success', text: 'Configurações Salvas!' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) { setMsg({ type: 'error', text: err.message }); }
    finally { setLoading(false); }
  };

  const handleSaveSection = async () => {
    if (!editingSection) return;
    setLoading(true);
    try {
      if (editingSection.id) {
        const { id, ...updateData } = editingSection;
        const { error } = await supabase.from('sections').update(updateData).eq('id', id);
        if (error) throw error;
      } else {
        const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.display_order)) : 0;
        const { error } = await supabase.from('sections').insert([{ ...editingSection, display_order: maxOrder + 1, is_visible: true }]);
        if (error) throw error;
      }
      await fetchSections();
      setEditingSection(null);
      setMsg({ type: 'success', text: 'Estrutura Sincronizada!' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) { setMsg({ type: 'error', text: err.message }); }
    finally { setLoading(false); }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct || !editingProduct.id) return;
    setLoading(true);
    try {
      const { id, created_at, ...updateData } = editingProduct as any;
      const { error } = await supabase.from('products').update(updateData).eq('id', id);
      if (error) throw error;
      await fetchProducts();
      setMsg({ type: 'success', text: 'Produto Atualizado!' });
      setTimeout(() => setMsg(null), 3000);
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
      setMsg({ type: 'success', text: 'Arquivo Disponibilizado!' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) { setMsg({ type: 'error', text: err.message }); }
    finally { setUploadingFile(false); }
  };

  const labelClass = "block text-[10px] font-black text-primary/40 mb-2 uppercase tracking-[0.25em] ml-1";
  const inputClass = "w-full bg-white border border-gray-100 rounded-3xl p-6 outline-none font-bold text-sm focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col font-sans">
      <header className="bg-primary text-white px-8 py-6 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-5 text-left">
           <div className="bg-accent p-3 rounded-[1.2rem] text-primary shadow-xl ring-4 ring-accent/10"><Settings size={22} /></div>
           <div>
              <h1 className="text-sm font-black uppercase tracking-[0.4em] leading-none mb-1">Painel <span className="text-accent italic">Admin</span></h1>
              <span className="text-[9px] font-bold text-accent/50 uppercase tracking-[0.2em]">Gestão de Ecossistema</span>
           </div>
        </div>
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-3xl overflow-x-auto no-scrollbar max-w-[60%]">
           {[
             { id: 'settings', label: 'Global', icon: <Globe size={14}/> },
             { id: 'sections', label: 'Layout', icon: <LayoutIcon size={14}/> },
             { id: 'products', label: 'Materiais', icon: <Package size={14}/> },
             { id: 'payments', label: 'Finanças', icon: <CreditCard size={14}/> },
             { id: 'pixel', label: 'Ads/CAPI', icon: <Target size={14}/> }
           ].map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-primary shadow-2xl scale-105' : 'text-white/40 hover:text-white hover:bg-white/10'}`}>
               {tab.icon} {tab.label}
             </button>
           ))}
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-6xl flex-grow">
        {msg && (
          <div className={`fixed bottom-12 right-12 z-[100] p-8 rounded-[2.5rem] flex items-center gap-5 animate-fade-in-up border-2 bg-white shadow-4xl ${msg.type === 'success' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}>
             <div className={`p-3 rounded-2xl ${msg.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                {msg.type === 'success' ? <Check size={28}/> : <AlertCircle size={28}/>}
             </div>
             <div>
                <h4 className="font-black uppercase text-[11px] tracking-widest mb-1">{msg.type === 'success' ? 'Sucesso!' : 'Ocorreu um erro'}</h4>
                <p className="text-sm font-medium opacity-70">{msg.text}</p>
             </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="animate-fade-in-up space-y-12">
            {editingProduct ? (
              <div className="bg-white p-16 rounded-[4.5rem] border border-gray-100 shadow-4xl space-y-16 text-left relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-2 h-full bg-accent"></div>
                 <div className="flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-primary text-accent rounded-3xl"><Package size={24}/></div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">Editor de Material</h3>
                   </div>
                   <button onClick={()=>setEditingProduct(null)} className="p-4 bg-gray-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"><X size={24}/></button>
                 </div>
                 
                 <div className="grid md:grid-cols-2 gap-16 border-b border-gray-50 pb-16">
                    <div className="space-y-4">
                       <label className={labelClass}>Identidade Visual (Capa)</label>
                       <div onClick={()=>productImgRef.current?.click()} className="aspect-square rounded-[3.5rem] bg-gray-50 border-4 border-dashed border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-accent/30 transition-all">
                          {editingProduct.image_url ? (
                             <img src={editingProduct.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                             <div className="text-center text-gray-300 font-black uppercase text-[11px] tracking-[0.3em]">
                                <Upload className="mx-auto mb-4 w-12 h-12 opacity-20"/>
                                <p>Clique para subir imagem</p>
                             </div>
                          )}
                          <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <span className="text-white font-black uppercase text-[10px] tracking-widest border border-white/20 px-6 py-3 rounded-2xl">Trocar Imagem</span>
                          </div>
                          {uploadingImage && <div className="absolute inset-0 bg-white/90 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-primary" size={40}/></div>}
                       </div>
                    </div>
                    <div className="space-y-8">
                       <div><label className={labelClass}>Título Público do Material</label><input className={inputClass} value={editingProduct.name || ''} placeholder="Ex: Masterclass em Design..." onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} /></div>
                       <div className="grid grid-cols-2 gap-6">
                          <div><label className={labelClass}>Investimento (R$)</label><input type="number" step="0.01" className={inputClass} value={editingProduct.price || 0} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} /></div>
                          <div>
                             <label className={labelClass}>YouTube Video ID</label>
                             <div className="relative">
                                <Youtube className="absolute left-6 top-1/2 -translate-y-1/2 text-red-500 opacity-30" size={18}/>
                                <input className={`${inputClass} pl-16`} value={editingProduct.youtube_url || ''} placeholder="dQw4w9WgXcQ" onChange={e => setEditingProduct({...editingProduct, youtube_url: e.target.value})} />
                             </div>
                          </div>
                       </div>
                       <div>
                          <label className={labelClass}>Link de Amostra Grátis (Externo)</label>
                          <div className="relative">
                             <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 text-accent opacity-30" size={18}/>
                             <input className={`${inputClass} pl-16`} value={editingProduct.file_path || ''} placeholder="https://drive.google.com/..." onChange={e => setEditingProduct({...editingProduct, file_path: e.target.value})} />
                          </div>
                       </div>
                       <div><label className={labelClass}>Categorias / Tags (Vírgulas)</label><input className={inputClass} value={editingProduct.tags?.join(', ') || ''} placeholder="PDF, Design, Premium" onChange={e => setEditingProduct({...editingProduct, tags: e.target.value.split(',').map(t => t.trim())})} /></div>
                    </div>
                 </div>

                 <div className="space-y-10">
                    <RichTextEditor 
                      label="Apresentação do Produto (Vitrine)" 
                      value={editingProduct.description || ''} 
                      onChange={val => setEditingProduct({...editingProduct, description: val})} 
                      minHeight="220px" 
                    />
                    <button onClick={handleSaveProduct} disabled={loading} className="w-full gold-gradient text-primary py-8 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                       {loading ? <Loader2 className="animate-spin" /> : <><Save size={20}/> Sincronizar Informações Vitrine</>}
                    </button>
                 </div>

                 {/* Private Delivery Area */}
                 {editingProduct.id && (
                   <div className="p-16 bg-[#0B121B] rounded-[4rem] text-white space-y-16 border border-white/5 text-left shadow-4xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Zap size={200} /></div>
                      
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                         <div>
                            <h4 className="text-4xl font-black uppercase italic tracking-tighter text-accent mb-2">Entregáveis Privados</h4>
                            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Configuração da área de membros exclusiva</p>
                         </div>
                         <div className="flex bg-white/5 p-2 rounded-3xl gap-2 overflow-x-auto max-w-full no-scrollbar backdrop-blur-xl border border-white/5">
                            {['main', 'extras', 'bonus'].map(cat => (
                              <button key={cat} onClick={() => setActiveFileCategory(cat)} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFileCategory === cat ? 'bg-accent text-primary shadow-2xl scale-110' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                {(editingProduct as any)[`download_label_${cat}`] || cat.toUpperCase()}
                              </button>
                            ))}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 relative z-10">
                         <div className="xl:col-span-7 space-y-10">
                            <div className="space-y-4">
                               <label className={`${labelClass} text-white/40`}>Rótulo da Aba (Display)</label>
                               <input className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-sm font-bold text-white outline-none focus:border-accent transition-all" value={(editingProduct as any)[`download_label_${activeFileCategory}`] || ''} placeholder="Ex: Módulo 1: Introdução..." onChange={e => setEditingProduct({...editingProduct, [`download_label_${activeFileCategory}`]: e.target.value})} />
                            </div>
                            <RichTextEditor 
                                id={`${editingProduct.id}-${activeFileCategory}`} 
                                label="Instruções da Aba (Rich Text + Links)" 
                                value={(editingProduct as any)[`download_text_${activeFileCategory}`] || ''} 
                                onChange={val => setEditingProduct({...editingProduct, [`download_text_${activeFileCategory}`]: val})} 
                            />
                            <button onClick={handleSaveProduct} className="w-full bg-white/5 text-accent py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-accent/20 hover:bg-accent hover:text-primary transition-all shadow-xl shadow-accent/5 flex items-center justify-center gap-3">
                               <Save size={18}/> Sincronizar Aba: {activeFileCategory.toUpperCase()}
                            </button>
                         </div>
                         <div className="xl:col-span-5 space-y-8">
                            <div className="flex justify-between items-center bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                               <div>
                                  <h5 className="text-[11px] font-black uppercase text-accent tracking-widest mb-1">Repositório de Arquivos</h5>
                                  <span className="text-[9px] font-bold text-white/30 uppercase">Formatos aceitos: PDF, ZIP, MP4...</span>
                               </div>
                               <button onClick={() => productFileRef.current?.click()} className="bg-accent text-primary px-8 py-3 rounded-2xl font-black text-[10px] uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/10">Enviar Arquivo</button>
                            </div>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                               {productFiles.filter(f => f.category === activeFileCategory).map(file => (
                                 <div key={file.id} className="bg-white/5 p-6 rounded-3xl flex items-center justify-between group border border-white/5 hover:border-accent/30 transition-all">
                                    <div className="flex items-center gap-5 truncate">
                                       <div className="p-3 bg-white/5 rounded-xl text-white/20 group-hover:text-accent transition-colors"><FileText size={20} /></div>
                                       <span className="text-[11px] font-black truncate text-white/60 group-hover:text-white uppercase tracking-tight">{file.file_name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                       <button onClick={() => window.open(file.file_path, '_blank')} className="p-3 bg-white/5 text-white/30 hover:text-accent hover:bg-white/10 rounded-xl transition-all" title="Ver Arquivo"><Download size={18}/></button>
                                       <button onClick={async() => {if(confirm('Remover arquivo permanentemente do servidor?')){await supabase.from('product_files').delete().eq('id', file.id); fetchProductFiles(editingProduct.id!)}}} className="p-3 bg-white/5 text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Excluir"><Trash2 size={18}/></button>
                                    </div>
                                 </div>
                               ))}
                               {productFiles.filter(f => f.category === activeFileCategory).length === 0 && (
                                 <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] text-white/10 flex flex-col items-center gap-4">
                                    <FolderOpen size={40} className="opacity-10"/>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhum anexo nesta aba</span>
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>
                   </div>
                 )}
              </div>
            ) : (
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
                  <div>
                     <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Acervo de Materiais</h2>
                     <p className="text-primary/30 text-xs font-black uppercase tracking-widest">Gerencie a vitrine e o conteúdo exclusivo</p>
                  </div>
                  <button onClick={()=>setEditingProduct({name:'', price:0, is_active:true, tags:[]})} className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all ring-8 ring-primary/5">+ Novo Lançamento</button>
                </div>
                
                <div className="grid gap-6">
                  {products.map(p => (
                    <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between shadow-sm hover:shadow-2xl transition-all group">
                       <div className="flex items-center gap-10 text-left w-full md:w-auto">
                          <div className="relative flex-shrink-0">
                             <img src={p.image_url} className="w-24 h-24 rounded-[1.8rem] object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                             <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-xl ${p.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                                {p.is_active ? <Check size={14} className="text-white" /> : <X size={14} className="text-white" />}
                             </div>
                          </div>
                          <div>
                            <h4 className="font-black uppercase italic text-2xl tracking-tighter mb-1 text-primary group-hover:text-accent transition-colors">{p.name}</h4>
                            <div className="flex items-center gap-4">
                               <span className="text-[11px] font-black text-accent uppercase tracking-[0.2em]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}</span>
                               <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                               <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{p.tags?.slice(0, 2).join(' • ') || 'Sem Tags'}</span>
                            </div>
                          </div>
                       </div>
                       <div className="flex gap-4 mt-8 md:mt-0 w-full md:w-auto">
                          <button onClick={()=>handleEditProduct(p)} className="flex-grow md:flex-grow-0 px-10 py-5 bg-gray-50 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">Configurar</button>
                          <button onClick={async() => {if(confirm('Excluir este produto permanentemente?')){await supabase.from('products').delete().eq('id', p.id); fetchProducts();}}} className="p-5 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90"><Trash2 size={20}/></button>
                       </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                     <div className="p-32 text-center bg-white border border-gray-100 rounded-[4rem] flex flex-col items-center gap-6">
                        <Package size={60} className="text-primary/5" />
                        <span className="text-xs font-black uppercase text-primary/20 tracking-[0.4em]">Seu inventário está vazio</span>
                     </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
           <div className="max-w-3xl mx-auto space-y-12 animate-fade-in-up text-left">
              <section className="bg-white p-16 rounded-[4.5rem] shadow-4xl border border-gray-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12"><Globe size={240}/></div>
                 <div className="flex items-center gap-5 mb-12 border-b border-gray-50 pb-8">
                    <div className="bg-primary p-4 rounded-3xl text-accent shadow-2xl ring-8 ring-primary/5"><Globe size={28}/></div>
                    <div>
                       <h2 className="text-2xl font-black uppercase italic tracking-tighter">Dados de Identidade</h2>
                       <p className="text-primary/30 text-[10px] font-black uppercase tracking-widest">Configurações globais do Portal</p>
                    </div>
                 </div>
                 <div className="space-y-10">
                    <div><label className={labelClass}>Frase do Banner Superior</label><input className={inputClass} value={settingsForm.top_banner_text} placeholder="OFERTA EXCLUSIVA PARA MEMBROS..." onChange={e => setSettingsForm({...settingsForm, top_banner_text: e.target.value})} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div><label className={labelClass}>Título Principal (Hero)</label><input className={inputClass} value={settingsForm.hero_title} placeholder="A Nova Era do Conhecimento" onChange={e => setSettingsForm({...settingsForm, hero_title: e.target.value})} /></div>
                       <div><label className={labelClass}>WhatsApp (Com DDD)</label><input className={inputClass} value={settingsForm.whatsapp_number} onChange={e => setSettingsForm({...settingsForm, whatsapp_number: e.target.value})} placeholder="5511999999999" /></div>
                    </div>
                    <div>
                       <label className={labelClass}>URL do Grupo Oficial (Botão Flutuante)</label>
                       <div className="relative">
                          <MessageCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-green-500 opacity-40" size={18}/>
                          <input className={`${inputClass} pl-16`} value={settingsForm.whatsapp_group_url} onChange={e => setSettingsForm({...settingsForm, whatsapp_group_url: e.target.value})} placeholder="https://chat.whatsapp.com/..." />
                       </div>
                    </div>
                    <div>
                       <label className={labelClass}>URL do Perfil Instagram</label>
                       <div className="relative">
                          <InstagramIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-500 opacity-40" size={18}/>
                          <input className={`${inputClass} pl-16`} value={settingsForm.instagram_url} onChange={e => setSettingsForm({...settingsForm, instagram_url: e.target.value})} placeholder="https://instagram.com/..." />
                       </div>
                    </div>
                    <div><label className={labelClass}>E-mail de Suporte ao Cliente</label><input className={inputClass} value={settingsForm.contact_email} onChange={e => setSettingsForm({...settingsForm, contact_email: e.target.value})} placeholder="contato@exemplo.com" /></div>
                    <div><label className={labelClass}>Bio / Descritivo do Rodapé</label><textarea className={`${inputClass} h-40 resize-none py-6`} value={settingsForm.hero_subtitle} placeholder="Uma breve descrição sobre a missão do portal..." onChange={e => setSettingsForm({...settingsForm, hero_subtitle: e.target.value})} /></div>
                    <button onClick={() => handleSaveSettings(['top_banner_text', 'hero_title', 'hero_subtitle', 'whatsapp_number', 'whatsapp_group_url', 'instagram_url', 'contact_email'])} className="w-full bg-primary text-white py-8 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-3xl hover:brightness-110 active:scale-95 transition-all">Sincronizar Dados Globais</button>
                 </div>
              </section>
           </div>
        )}

        {/* LAYOUT TAB */}
        {activeTab === 'sections' && (
           <div className="space-y-12 animate-fade-in-up">
              {editingSection ? (
                <div className="bg-white p-16 rounded-[4.5rem] shadow-4xl border border-gray-100 space-y-12 text-left relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-2 h-full bg-accent"></div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary text-accent rounded-3xl"><LayoutIcon size={24}/></div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter">Design de Seção</h3>
                      </div>
                      <button onClick={()=>setEditingSection(null)} className="p-4 bg-gray-50 rounded-full hover:bg-gray-100 active:scale-95 transition-all"><X size={24}/></button>
                   </div>
                   <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <label className={labelClass}>Tipo de Conteúdo</label>
                           <select className={inputClass} value={editingSection.type} onChange={e => setEditingSection({...editingSection, type: e.target.value as any})}>
                              <option value="hero">Hero (Destaque Principal)</option>
                              <option value="products">Vitrine de Produtos</option>
                              <option value="content">Conteúdo Livre / HTML</option>
                           </select>
                        </div>
                        <div><label className={labelClass}>Tagline / Subtítulo</label><input className={inputClass} value={editingSection.subtitle || ''} placeholder="O que há de novo?" onChange={e => setEditingSection({...editingSection, subtitle: e.target.value})} /></div>
                      </div>
                      <div><label className={labelClass}>Título Exibido na Seção</label><input className={inputClass} value={editingSection.title || ''} placeholder="Confira nossos destaques..." onChange={e => setEditingSection({...editingSection, title: e.target.value})} /></div>
                      
                      {editingSection.type === 'products' && (
                         <div>
                            <label className={labelClass}>Filtrar por Tag (Vazio = Todos)</label>
                            <input className={inputClass} value={editingSection.filter_tag || ''} placeholder="Ex: PDF, Cursos..." onChange={e => setEditingSection({...editingSection, filter_tag: e.target.value})} />
                         </div>
                      )}

                      <RichTextEditor label="Conteúdo Complementar (Rich Text)" value={editingSection.content || ''} onChange={val => setEditingSection({...editingSection, content: val})} />
                      
                      <div className="space-y-4">
                         <label className={labelClass}>Imagem de Fundo / Ilustração</label>
                         <div onClick={()=>sectionImgRef.current?.click()} className="aspect-[21/9] rounded-[3rem] bg-gray-50 border-4 border-dashed border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden relative group">
                            {editingSection.image_url ? (
                               <img src={editingSection.image_url} className="w-full h-full object-cover" />
                            ) : (
                               <div className="text-center text-gray-300 font-black uppercase text-[10px] tracking-widest"><Upload className="mx-auto mb-2 opacity-20"/> Selecionar Ativo</div>
                            )}
                            {uploadingImage && <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-primary"/></div>}
                         </div>
                      </div>

                      <button onClick={handleSaveSection} className="w-full bg-primary text-white py-8 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-3xl hover:scale-[1.01] active:scale-[0.99] transition-all">Sincronizar Design</button>
                   </div>
                </div>
              ) : (
                <div className="space-y-12 text-left">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                      <div>
                         <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Arquitetura da Home</h2>
                         <p className="text-primary/30 text-xs font-black uppercase tracking-widest">Controle a ordem e o visual das seções do site</p>
                      </div>
                      <button onClick={()=>setEditingSection({type:'products', title:'', is_visible:true})} className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all ring-8 ring-primary/5">+ Nova Seção</button>
                   </div>
                   <div className="grid gap-6">
                      {sections.map((s, idx) => (
                        <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between hover:shadow-2xl transition-all group">
                           <div className="flex items-center gap-8 text-left w-full md:w-auto">
                              <div className="bg-primary/5 p-6 rounded-3xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                 {s.type === 'hero' ? <Zap size={24}/> : s.type === 'products' ? <Package size={24}/> : <FileText size={24}/>}
                              </div>
                              <div>
                                 <h4 className="font-black text-primary italic uppercase text-2xl tracking-tighter mb-1">{s.title || 'Seção Sem Título'}</h4>
                                 <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-lg">{s.type}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Ordem #{idx + 1}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex gap-4 mt-8 md:mt-0 w-full md:w-auto">
                              <button onClick={()=>setEditingSection(s)} className="flex-grow md:flex-grow-0 p-5 bg-gray-50 rounded-2xl hover:text-primary transition-all shadow-sm active:scale-90" title="Editar"><Edit3 size={22}/></button>
                              <button onClick={async()=>{if(confirm('Tem certeza que deseja remover esta seção do layout?')){await supabase.from('sections').delete().eq('id', s.id); fetchSections();}}} className="flex-grow md:flex-grow-0 p-5 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90" title="Excluir"><Trash2 size={22}/></button>
                           </div>
                        </div>
                      ))}
                      {sections.length === 0 && (
                         <div className="p-32 text-center bg-white border border-gray-100 rounded-[4rem] flex flex-col items-center gap-6">
                            <LayoutIcon size={60} className="text-primary/5" />
                            <span className="text-xs font-black uppercase text-primary/20 tracking-[0.4em]">Seu layout está em branco</span>
                         </div>
                      )}
                   </div>
                </div>
              )}
           </div>
        )}

        {/* REMAINING TABS (Simplified for brevity as they follow similar patterns) */}
        {(activeTab === 'payments' || activeTab === 'pixel') && (
           <div className="max-w-2xl mx-auto space-y-12 animate-fade-in-up text-left">
              <section className="bg-white p-16 rounded-[4.5rem] shadow-4xl border border-gray-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">{activeTab === 'payments' ? <CreditCard size={240}/> : <Target size={240}/>}</div>
                 <div className="flex items-center gap-5 mb-12 border-b border-gray-50 pb-8">
                    <div className={`p-4 rounded-3xl text-white shadow-2xl ring-8 ${activeTab === 'payments' ? 'bg-[#009EE3] ring-[#009EE3]/5' : 'bg-[#1877F2] ring-[#1877F2]/5'}`}>
                       {activeTab === 'payments' ? <CreditCard size={28}/> : <Target size={28}/>}
                    </div>
                    <div>
                       <h2 className="text-2xl font-black uppercase italic tracking-tighter">{activeTab === 'payments' ? 'Gateway Mercado Pago' : 'Facebook Marketing'}</h2>
                       <p className="text-primary/30 text-[10px] font-black uppercase tracking-widest">Integrações de Infraestrutura</p>
                    </div>
                 </div>
                 
                 <div className="space-y-10">
                    {activeTab === 'payments' ? (
                       <>
                          <div><label className={labelClass}>Public Key (Front-end)</label><input className={inputClass} value={settingsForm.mercadopago_public_key} onChange={e => setSettingsForm({...settingsForm, mercadopago_public_key: e.target.value})} placeholder="APP_USR-..." /></div>
                          <div><label className={labelClass}>Access Token (Sync/CAPI)</label><input className={inputClass} type="password" value={settingsForm.mercadopago_access_token} onChange={e => setSettingsForm({...settingsForm, mercadopago_access_token: e.target.value})} placeholder="••••••••••••••••••••••••" /></div>
                          <button onClick={() => handleSaveSettings(['mercadopago_public_key', 'mercadopago_access_token'])} className="w-full bg-[#009EE3] text-white py-8 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-3xl hover:brightness-110 active:scale-95 transition-all">Sincronizar Chaves</button>
                       </>
                    ) : (
                       <>
                          <div><label className={labelClass}>Facebook Pixel ID</label><input className={inputClass} value={settingsForm.facebook_pixel_id} onChange={e => setSettingsForm({...settingsForm, facebook_pixel_id: e.target.value})} placeholder="1234567890..." /></div>
                          <div><label className={labelClass}>Token de Conversão (CAPI)</label><input className={inputClass} type="password" value={settingsForm.facebook_pixel_token} onChange={e => setSettingsForm({...settingsForm, facebook_pixel_token: e.target.value})} placeholder="••••••••••••••••••••••••" /></div>
                          <button onClick={() => handleSaveSettings(['facebook_pixel_id', 'facebook_pixel_token'])} className="w-full bg-[#1877F2] text-white py-8 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-3xl hover:brightness-110 active:scale-95 transition-all">Sincronizar Marketing</button>
                       </>
                    )}
                 </div>
              </section>
           </div>
        )}
      </main>

      {/* HIDDEN INPUTS */}
      <input type="file" ref={productImgRef} className="hidden" accept="image/*" onChange={async e => {
        const file = e.target.files?.[0]; if (!file) return; setUploadingImage(true);
        const fileName = `products/${Date.now()}_${file.name}`;
        await supabase.storage.from('site-assets').upload(fileName, file);
        const { data } = supabase.storage.from('site-assets').getPublicUrl(fileName);
        if(editingProduct) setEditingProduct({...editingProduct, image_url: data.publicUrl});
        setUploadingImage(false);
      }} />
      <input type="file" ref={sectionImgRef} className="hidden" accept="image/*" onChange={async e => {
        const file = e.target.files?.[0]; if (!file) return; setUploadingImage(true);
        const fileName = `layout/${Date.now()}_${file.name}`;
        await supabase.storage.from('site-assets').upload(fileName, file);
        const { data } = supabase.storage.from('site-assets').getPublicUrl(fileName);
        if(editingSection) setEditingSection({...editingSection, image_url: data.publicUrl});
        setUploadingImage(false);
      }} />
      <input type="file" ref={productFileRef} className="hidden" onChange={handleFileUpload} />
    </div>
  );
};

// Simple Instagram Icon for the settings page
const InstagramIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default Admin;
