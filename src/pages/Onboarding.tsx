import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Zap, Droplet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'intense'] as const;
const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: '🛋️ Sedentário',
  light: '🚶 Leve',
  moderate: '🏃 Moderado',
  intense: '🏋️ Intenso',
};

function calcDailyCalories(weight: number, height: number, age: number, sex: 'M' | 'F', activity: string, goal: string): number {
  const bmr = sex === 'M'
    ? 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age
    : 447.6 + 9.2 * weight + 3.1 * height - 4.3 * age;
  const actMult = { sedentary: 1.2, light: 1.375, moderate: 1.55, intense: 1.725 }[activity] || 1.375;
  const tdee = bmr * actMult;
  if (goal === 'lose') return Math.round(tdee - 400);
  if (goal === 'gain') return Math.round(tdee + 300);
  return Math.round(tdee);
}

function calcWater(weight: number): number {
  return Math.round(weight * 35 / 100) * 100; // ml, rounded to 100
}

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveProfile } = useUserData();

  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('lose');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [targetWeight, setTargetWeight] = useState('');
  const [weeks, setWeeks] = useState(8);
  const [activity, setActivity] = useState<typeof ACTIVITY_LEVELS[number]>('moderate');

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = async () => {
    const w = Number(weight) || 75;
    const h = Number(height) || 170;
    const a = Number(age) || 25;
    const tw = Number(targetWeight) || w - 5;
    const kcal = calcDailyCalories(w, h, a, sex, activity, goal);
    const waterMl = calcWater(w);

    await saveProfile({
      name: user?.displayName || 'Usuário',
      weight: w,
      height: h,
      age: a,
      sex,
      goal,
      targetWeight: tw,
      weeksDuration: weeks,
      activityLevel: activity,
      dailyCalories: kcal,
      dailyWaterMl: waterMl,
    });
    navigate('/dashboard');
  };

  const weekLabel = `${weeks} semana${weeks > 1 ? 's' : ''}`;
  const weightLoss = weight && targetWeight ? Math.abs(Number(weight) - Number(targetWeight)).toFixed(1) : '?';
  const dailyCaloriesPreview = weight && height && age
    ? calcDailyCalories(Number(weight), Number(height), Number(age), sex, activity, goal)
    : 1850;
  const waterPreview = weight ? calcWater(Number(weight)) : 2500;

  return (
    <div className="page" style={{ backgroundColor: 'var(--bg-secondary)', paddingBottom: 120 }}>
      {step > 1 && (
        <button onClick={() => setStep(s => s - 1)} style={{
          position: 'absolute', top: 24, left: 16,
          background: 'none', border: 'none', cursor: 'pointer', padding: 8,
        }}>
          <ArrowLeft size={24} color="var(--text-main)" />
        </button>
      )}

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 16, marginBottom: 32 }}>
        {[1, 2, 3, 4, 5, 6].map(s => (
          <div key={s} style={{
            width: s === step ? 24 : 8, height: 8, borderRadius: 4,
            background: s <= step ? 'var(--accent-primary)' : 'var(--border-color)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Step 1 – Welcome */}
        {step === 1 && (
          <div className="animate-fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto 0' }}>
            <div style={{
              background: 'var(--accent-primary)', width: 80, height: 80, borderRadius: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', boxShadow: 'var(--shadow-lg)',
            }}>
              <Zap color="white" size={40} />
            </div>
            <h1 style={{ marginBottom: 8 }}>NutriAI</h1>
            <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.5 }}>
              Controle sua alimentação com inteligência artificial
            </p>
          </div>
        )}

        {/* Step 2 – Goal */}
        {step === 2 && (
          <div className="animate-slide-up">
            <h2 style={{ marginBottom: 8 }}>Qual seu objetivo?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Isso vai personalizar seu plano alimentar.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { val: 'lose' as const, label: '🔥 Emagrecer' },
                { val: 'maintain' as const, label: '⚖️ Manter peso' },
                { val: 'gain' as const, label: '💪 Ganhar massa' },
              ].map(opt => (
                <div key={opt.val} onClick={() => { setGoal(opt.val); nextStep(); }}
                  className="card" style={{
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    border: goal === opt.val ? '2px solid var(--accent-primary)' : undefined,
                    padding: '18px 16px',
                  }}>
                  <span style={{ fontSize: 17, fontWeight: 600 }}>{opt.label}</span>
                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 – Physical data */}
        {step === 3 && (
          <div className="animate-slide-up">
            <h2 style={{ marginBottom: 8 }}>Seus dados físicos</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Para calcular suas necessidades calóricas.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6, display: 'block' }}>Peso atual (kg)</label>
                <input type="number" placeholder="Ex: 75" value={weight} onChange={e => setWeight(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6, display: 'block' }}>Altura (cm)</label>
                <input type="number" placeholder="Ex: 175" value={height} onChange={e => setHeight(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6, display: 'block' }}>Idade</label>
                <input type="number" placeholder="Ex: 25" value={age} onChange={e => setAge(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6, display: 'block' }}>Sexo</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[{ val: 'M' as const, label: 'Masculino' }, { val: 'F' as const, label: 'Feminino' }].map(s => (
                    <button key={s.val} onClick={() => setSex(s.val)} style={{
                      flex: 1, padding: '12px', borderRadius: 14, cursor: 'pointer', fontWeight: 600,
                      background: sex === s.val ? 'var(--accent-primary)' : 'var(--bg-primary)',
                      color: sex === s.val ? 'white' : 'var(--text-muted)',
                      border: `2px solid ${sex === s.val ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    }}>{s.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 – Target */}
        {step === 4 && (
          <div className="animate-slide-up">
            <h2 style={{ marginBottom: 8 }}>Sua meta</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Defina onde quer chegar.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6, display: 'block' }}>Peso desejado (kg)</label>
                <input type="number" placeholder="Ex: 70" value={targetWeight} onChange={e => setTargetWeight(e.target.value)} className="input-field" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: 13 }}>Em quanto tempo?</label>
                  <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: 15 }}>{weekLabel}</span>
                </div>
                <input
                  type="range" min={1} max={24} value={weeks}
                  onChange={e => setWeeks(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                  <span>1 semana</span>
                  <span>12 semanas</span>
                  <span>24 semanas</span>
                </div>
              </div>
              {targetWeight && weight && (
                <div className="card" style={{ background: 'rgba(255,90,95,0.08)', border: '1px solid rgba(255,90,95,0.3)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: 15 }}>
                    Meta: {goal === 'lose' ? 'perder' : goal === 'gain' ? 'ganhar' : 'manter'} {weightLoss}kg em {weekLabel}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5 – Activity */}
        {step === 5 && (
          <div className="animate-slide-up">
            <h2 style={{ marginBottom: 8 }}>Nível de atividade</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Com qual frequência você se exercita?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ACTIVITY_LEVELS.map(level => (
                <div key={level} onClick={() => { setActivity(level); nextStep(); }}
                  className="card" style={{
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 16px',
                    border: activity === level ? '2px solid var(--accent-primary)' : undefined,
                  }}>
                  <span style={{ fontSize: 17, fontWeight: 600 }}>{ACTIVITY_LABELS[level]}</span>
                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6 – Summary plan */}
        {step === 6 && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'var(--accent-primary)', marginBottom: 4 }}>🎉 Seu Plano Pronto!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Calculado especialmente para você.</p>
            <div className="card" style={{ border: '2px solid var(--accent-primary)', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Calorias/dia</p>
                  <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-main)' }}>{dailyCaloriesPreview.toLocaleString('pt-BR')}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}> kcal</span>
                </div>
                <Zap size={32} color="var(--accent-primary)" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Água recomendada</p>
                  <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-water)' }}>{(waterPreview / 1000).toFixed(1)}L</span>
                </div>
                <Droplet size={32} color="var(--accent-water)" fill="var(--accent-water)" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>Distribuição de macros</p>
                <div style={{ display: 'flex', width: '100%', height: 12, borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ background: 'var(--accent-protein)', width: '30%' }} />
                  <div style={{ background: 'var(--accent-carbs)', width: '40%' }} />
                  <div style={{ background: 'var(--accent-fat)', width: '30%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>30% Proteína</span>
                  <span>40% Carb</span>
                  <span>30% Gordura</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{ marginTop: 32 }}>
        {(step === 1 || step === 3 || step === 4 || step === 6) && (
          <button className="btn btn-primary" onClick={nextStep} style={{ width: '100%' }}>
            {step === 1 ? 'Começar' : step === 6 ? 'Ir para o app 🚀' : 'Continuar'}
          </button>
        )}
        {step === 1 && (
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: 12 }}>Já tenho conta</button>
        )}
      </div>
    </div>
  );
}
