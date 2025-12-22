import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Download, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
  const status = searchParams.get('status') || searchParams.get('collection_status'); 
  const orderId = searchParams.get('external_reference');

  const [viewStatus, setViewStatus] = useState<'approved' | 'pending' | 'rejected'>('pending');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    clearCart();
    window.scrollTo(0, 0);

    // Prioriza o status vindo da URL do Mercado Pago
    if (status === 'approved' || status === 'completed') {
      setViewStatus('approved');
      if (orderId) syncOrder(orderId);
    }
    else if (status === 'rejected' || status === 'failure') {
      setViewStatus('rejected');
    }
    else {
      setViewStatus('pending');
      // Se estiver pendente, ouvimos mudanças no tempo real para o ID específico
      if (orderId) {
        const channel = setupRealtime(orderId);
        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [status, orderId]);

  // Função para configurar o canal de Realtime específico para este pedido
  const setupRealtime = (id: string) => {
    console.log(`📡 Iniciando monitoramento Realtime para o pedido: ${id}`);
    
    const channel = supabase
      .channel(`order-updates-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log('🔔 Atualização detectada no banco de dados:', payload.new);
          const newStatus = payload.new.status;
          
          // Se mudar para aprovado ou completado, liberamos a tela de sucesso
          if (newStatus === 'approved' || newStatus === 'completed') {
            setViewStatus('approved');
            setSyncing(false);
          } else if (newStatus === 'rejected') {
            setViewStatus('rejected');
            setSyncing(false);
          }
        }
      )
      .subscribe((subscribeStatus) => {
        if (subscribeStatus === 'SUBSCRIBED') {
          console.log('✅ Conectado ao fluxo de atualizações do pedido.');
        }
      });

    return channel;
  };

  const syncOrder = async (id: string) => {
    if (syncing) return;
    setSyncing(true);
    
    try {
      // Sincronização Ativa (Edge Function ou Webhook)
      await supabase.functions.invoke('verify-payment', { 
        body: { orderId: id, source: 'success_page_active_sync' } 
      });
    } catch (e) {
      console.warn("A sincronização ativa falhou, aguardando Realtime/Webhook.");
    } finally {
      // Se o gateway já retornou sucesso na URL, paramos o loading
      if (status === 'approved' || status === 'completed') setSyncing(false);
    }
  };

  const getContent = () => {
    if (viewStatus === 'approved') {
      return {
        icon: <CheckCircle size={80} className="text-green-500 animate-[bounce_1s_ease-in-out_infinite]" strokeWidth={1.5} />,
        title: 'Acesso Liberado!',
        subtitle: syncing 
          ? 'Finalizando a liberação...' 
          : 'Seu pagamento foi confirmado! Seus produtos digitais já estão disponíveis para download.'
      };
    }
    if (viewStatus === 'rejected') {
      return {
        icon: <AlertCircle size={80} className="text-red-500" strokeWidth={1.5} />,
        title: 'Pagamento não aprovado',
        subtitle: 'Houve uma falha na transação. Por favor, verifique seu método de pagamento no app do banco.'
      };
    }
    return {
      icon: <Clock size={80} className="text-blue-500 animate-pulse" strokeWidth={1.5} />,
      title: 'Validando Pagamento',
      subtitle: 'Estamos aguardando a confirmação do seu banco. Esta página atualizará sozinha assim que aprovado.'
    };
  };

  const content = getContent();

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#FCFCFC] px-4 py-20 animate-fade-in">
      <div className="max-w-xl w-full text-center space-y-10">
        
        <div className="relative inline-block">
          <div className="relative bg-white rounded-full p-10 shadow-2xl border-8 border-gray-50 flex items-center justify-center">
            {syncing || (viewStatus === 'pending' && orderId) ? (
              <div className="relative">
                 <Loader2 size={80} className="text-primary animate-spin opacity-20" strokeWidth={1.5} />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Clock size={32} className="text-primary animate-pulse" />
                 </div>
              </div>
            ) : content.icon}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tighter italic">
            {content.title}
          </h1>
          <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-md mx-auto">
            {content.subtitle}
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 pt-6">
            {paymentId && (
              <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                 <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest mb-1">ID Transação</span>
                 <span className="text-[11px] font-black uppercase text-primary tracking-widest">{paymentId}</span>
              </div>
            )}
            {orderId && (
              <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                 <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest mb-1">Cód. Pedido</span>
                 <span className="text-[11px] font-black uppercase text-primary tracking-widest">#{orderId.slice(0, 8).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 max-w-md mx-auto pt-6">
          <Link 
            to={viewStatus === 'approved' ? "/dashboard?tab=downloads" : "/dashboard?tab=orders"} 
            className={`py-6 px-10 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl transition-all flex items-center justify-center gap-3
              ${viewStatus === 'approved' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-primary text-white hover:bg-primary/90'}
            `}
          >
            {viewStatus === 'approved' ? <><Download size={20} /> Acessar Downloads Agora</> : <><Clock size={20} /> Acompanhar Pedido</>}
          </Link>
          
          <Link 
            to="/" 
            className="bg-white text-primary border-2 border-gray-100 py-6 px-10 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
          >
            Continuar Comprando <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;