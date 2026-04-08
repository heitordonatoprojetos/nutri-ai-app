import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'signup';

export default function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, continueAsGuest, isFirebaseReady } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
      navigate('/onboarding');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Email ou senha incorretos.');
      } else if (msg.includes('email-already-in-use')) {
        setError('Este email já está cadastrado.');
      } else if (msg.includes('weak-password')) {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (msg.includes('não configurado') || msg.includes('not configured')) {
        setError('Firebase não configurado. Use o modo visitante.');
      } else {
        setError('Erro ao entrar. Tente novamente.');
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError('Não foi possível entrar com Google. Configure o Firebase.');
    }
    setLoading(false);
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate('/onboarding');
  };

  return (
    <div className="page" style={{
      background: 'linear-gradient(160deg, #1a0533 0%, #0f1a2e 50%, #0a1628 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '32px 24px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 24,
          background: 'linear-gradient(135deg, #FF5A5F, #FF8C42)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 32px rgba(255,90,95,0.4)',
        }}>
          <Zap color="white" size={36} />
        </div>
        <h1 style={{ color: 'white', fontSize: 32, marginBottom: 4 }}>NutriAI</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15 }}>
          {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta grátis'}
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        padding: 24,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* Google Sign In */}
        {isFirebaseReady && (
          <>
            <button
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: '100%', padding: '14px 20px',
                background: 'white', border: 'none', borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#333',
                marginBottom: 20,
                opacity: loading ? 0.7 : 1,
              }}
            >

              Entrar com Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>ou</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <User size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{
                  width: '100%', padding: '14px 14px 14px 44px',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 14, color: 'white', fontSize: 15, boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Mail size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '14px 14px 14px 44px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 14, color: 'white', fontSize: 15, boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ position: 'relative', marginBottom: error ? 12 : 20 }}>
            <Lock size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '14px 44px 14px 44px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 14, color: 'white', fontSize: 15, boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <button type="button" onClick={() => setShowPass(v => !v)} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(255,255,255,0.4)',
            }}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p style={{ color: '#FF7070', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              background: 'linear-gradient(135deg, #FF5A5F, #FF8C42)',
              border: 'none', borderRadius: 16, color: 'white',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 20px rgba(255,90,95,0.4)',
            }}
          >
            {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#FF5A5F', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
          >
            {mode === 'login' ? 'Criar agora' : 'Entrar'}
          </button>
        </p>
      </div>

      {/* Guest mode */}
      <button
        onClick={handleGuest}
        style={{
          width: '100%', marginTop: 16, padding: '14px',
          background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 16, color: 'rgba(255,255,255,0.6)', fontSize: 15,
          cursor: 'pointer',
        }}
      >
        Continuar sem conta (modo demo)
      </button>

      <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
        NutriAI v1.01 · Todos os dados ficam salvos localmente
      </p>
    </div>
  );
}
