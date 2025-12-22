import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('view') === 'reset') {
      setIsReset(true);
    }
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isReset) {
        // Simple password reset request
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/#/login?view=update_password',
        });
        if (error) throw error;
        setSuccessMsg('Email de recuperação enviado! Verifique sua caixa de entrada.');
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        handleSuccess();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Cadastro realizado! Verifique seu email ou faça login.');
        setIsLogin(true); // Switch to login after signup
      }
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
      const redirect = searchParams.get('redirect');
      if (redirect) {
          navigate(`/${redirect}`);
      } else {
          navigate('/');
      }
  }

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center bg-white">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          {isReset ? 'Recuperar Senha' : (isLogin ? 'Bem-vindo de volta' : 'Crie sua conta')}
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">{error}</div>}
        {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm border border-green-100">{successMsg}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              required
            />
          </div>
          
          {!isReset && (
            <div>
                <label className="block text-gray-600 mb-1 text-sm font-medium">Senha</label>
                <input
                type="password"
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                required
                minLength={6}
                />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-[#0f2a4a] text-white font-bold py-3 rounded-lg transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Carregando...' : (isReset ? 'Enviar Email' : (isLogin ? 'Entrar' : 'Cadastrar'))}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm space-y-2">
            {!isReset && (
                <p>
                    {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary hover:underline font-bold"
                    >
                        {isLogin ? 'Registre-se' : 'Faça Login'}
                    </button>
                </p>
            )}
            
            {isReset ? (
                <button onClick={() => setIsReset(false)} className="text-gray-400 hover:text-primary">Voltar para Login</button>
            ) : (
                <button onClick={() => setIsReset(true)} className="text-xs text-gray-400 hover:text-primary">Esqueci minha senha</button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Auth;