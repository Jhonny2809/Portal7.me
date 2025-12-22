
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, MessageCircle } from 'lucide-react';
import { useSite } from '../context/SiteContext';

const Footer: React.FC = () => {
  const { config } = useSite();

  return (
    <footer id="contact" className="bg-primary text-white">
      {/* Brand & Info Section */}
      <div className="container mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-6">
          {config?.logo_url ? (
             <img src={config.logo_url} alt="Logo" className="h-10 w-auto grayscale brightness-200" />
          ) : (
             <h3 className="font-bold text-xl tracking-tighter text-accent">Portal 7</h3>
          )}
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            {config?.hero_subtitle || 'Produtos digitais de alta qualidade para o seu desenvolvimento.'}
          </p>
        </div>

        {/* Contact Interativo */}
        <div className="space-y-6">
          <h3 className="font-bold uppercase text-accent text-xs tracking-widest">Contatos Rápidos</h3>
          <ul className="space-y-4">
             {config?.whatsapp_number && (
               <li>
                 <a href={`https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group text-gray-300 hover:text-white transition-colors">
                    <div className="bg-green-600/20 p-2.5 rounded-xl group-hover:bg-green-600 transition-all duration-300"><MessageCircle size={18}/></div>
                    <span className="text-sm font-medium">WhatsApp</span>
                 </a>
               </li>
             )}
             {config?.instagram_url && (
               <li>
                 <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group text-gray-300 hover:text-white transition-colors">
                    <div className="bg-pink-600/20 p-2.5 rounded-xl group-hover:bg-pink-600 transition-all duration-300"><Instagram size={18}/></div>
                    <span className="text-sm font-medium">Siga no Instagram</span>
                 </a>
               </li>
             )}
             {config?.contact_email && (
               <li>
                 <a href={`mailto:${config.contact_email}`} className="flex items-center gap-3 group text-gray-300 hover:text-white transition-colors">
                    <div className="bg-blue-600/20 p-2.5 rounded-xl group-hover:bg-blue-600 transition-all duration-300"><Mail size={18}/></div>
                    <span className="text-sm font-medium">{config.contact_email}</span>
                 </a>
               </li>
             )}
          </ul>
        </div>

        <div className="space-y-6">
           <h3 className="font-bold uppercase text-accent text-xs tracking-widest">Institucional</h3>
           <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Painel Administrativo</Link></li>
           </ul>
        </div>
      </div>

      <div className="bg-[#050e17] py-8 text-center text-[10px] text-gray-500 font-black uppercase tracking-[0.25em] border-t border-white/5">
        <p>© 2026 Portal Sete. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
