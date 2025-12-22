import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { CURRENCY_FORMAT } from '../constants';
import { 
  Trash2, ShoppingBag, Loader2, AlertTriangle, 
  ArrowRight, XCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { useSite } from '../context/SiteContext';

const Cart: React.FC = () => {
  const { cart, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { config } = useSite();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login?redirect=cart');
      return;
    }

    setLoading(true);
    setErrorDetails(null);

    try {
      console.group("🚀 Processo de Checkout");
      
      // 1. Criar pedido no Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ 
          user_id: user.id, 
          total: cartTotal, 
          status: 'pending' 
        })
        .select().single();

      if (orderError) throw new Error(`Erro no banco de dados: ${orderError.message}`);

      // 2. Registrar itens
      const { error: itemsError } = await supabase.from('order_items').insert(
        cart.map(item => ({
          order_id: order.id,
          product_id: item.id,
          price_at_purchase: item.price
        }))
      );

      if (itemsError) throw new Error(`Erro ao salvar itens: ${itemsError.message}`);

      /** 
       * 3. CORREÇÃO DA BASE URL PARA EVITAR 404
       * Usamos split('#')[0] para pegar a URL base exata (ex: https://site.com/ ou https://site.com/index.html)
       * Isso evita que barras duplas // sejam enviadas ao Mercado Pago.
       */
      const cleanBase = window.location.href.split('#')[0];
      
      const payload = {
        orderId: order.id,
        userEmail: user.email,
        mpPublicKey: config?.mercadopago_public_key,
        mpAccessToken: config?.mercadopago_access_token,
        items: cart.map(item => ({
          name: item.name,
          price: Number(item.price),
          quantity: 1
        })),
        backUrls: {
          success: `${cleanBase}#/success`,
          pending: `${cleanBase}#/dashboard?tab=orders`,
          failure: `${cleanBase}#/dashboard?tab=orders`
        }
      };

      console.log("📡 Enviando Payload para Edge Function:", payload);
      
      const { data, error: funcError } = await supabase.functions.invoke('create-payment', {
        body: payload
      });

      if (funcError) throw new Error(`A Função de Pagamento falhou: ${funcError.message}`);

      const checkoutUrl = data?.url || data?.init_point || data?.checkout_url;
      
      if (checkoutUrl) {
        console.log("🔗 Redirecionando para:", checkoutUrl);
        console.groupEnd();
        clearCart();
        window.location.href = checkoutUrl;
      } else {
        throw new Error("A resposta da função não contém um link de checkout válido.");
      }

    } catch (err: any) {
      console.error("💥 Erro no Checkout:", err);
      console.groupEnd();
      setErrorDetails(err.message || "Ocorreu um erro inesperado ao processar seu pedido.");
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center animate-slide-up">
        <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-primary uppercase italic mb-4">Seu carrinho está vazio</h2>
        <Link to="/" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
          Ver Produtos <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex justify-between items-center mb-12">
           <h1 className="text-3xl font-black text-primary uppercase italic">Meu Carrinho</h1>
        </div>
        
        {errorDetails && (
          <div className="mb-10 p-8 bg-white border-2 border-red-100 rounded-[2.5rem] shadow-sm animate-slide-up flex flex-col md:flex-row items-center gap-6">
            <XCircle className="text-red-500 flex-shrink-0" size={48} />
            <div className="flex-grow">
               <h3 className="text-red-600 font-black uppercase text-sm mb-2">Erro no Checkout</h3>
               <p className="text-gray-600 text-sm font-medium mb-4">{errorDetails}</p>
               <button onClick={handleCheckout} className="bg-primary text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Tentar Novamente</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-[2rem] flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-6">
                  <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-2xl object-cover" />
                  <div>
                    <h3 className="font-black text-primary text-lg">{item.name}</h3>
                    <span className="text-primary font-black text-xl">{CURRENCY_FORMAT.format(item.price)}</span>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 p-4 rounded-2xl transition-all"><Trash2 size={24} /></button>
              </div>
            ))}
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-primary/5 h-fit sticky top-28">
            <h3 className="text-xl font-black text-primary uppercase italic mb-8 border-b pb-6">Resumo</h3>
            <div className="space-y-5 mb-12 text-sm">
              <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest"><span>Subtotal</span><span>{CURRENCY_FORMAT.format(cartTotal)}</span></div>
              <div className="pt-6 border-t border-gray-50 flex justify-between items-end"><span className="text-xs font-black text-primary uppercase">Total</span><span className="text-4xl font-black text-primary">{CURRENCY_FORMAT.format(cartTotal)}</span></div>
            </div>
            <button onClick={handleCheckout} disabled={loading} className="w-full bg-[#009EE3] text-white font-black py-6 rounded-2xl shadow-xl uppercase text-xs tracking-widest flex justify-center items-center gap-3 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><ShoppingBag size={18}/> Finalizar com Mercado Pago</>}
            </button>
            <p className="mt-8 text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">🔒 Transação Segura via Mercado Pago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;