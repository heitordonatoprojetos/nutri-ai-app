import { useState } from 'react';
import { Target, TrendingDown, TrendingUp, Plus, X } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';

export default function Progress() {
  const { profile, weightHistory, addWeightEntry } = useUserData();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  const currentWeight = profile?.weight || 0;
  const targetWeight = profile?.targetWeight || 0;
  const startWeight = weightHistory.length > 0 ? weightHistory[0].weight : currentWeight;
  const lost = startWeight - currentWeight;
  const totalToLose = startWeight - targetWeight;
  const progressPct = totalToLose > 0 ? Math.max(0, Math.min((lost / totalToLose) * 100, 100)) : 0;

  // Last 6 weight entries for chart
  const recentWeights = weightHistory.slice(-6);
  const maxW = Math.max(...recentWeights.map(w => w.weight), currentWeight) + 1;
  const minW = Math.min(...recentWeights.map(w => w.weight), currentWeight) - 1;
  const range = maxW - minW || 1;

  const handleSaveWeight = async () => {
    const w = parseFloat(newWeight);
    if (!w || w < 20 || w > 300) return;
    await addWeightEntry(w);
    setNewWeight('');
    setShowWeightModal(false);
  };

  // Days remaining
  const weeksLeft = profile?.weeksDuration || 8;
  const daysLeft = weeksLeft * 7;

  return (
    <div className="page animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)', paddingBottom: 120 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 8 }}>
        <h2>Progresso</h2>
        <button onClick={() => setShowWeightModal(true)} style={{
          background: 'var(--accent-primary)', border: 'none', borderRadius: 50, padding: '8px 16px',
          color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Plus size={16} /> Peso
        </button>
      </div>

      {/* Weight cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: '20px 12px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>Peso Atual</p>
          <span style={{ fontWeight: 800, fontSize: 26, color: 'var(--text-main)' }}>
            {currentWeight}<span style={{ fontSize: 14 }}>kg</span>
          </span>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: '20px 12px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>Meta</p>
          <span style={{ fontWeight: 800, fontSize: 26, color: 'var(--accent-protein)' }}>
            {targetWeight}<span style={{ fontSize: 14 }}>kg</span>
          </span>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: '20px 12px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>
            {lost >= 0 ? 'Perdido' : 'Ganho'}
          </p>
          <span style={{ fontWeight: 800, fontSize: 26, color: lost >= 0 ? 'var(--accent-primary)' : 'var(--accent-protein)' }}>
            {Math.abs(lost).toFixed(1)}<span style={{ fontSize: 14 }}>kg</span>
          </span>
        </div>
      </div>

      {/* Goal Progress bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Progresso da Meta</h3>
          <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: 14 }}>{Math.round(progressPct)}%</span>
        </div>
        <div style={{ height: 12, borderRadius: 6, background: 'var(--bg-primary)', overflow: 'hidden', marginBottom: 8 }}>
          <div style={{
            height: '100%', borderRadius: 6,
            background: 'linear-gradient(90deg, var(--accent-primary), #FF8C42)',
            width: `${progressPct}%`,
            transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
          <span>{startWeight}kg (início)</span>
          <span>{targetWeight}kg (meta)</span>
        </div>
      </div>

      {/* Weight chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Histórico de Peso</h3>
          {lost !== 0 && (
            <span style={{ fontSize: 13, fontWeight: 700, color: lost > 0 ? 'var(--accent-primary)' : 'var(--accent-protein)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {lost > 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
              {lost > 0 ? '-' : '+'}{Math.abs(lost).toFixed(1)} kg
            </span>
          )}
        </div>

        {recentWeights.length < 2 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
            <p>Registre pelo menos 2 pesagens</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>para ver o gráfico de evolução.</p>
          </div>
        ) : (
          <>
            <div style={{ height: 140, position: 'relative', marginBottom: 8 }}>
              {[0, 25, 50, 75, 100].map(pos => (
                <div key={pos} style={{ position: 'absolute', top: `${pos}%`, width: '100%', borderTop: '1px dashed var(--border-color)' }} />
              ))}
              <svg viewBox={`0 0 ${(recentWeights.length - 1) * 20} 50`} preserveAspectRatio="none"
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                <polyline
                  points={recentWeights.map((w, i) => `${i * 20},${50 - ((w.weight - minW) / range) * 50}`).join(' ')}
                  fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                />
                {recentWeights.map((w, i) => (
                  <circle key={i}
                    cx={i * 20} cy={50 - ((w.weight - minW) / range) * 50}
                    r="3" fill="white" stroke="var(--accent-primary)" strokeWidth="2"
                  />
                ))}
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
              {recentWeights.map((w, i) => (
                <span key={i}>{w.date.slice(5)}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Projection */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(255,90,95,0.05) 100%)' }}>
        <div style={{ background: 'white', padding: 12, borderRadius: 50, boxShadow: 'var(--shadow-sm)' }}>
          <Target color="var(--accent-primary)" size={24} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 4px' }}>Previsão da Meta</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            Prazo do plano: <strong style={{ color: 'var(--text-main)' }}>{daysLeft} dias</strong>
            {' '}({profile?.weeksDuration || '?'} semanas)
          </p>
        </div>
      </div>

      {/* Weight modal */}
      {showWeightModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Registrar Peso</h3>
              <button onClick={() => setShowWeightModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={22} color="var(--text-muted)" />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <input
                type="number"
                step="0.1"
                placeholder={`${currentWeight}`}
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                autoFocus
                style={{
                  flex: 1, padding: '14px 16px', fontSize: 18, fontWeight: 700,
                  background: 'var(--bg-primary)', border: '2px solid var(--accent-primary)',
                  borderRadius: 14, color: 'var(--text-main)', outline: 'none', textAlign: 'center',
                }}
              />
              <span style={{ fontWeight: 600, fontSize: 18, color: 'var(--text-muted)' }}>kg</span>
            </div>
            <button onClick={handleSaveWeight} style={{
              width: '100%', padding: '14px', background: 'var(--accent-primary)', border: 'none',
              borderRadius: 14, color: 'white', fontWeight: 700, fontSize: 16, cursor: 'pointer',
            }}>
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
