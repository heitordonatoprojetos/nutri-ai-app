import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera as CameraIcon, X, Check, Search, Edit2 } from 'lucide-react';

export default function CameraFlow() {
  const [step, setStep] = useState<'camera' | 'processing' | 'result'>('camera');
  const navigate = useNavigate();

  const takePhoto = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('result');
    }, 2500);
  };

  return (
    <div className="page" style={{ padding: 0, backgroundColor: step === 'camera' ? '#000' : 'var(--bg-primary)' }}>
      
      {step === 'camera' && (
        <div className="flex-col h-full w-full relative animate-fade-in" style={{ backgroundColor: '#1A1D20', minHeight: '100vh' }}>
          {/* Header */}
          <div className="flex justify-between items-center p-6 text-white absolute top-0 w-full z-10">
            <button className="btn-ghost" onClick={() => navigate('/dashboard')} style={{ color: 'white', padding: 0 }}>
              <X size={28} />
            </button>
            <span className="font-semibold" style={{ color: 'white' }}>Registrar Refeição</span>
            <div style={{ width: 28 }} />
          </div>

          {/* Viewfinder Simulation */}
          <div className="flex-1 flex items-center justify-center relative">
            <div style={{ width: '80%', height: '50%', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 24, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -2, left: -2, width: 40, height: 40, borderTop: '4px solid white', borderLeft: '4px solid white', borderTopLeftRadius: 24 }} />
              <div style={{ position: 'absolute', top: -2, right: -2, width: 40, height: 40, borderTop: '4px solid white', borderRight: '4px solid white', borderTopRightRadius: 24 }} />
              <div style={{ position: 'absolute', bottom: -2, left: -2, width: 40, height: 40, borderBottom: '4px solid white', borderLeft: '4px solid white', borderBottomLeftRadius: 24 }} />
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 40, height: 40, borderBottom: '4px solid white', borderRight: '4px solid white', borderBottomRightRadius: 24 }} />
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center pb-12 w-full absolute bottom-0 z-10">
            <button onClick={takePhoto} style={{ 
              width: 80, height: 80, borderRadius: 40, backgroundColor: 'white', 
              border: '4px solid rgba(255,255,255,0.5)', backgroundClip: 'padding-box',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <CameraIcon size={32} color="#1A1D20" />
            </button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="flex-col items-center justify-center h-full w-full animate-fade-in" style={{ minHeight: '100vh' }}>
          <div style={{ width: 120, height: 120, borderRadius: 60, border: '4px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <h2 className="mt-8">Analisando seu prato...</h2>
          <p className="text-muted mt-2">Nossa IA está identificando os alimentos</p>
        </div>
      )}

      {step === 'result' && (
        <div className="flex-col h-full animate-slide-up" style={{ padding: '24px', minHeight: '100vh', paddingBottom: '100px' }}>
          <div className="flex justify-between items-center mb-6 pt-4">
            <h2 className="text-primary">Alimentos Detectados</h2>
            <button className="btn-ghost" style={{ padding: 8 }}><Edit2 size={20} color="var(--accent-primary)"/></button>
          </div>

          <div className="card mb-6 flex items-center bg-white p-4 gap-4" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
            <div className="flex-1">
              <span style={{ fontSize: 14 }}>Calorias Totais</span>
              <h1 style={{ color: 'white' }}>650 kcal</h1>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: 16 }}>
              <span className="font-bold">Almoço</span>
            </div>
          </div>

          <div className="flex-col gap-4 flex-1">
            {[
              { name: 'Arroz Branco', amount: '150g', kcal: 195 },
              { name: 'Feijão Carioca', amount: '100g', kcal: 76 },
              { name: 'Peito de Frango', amount: '120g', kcal: 198 },
              { name: 'Salada Mista', amount: 'Ad libitum', kcal: 45 },
            ].map(food => (
              <div key={food.name} className="card p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-primary">{food.name}</h3>
                  <p className="text-muted" style={{ fontSize: 13 }}>{food.amount}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-accent">{food.kcal}</span>
                  <span className="text-muted text-sm ml-1">kcal</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button className="btn-secondary mb-4 flex justify-center gap-2">
              <Search size={20} />
              Adicionar outro alimento
            </button>
            <button className="btn-primary w-full flex justify-center gap-2" onClick={() => navigate('/dashboard')}>
              <Check size={20} />
              Confirmar Refeição
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
