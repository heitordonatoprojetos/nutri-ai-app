import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'signup';

// Official Google 'G' SVG logo
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Email ou senha incorretos.');
      } else if (msg.includes('email-already-in-use')) {
        setError('Este email já está cadastrado.');
      } else {
        setError('Erro ao entrar. Verifique os dados.');
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError('Problema ao conectar com o Google local.');
    }
    setGoogleLoading(false);
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate('/onboarding');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 14px 14px 44px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 14,
    color: 'white',
    fontSize: 15,
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
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
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
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

        {/* ─── Google Sign-In Button ─── */}
        <button
          id="btn-google-signin"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: googleLoading ? 'rgba(255,255,255,0.85)' : 'white',
            border: 'none',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            cursor: googleLoading ? 'wait' : 'pointer',
            fontSize: 15,
            fontWeight: 600,
            color: '#333',
            marginBottom: 20,
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            transform: 'scale(1)',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {googleLoading ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#4285F4" strokeWidth="3" strokeLinecap="round"
                strokeDasharray="28 56"
                style={{ transformOrigin: 'center', animation: 'spin 1s linear infinite' }} />
            </svg>
          ) : (
            <GoogleLogo />
          )}
          {googleLoading ? 'Entrando...' : 'Continuar com Google'}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>ou entre com email</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* ─── Email / Password Form ─── */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <User size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="input-name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Mail size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              id="input-email"
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ position: 'relative', marginBottom: error ? 12 : 20 }}>
            <Lock size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              id="input-password"
              type={showPass ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ ...inputStyle, paddingLeft: 44, paddingRight: 44 }}
            />
            <button type="button" onClick={() => setShowPass(v => !v)} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(255,255,255,0.4)',
            }}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 16,
            }}>
              <p style={{ color: '#FF7070', fontSize: 13, textAlign: 'center', margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            id="btn-email-submit"
            type="submit"
            disabled={loading || googleLoading}
            style={{
              width: '100%', padding: '15px',
              background: 'linear-gradient(135deg, #FF5A5F, #FF8C42)',
              border: 'none', borderRadius: 16, color: 'white',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              opacity: (loading || googleLoading) ? 0.7 : 1,
              boxShadow: '0 4px 20px rgba(255,90,95,0.4)',
              transition: 'opacity 0.2s',
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
        id="btn-guest"
        onClick={handleGuest}
        style={{
          width: '100%', marginTop: 16, padding: '14px',
          background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 16, color: 'rgba(255,255,255,0.6)', fontSize: 15,
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
      >
        Continuar sem conta (modo demo)
      </button>

      <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
        NutriAI v1.01 · Seus dados ficam protegidos
      </p>
    </div>
  );
}
