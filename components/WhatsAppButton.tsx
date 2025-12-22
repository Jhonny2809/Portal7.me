
import React from 'react';
import { Users } from 'lucide-react';
import { useSite } from '../context/SiteContext';

const WhatsAppButton: React.FC = () => {
  const { config } = useSite();

  if (!config?.whatsapp_group_url) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[99999] pointer-events-auto">
      <a 
        href={config.whatsapp_group_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="relative flex items-center group transition-all hover:scale-110 active:scale-95"
      >
        {/* Camada de Sombra para Profundidade */}
        <div className="absolute inset-0 bg-black/20 blur-xl rounded-full translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Pill Verde com Texto - Agora com bordas completas para não parecer cortado */}
        <div className="bg-[#25D366] border-4 border-white rounded-full pl-16 pr-8 py-3.5 shadow-2xl relative z-10 flex flex-col justify-center min-w-[160px]">
           <span className="text-white font-black text-[10px] leading-none uppercase tracking-[0.15em] opacity-90">Grupo do</span>
           <span className="text-white font-black text-[13px] leading-tight uppercase tracking-[0.1em]">WhatsApp</span>
        </div>
        
        {/* Círculo do Ícone Branco sobreposto ao lado esquerdo */}
        <div className="absolute -left-1 bg-white w-14 h-14 rounded-full border-4 border-white shadow-xl flex items-center justify-center z-20 group-hover:rotate-[15deg] transition-transform duration-300">
          <Users className="text-[#25D366] w-7 h-7" strokeWidth={3} />
        </div>
      </a>
    </div>
  );
};

export default WhatsAppButton;
