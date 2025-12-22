
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Menu, X, ChevronDown, Package, Download, 
  Instagram, MessageCircle, Mail, Hash, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSite } from '../context/SiteContext';
import { supabase } from '../services/supabase';

const Header: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { config, sections } = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileContactOpen, setMobileContactOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // Extrai as seções de produtos para o menu
  const productCategories = useMemo(() => {
    return sections
      .filter(s => s.type === 'products' && s.is_visible)
      .sort((a, b) => a.display_order - b.display_order);
  }, [sections]);

  useEffect(() => {
    if (cartCount > 0) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#section-${sectionId}`);
      return;
    }
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex flex-col w-full font-sans">
      <div className="bg-primary text-white text-[10px] sm:text-xs font-bold py-2 text-center uppercase tracking-widest px-4">
        {config?.top_banner_text || 'DESCONTOS INCRÍVEIS PARA DESBRAVADORES'}
      </div>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            
            <Link to="/" className="flex items-center justify-center">
               {config?.logo_url ? (
                 <img src={config.logo_url} alt="Logo" className="h-10 w-auto object-contain" />
               ) : (
                 <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-[#1a3a5a] rounded-full flex items-center justify-center shadow-md border-2 border-accent/50 group overflow-hidden">
                   <span className="text-accent font-serif font-bold text-xl relative z-10">7</span>
                 </div>
               )}
            </Link>

            <nav className="hidden md:flex items-center gap-10 text-base font-bold text-gray-700">
              <Link to="/" className="hover:text-accent transition-colors">Início</Link>
              
              {/* Dropdown de Produtos/Categorias */}
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-accent transition-colors focus:outline-none py-1">
                  Produtos <ChevronDown size={16} strokeWidth={2.5} className="group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-64">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden py-3 translate-y-2 group-hover:translate-y-0 transition-transform">
                    {productCategories.length > 0 ? (
                      productCategories.map(section => (
                        <button 
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className="w-full text-left flex items-center px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors group/item"
                        >
                          <Hash size={14} className="mr-3 text-accent group-hover/item:scale-125 transition-transform" />
                          <span className="truncate">{section.filter_tag || section.title || 'Ver Tudo'}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-5 py-3 text-xs text-gray-400 italic">Nenhuma categoria encontrada</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-accent transition-colors focus:outline-none py-1">
                  Contato <ChevronDown size={16} strokeWidth={2.5} className="group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-52">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden py-2 translate-y-2 group-hover:translate-y-0 transition-transform">
                    {config?.instagram_url && (
                      <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-pink-600">
                        <Instagram className="h-4 w-4 mr-3" /> Instagram
                      </a>
                    )}
                    {config?.whatsapp_number && (
                      <a href={`https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-600">
                        <MessageCircle className="h-4 w-4 mr-3" /> WhatsApp
                      </a>
                    )}
                    {config?.contact_email && (
                      <a href={`mailto:${config.contact_email}`} className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                        <Mail className="h-4 w-4 mr-3" /> E-mail
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-accent transition-colors focus:outline-none py-1">
                  Minha conta <ChevronDown size={16} strokeWidth={2.5} className="group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-56">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden py-2 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Link to={user ? "/dashboard?tab=orders" : "/login"} className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary">
                      <Package className="h-4 w-4 mr-3 text-primary" /> Meus Pedidos
                    </Link>
                    <Link to={user ? "/dashboard?tab=downloads" : "/login"} className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary">
                      <Download className="h-4 w-4 mr-3 text-primary" /> Downloads
                    </Link>
                    {user && (
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
                          Sair da conta
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <Link to="/admin" className="text-primary hover:text-accent text-[10px] font-black border border-primary/20 px-2 py-1 rounded transition-all">ADMIN</Link>
              )}
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/cart" className={`text-gray-500 hover:text-accent relative p-1 transition-all ${isPulsing ? 'scale-110' : 'scale-100'}`}>
                <ShoppingBag size={22} strokeWidth={1.5} className={isPulsing ? 'animate-cart-bounce' : ''} />
                {cartCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-accent text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-sm ${isPulsing ? 'animate-pop' : ''}`}>
                    {cartCount}
                  </span>
                )}
              </Link>
              <button className="md:hidden text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full z-40 shadow-xl p-6 animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex flex-col space-y-5 font-bold text-gray-800 text-lg">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Início</Link>
              
              {/* Categorias Mobile */}
              <div>
                <button onClick={() => setMobileProductsOpen(!mobileProductsOpen)} className="flex items-center justify-between w-full">
                  Produtos <ChevronDown size={20} className={`transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileProductsOpen && (
                  <div className="pl-4 mt-4 space-y-4 border-l-2 border-gray-50">
                    {productCategories.map(section => (
                      <button 
                        key={section.id} 
                        onClick={() => scrollToSection(section.id)}
                        className="flex items-center text-base gap-3 text-gray-500 hover:text-primary"
                      >
                        <Hash size={16} /> {section.filter_tag || section.title || 'Geral'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-50 pt-4">
                <button onClick={() => setMobileContactOpen(!mobileContactOpen)} className="flex items-center justify-between w-full">
                  Contato <ChevronDown size={20} className={`transition-transform ${mobileContactOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileContactOpen && (
                  <div className="pl-4 mt-4 space-y-4 border-l-2 border-gray-50">
                    {config?.instagram_url && <a href={config.instagram_url} target="_blank" className="flex items-center text-base gap-3 text-pink-600"><Instagram size={18}/> Instagram</a>}
                    {config?.whatsapp_number && <a href={`https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}`} target="_blank" className="flex items-center text-base gap-3 text-green-600"><MessageCircle size={18}/> WhatsApp</a>}
                    {config?.contact_email && <a href={`mailto:${config.contact_email}`} className="flex items-center text-base gap-3 text-blue-600"><Mail size={18}/> E-mail</a>}
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-50 pt-4">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-1">Minha Conta</Link>
                {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-primary">Painel Administrador</Link>}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;
