
import React, { useEffect } from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Header da Página */}
      <div className="bg-primary text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-accent hover:text-white transition-colors mb-6 text-xs font-black uppercase tracking-widest">
            <ArrowLeft size={16} /> Voltar para a Home
          </Link>
          <h1 className="text-3xl md:text-5xl font-black mb-4">Política de Privacidade</h1>
          <p className="text-gray-400 max-w-2xl mx-auto font-medium">
            Sua privacidade é nossa prioridade. Saiba como protegemos seus dados no Portal Sete.
          </p>
        </div>
      </div>

      {/* Conteúdo Legal */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12 space-y-10 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">1.</span> Introdução
            </h2>
            <p>
              A sua privacidade é importante para nós. Esta Política de Privacidade descreve como o <strong>Portal7</strong>, loja digital de comércio eletrônico, coleta, utiliza, armazena, protege e compartilha dados pessoais de seus usuários, em conformidade com a Lei Geral de Proteção de Dados – LGPD (Lei nº 13.709/2018).
            </p>
            <p className="mt-4 italic">Ao utilizar o site Portal7, você concorda com as práticas descritas nesta política.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">2.</span> Coleta de Dados Pessoais
            </h2>
            <p className="mb-4">O Portal7 coleta apenas os dados pessoais estritamente necessários para o funcionamento da loja digital, tais como:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 list-disc marker:text-accent font-medium">
              <li>Nome completo</li>
              <li>CPF ou CNPJ</li>
              <li>Endereço de e-mail</li>
              <li>Número de telefone</li>
              <li>Endereço de entrega e cobrança</li>
              <li>Dados de pagamento (processados por parceiros)</li>
              <li>Informações de navegação (Cookies, IP)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">3.</span> Finalidade do Tratamento
            </h2>
            <p>Os dados pessoais coletados são utilizados para:</p>
            <ul className="mt-4 space-y-2 pl-4 list-disc marker:text-accent font-medium">
              <li>Processamento e gerenciamento de pedidos;</li>
              <li>Emissão de notas fiscais e entrega de produtos;</li>
              <li>Comunicação com o cliente e atendimento ao consumidor;</li>
              <li>Cumprimento de obrigações legais e prevenção a fraudes;</li>
              <li>Ações de marketing, quando autorizado pelo titular.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">4.</span> Compartilhamento de Dados
            </h2>
            <p>
              O Portal7 <strong>não comercializa dados pessoais</strong>. Os dados poderão ser compartilhados apenas quando necessário com plataformas de pagamento, empresas de logística, sistemas antifraude ou autoridades governamentais mediante obrigação legal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">5.</span> Armazenamento e Segurança
            </h2>
            <p>
              Os dados pessoais são armazenados em ambientes seguros e protegidos por medidas técnicas adequadas para prevenir acessos não autorizados ou vazamentos. Os dados são mantidos apenas pelo tempo necessário para cumprir as finalidades legais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">6.</span> Direitos do Titular (LGPD)
            </h2>
            <p>O usuário pode, a qualquer momento, solicitar acesso, correção, anonimização, portabilidade ou exclusão de seus dados pessoais por meio de nossos canais oficiais.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">7.</span> Cookies
            </h2>
            <p>
              Utilizamos cookies para garantir o funcionamento correto da loja e melhorar sua experiência. Você pode gerenciar ou desativar os cookies no seu navegador.
            </p>
          </section>

          <div className="pt-10 border-t border-gray-100 mt-10 text-sm text-gray-400">
            <p className="font-bold">Última atualização: 26 de julho de 2024, às 22:37</p>
            <p className="mt-2 flex items-center gap-2"><ShieldCheck size={14} className="text-accent" /> Portal Sete - Proteção de Dados Garantida</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
