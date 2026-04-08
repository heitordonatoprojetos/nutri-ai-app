import { useState } from 'react';
import { Plus, Droplet } from 'lucide-react';

export default function Dashboard() {
  const [water, setWater] = useState(1200);
  const waterGoal = 2500;
  const waterPercentage = Math.min((water / waterGoal) * 100, 100);

  const addWater = (amount: number) => {
    setWater(prev => Math.min(prev + amount, waterGoal));
  };

  return (
    <div className="page animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)', paddingBottom: '120px' }}>
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6 pt-4">
        <div>
          <p className="text-muted text-sm">Bom dia,</p>
          <h2 className="text-primary">Heitor</h2>
        </div>
        <div className="card text-center py-2 px-4" style={{ borderRadius: 'var(--radius-full)' }}>
          <span className="font-semibold" style={{ fontSize: 14 }}>Hoje, 7 Abr</span>
        </div>
      </div>

      {/* Calories Card */}
      <div className="card mb-6 flex-col items-center relative overflow-hidden" style={{ minHeight: '220px' }}>
        <h3 className="mb-4 text-center w-full">Resumo Diário</h3>
        
        <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg className="w-full h-full" viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Background Ring */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-primary)" strokeWidth="10" />
            {/* Progress Ring */}
            <circle 
              className="progress-ring__circle"
              cx="50" cy="50" r="45" fill="none" 
              stroke="var(--accent-primary)" strokeWidth="10" 
              strokeDasharray="283" 
              strokeDashoffset="100" 
              style={{ strokeLinecap: 'round' }}
            />
          </svg>
          <div className="flex-col items-center justify-center relative z-10 text-center">
            <span className="text-primary font-bold" style={{ fontSize: 24 }}>1.250</span>
            <span className="text-muted" style={{ fontSize: 12 }}>/ 2.000 kcal</span>
          </div>
        </div>

        {/* Macros */}
        <div className="flex justify-between w-full mt-6 gap-4">
          {[
            { label: 'Prot', value: '80g', color: 'var(--accent-protein)', percent: '70%' },
            { label: 'Carb', value: '120g', color: 'var(--accent-carbs)', percent: '50%' },
            { label: 'Gord', value: '45g', color: 'var(--accent-fat)', percent: '80%' }
          ].map(macro => (
            <div key={macro.label} className="flex-col items-center flex-1">
              <span className="font-semibold text-sm">{macro.value}</span>
              <span className="text-muted mb-2" style={{ fontSize: 10 }}>{macro.label}</span>
              <div className="w-full bg-primary" style={{ height: 6, borderRadius: 3, background: 'var(--bg-primary)' }}>
                <div style={{ background: macro.color, width: macro.percent, height: '100%', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Water Card */}
      <div className="card mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div style={{ width: 48, height: 64, border: '3px solid var(--accent-water)', borderRadius: '12px 12px 6px 6px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ 
              position: 'absolute', bottom: 0, left: 0, right: 0, 
              height: `${waterPercentage}%`, 
              background: 'var(--accent-water)', 
              transition: 'height 0.5s cubic-bezier(0.16, 1, 0.3, 1)' 
            }} />
          </div>
          <div className="flex-col">
            <h3 className="flex items-center gap-1">Água <Droplet size={18} color="var(--accent-water)" fill="var(--accent-water)" /></h3>
            <p className="text-sm"><span className="font-semibold text-primary">{water}ml</span> / {waterGoal}ml</p>
          </div>
        </div>
        
        <div className="flex-col gap-2">
          <button className="btn-secondary" style={{ padding: '8px 12px', fontSize: 12, borderRadius: 16 }} onClick={() => addWater(200)}>
            +200ml
          </button>
        </div>
      </div>

      {/* Meals */}
      <div>
        <h3 className="mb-4">Refeições do dia</h3>
        <div className="flex-col gap-4">
          {[
            { name: 'Café da manhã', kcal: 450, icon: '🍳' },
            { name: 'Almoço', kcal: 800, icon: '🍛' },
            { name: 'Lanches', kcal: 0, icon: '🍌' },
            { name: 'Jantar', kcal: 0, icon: '🌙' },
          ].map(meal => (
            <div key={meal.name} className="card flex items-center justify-between" style={{ padding: '16px' }}>
              <div className="flex items-center gap-4">
                <span style={{ fontSize: 24 }}>{meal.icon}</span>
                <div className="flex-col">
                  <span className="font-semibold">{meal.name}</span>
                  <span className="text-muted text-sm">{meal.kcal > 0 ? `${meal.kcal} kcal` : 'Recomendado: 400 kcal'}</span>
                </div>
              </div>
              <button className="btn-ghost" style={{ padding: 8 }}>
                <Plus size={24} color="var(--accent-primary)" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
