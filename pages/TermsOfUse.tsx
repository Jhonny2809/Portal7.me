
import React, { useEffect } from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfUse: React.FC = () => {
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
          <h1 className="text-3xl md:text-5xl font-black mb-4">Termos de Uso</h1>
          <p className="text-gray-400 max-w-2xl mx-auto font-medium">
            Leia atentamente as regras de utilização da nossa plataforma Portal Sete.
          </p>
        </div>
      </div>

      {/* Conteúdo Legal */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12 space-y-10 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">1.</span> Termos
            </h2>
            <p>
              Ao acessar o site <strong>Portal7</strong>, você concorda em cumprir estes Termos de Uso, todas as leis e regulamentos aplicáveis, e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Caso não concorde com algum destes termos, fica proibido de usar ou acessar este site.
            </p>
            <p className="mt-4">
              Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">2.</span> Uso de Licença
            </h2>
            <p className="mb-4">
              É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou softwares) no site Portal7, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título, e sob esta licença você não pode:
            </p>
            <ul className="space-y-3 pl-4 list-disc marker:text-accent font-medium">
              <li>Modificar ou copiar os materiais;</li>
              <li>Usar os materiais para qualquer finalidade comercial ou para exibição pública;</li>
              <li>Tentar descompilar ou fazer engenharia reversa de qualquer software contido no site;</li>
              <li>Remover quaisquer direitos autorais ou outras notações de propriedade;</li>
              <li>Transferir os materiais para outra pessoa ou "espelhar" os materiais em outro servidor.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">3.</span> Isenção de Responsabilidade
            </h2>
            <p>
              Os materiais no site do Portal7 são fornecidos "como estão". O Portal7 não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">4.</span> Limitações
            </h2>
            <p>
              Em nenhum caso o Portal7 ou seus fornecedores serão responsáveis por quaisquer danos decorrentes do uso ou da incapacidade de usar os materiais, mesmo que o Portal7 tenha sido notificado da possibilidade de tais danos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">5.</span> Precisão dos Materiais
            </h2>
            <p>
              Os materiais exibidos no site do Portal7 podem incluir erros técnicos, tipográficos ou fotográficos. O Portal7 não garante que qualquer material em seu site seja preciso, completo ou atual.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">6.</span> Links
            </h2>
            <p>
              O Portal7 não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. O uso de qualquer site vinculado é por conta e risco do usuário.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">7.</span> Modificações
            </h2>
            <p>
              O Portal7 pode revisar estes Termos de Uso do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual destes Termos de Uso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
              <span className="bg-accent/10 text-accent p-2 rounded-lg">8.</span> Lei Aplicável
            </h2>
            <p>
              Estes termos e condições são regidos e interpretados de acordo com as leis da República Federativa do Brasil, e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais competentes do Brasil.
            </p>
          </section>

          <div className="pt-10 border-t border-gray-100 mt-10 text-sm text-gray-400">
            <p className="font-bold">Última atualização: 26 de julho de 2024, às 22:37</p>
            <p className="mt-2 flex items-center gap-2"><FileText size={14} className="text-accent" /> Portal Sete - Transparência e Segurança</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
