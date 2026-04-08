import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Zap, Droplet } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
    else navigate('/dashboard');
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="page" style={{ backgroundColor: 'white' }}>
      {step > 1 && (
        <button className="btn-ghost" onClick={prevStep} style={{ position: 'absolute', top: '24px', left: '16px', border: 'none', background: 'transparent' }}>
          <ArrowLeft size={24} color="var(--text-main)" />
        </button>
      )}

      <div className="flex-1 flex col justify-center mt-4">
        {step === 1 && (
          <div className="animate-fade-in text-center flex-col items-center" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <div style={{ background: 'var(--accent-primary)', width: 80, height: 80, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-lg)' }}>
              <Zap color="white" size={40} />
            </div>
            <h1>NutriAI</h1>
            <p className="mt-4" style={{ fontSize: 18 }}>Controle sua alimentação com IA em segundos</p>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <h2 className="mb-6">Qual seu objetivo?</h2>
            <div className="flex-col gap-4">
              {['🔥 Emagrecer', '⚖️ Manter peso', '💪 Ganhar massa'].map((obj) => (
                <div key={obj} className="card flex items-center justify-between" onClick={nextStep} style={{ cursor: 'pointer' }}>
                  <span className="font-medium" style={{ fontSize: 18 }}>{obj}</span>
                  <ChevronRight color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up">
            <h2 className="mb-6">Seus dados físicos</h2>
            <div className="flex-col gap-4">
              <input type="number" placeholder="Peso atual (kg)" className="input-field" />
              <input type="number" placeholder="Altura (cm)" className="input-field" />
              <input type="number" placeholder="Idade" className="input-field" />
              <select className="input-field bg-white">
                <option value="">Selecione o sexo</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-slide-up">
            <h2 className="mb-6">Sua meta</h2>
            <div className="flex-col gap-4">
              <input type="number" placeholder="Peso desejado (kg)" className="input-field" />
              <label className="text-muted mt-4">Em quanto tempo?</label>
              <input type="range" min="1" max="24" className="w-full" style={{ accentColor: 'var(--accent-primary)' }} />
              <div className="flex justify-between text-muted" style={{ fontSize: 14 }}>
                <span>1 semana</span>
                <span>24 semanas</span>
              </div>
              <div className="card mt-4 text-center" style={{ background: 'var(--bg-primary)' }}>
                <p className="text-primary font-medium">Meta: perder 4kg em 8 semanas</p>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-slide-up">
            <h2 className="mb-6">Atividade física</h2>
            <div className="flex-col gap-4">
              {['🛋️ Sedentário', '🚶 Leve', '🏃 Moderado', '🏋️ Intenso'].map((obj) => (
                <div key={obj} className="card flex items-center justify-between" onClick={nextStep} style={{ cursor: 'pointer' }}>
                  <span className="font-medium">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="animate-fade-in text-center flex-col items-center justify-center">
            <div className="card w-full mt-8" style={{ border: '2px solid var(--accent-primary)', padding: '32px' }}>
              <h2 className="text-accent mb-4">Seu Plano Pronto</h2>
              
              <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                  <p className="text-muted text-sm">Calorias/dia</p>
                  <h1 className="text-primary">1.850</h1>
                </div>
                <Zap className="text-accent" size={32} />
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                  <p className="text-muted text-sm">Água recomendada</p>
                  <h1 className="text-primary" style={{ color: 'var(--accent-water)' }}>2.5L</h1>
                </div>
                <Droplet color="var(--accent-water)" size={32} />
              </div>

              <div className="flex-col gap-2 text-left">
                <p className="text-muted text-sm">Distribuição</p>
                <div className="flex w-full" style={{ height: 12, borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ background: 'var(--accent-protein)', width: '30%' }} />
                  <div style={{ background: 'var(--accent-carbs)', width: '40%' }} />
                  <div style={{ background: 'var(--accent-fat)', width: '30%' }} />
                </div>
                <div className="flex justify-between text-muted mt-1" style={{ fontSize: 12 }}>
                  <span>30% Prot</span>
                  <span>40% Carb</span>
                  <span>30% Gord</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        {(step === 1 || step === 3 || step === 4 || step === 6) && (
          <button className="btn btn-primary" onClick={nextStep}>
            {step === 1 ? 'Começar' : step === 6 ? 'Ir para o app' : 'Continuar'}
          </button>
        )}
        {step === 1 && (
          <button className="btn btn-ghost mt-4">Já tenho conta</button>
        )}
      </div>
    </div>
  );
}
