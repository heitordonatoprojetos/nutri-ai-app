import { useState } from 'react';
import { Plus, Droplets, Minus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import FoodSearchModal from '../components/FoodSearchModal';
import type { MealEntry } from '../contexts/UserDataContext';

type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

const MEALS: { type: MealType; label: string; icon: string; defaultKcal: number }[] = [
  { type: 'breakfast', label: 'Café da manhã', icon: '🍳', defaultKcal: 400 },
  { type: 'lunch', label: 'Almoço', icon: '🍛', defaultKcal: 600 },
  { type: 'snack', label: 'Lanches', icon: '🍌', defaultKcal: 200 },
  { type: 'dinner', label: 'Jantar', icon: '🌙', defaultKcal: 450 },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function todayLabel() {
  return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, todayData, setWater, addMealEntry, removeMealEntry } = useUserData();
  const navigate = useNavigate();

  const [modalMeal, setModalMeal] = useState<{ type: MealType; label: string } | null>(null);

  const waterMl = todayData.waterMl;
  const waterGoal = profile?.dailyWaterMl || 2500;
  const waterPct = Math.min((waterMl / waterGoal) * 100, 100);

  const handleWater = async (delta: number) => {
    await setWater(Math.max(0, waterMl + delta));
  };

  const handleAddMeal = async (entry: Omit<MealEntry, 'id' | 'timestamp'>) => {
    await addMealEntry(entry);
  };

  const mealEntries = (type: MealType) => todayData.meals.filter(m => m.mealType === type);
  const mealKcal = (type: MealType) => mealEntries(type).reduce((s, m) => s + m.calories, 0);

  const totalKcal = todayData.meals.reduce((s, m) => s + m.calories, 0);
  const goalKcal = profile?.dailyCalories || 2000;
  const totalProt = todayData.meals.reduce((s, m) => s + m.protein, 0);
  const totalCarb = todayData.meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = todayData.meals.reduce((s, m) => s + m.fat, 0);

  const ringOffset = 283 - (Math.min(totalKcal / goalKcal, 1) * 283);
  const firstName = (user?.displayName || profile?.name || 'Usuário').split(' ')[0];

  return (
    <div className="page animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingTop: 8 }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{greeting()},</p>
          <h2 style={{ color: 'var(--text-main)', fontSize: 22 }}>{firstName} 👋</h2>
        </div>
        <div className="card" style={{ borderRadius: 50, padding: '8px 16px' }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Hoje, {todayLabel()}</span>
        </div>
      </div>

      {/* Calorie Ring Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Resumo Diário</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-primary)" strokeWidth="10" />
              <circle cx="50" cy="50" r="45" fill="none"
                stroke="var(--accent-primary)" strokeWidth="10"
                strokeDasharray="283" strokeDashoffset={ringOffset}
                style={{ strokeLinecap: 'round', transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--text-main)' }}>{totalKcal.toLocaleString('pt-BR')}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>/ {goalKcal.toLocaleString('pt-BR')} kcal</span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Proteína', value: totalProt, unit: 'g', color: 'var(--accent-protein)', goal: Math.round(goalKcal * 0.3 / 4) },
              { label: 'Carboidrato', value: totalCarb, unit: 'g', color: 'var(--accent-carbs)', goal: Math.round(goalKcal * 0.4 / 4) },
              { label: 'Gordura', value: totalFat, unit: 'g', color: 'var(--accent-fat)', goal: Math.round(goalKcal * 0.3 / 9) },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                  <span style={{ fontWeight: 600 }}>{Math.round(m.value)}{m.unit}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-primary)' }}>
                  <div style={{
                    height: '100%', borderRadius: 3, background: m.color,
                    width: `${Math.min(m.value / m.goal * 100, 100)}%`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Water Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplets size={20} color="var(--accent-water)" fill="var(--accent-water)" />
            <h3 style={{ margin: 0 }}>Água</h3>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>
            <span style={{ color: 'var(--accent-water)' }}>{waterMl}ml</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}> / {waterGoal}ml</span>
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 12, borderRadius: 6, background: 'var(--bg-primary)', marginBottom: 14, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 6,
            background: 'linear-gradient(90deg, var(--accent-water), #4FC3F7)',
            width: `${waterPct}%`,
            transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {[-200, -100].map(delta => (
            <button key={delta} onClick={() => handleWater(delta)}
              style={{
                flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
              <Minus size={14} /> {Math.abs(delta)}ml
            </button>
          ))}
          {[200, 500].map(delta => (
            <button key={delta} onClick={() => handleWater(delta)}
              style={{
                flex: 1, padding: '10px', background: 'rgba(41,182,246,0.1)', border: '1px solid rgba(41,182,246,0.3)',
                borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--accent-water)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
              <Plus size={14} /> {delta}ml
            </button>
          ))}
        </div>
      </div>

      {/* Meals */}
      <h3 style={{ marginBottom: 12 }}>Refeições do dia</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MEALS.map(meal => {
          const entries = mealEntries(meal.type);
          const kcal = mealKcal(meal.type);
          return (
            <div key={meal.type} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{meal.icon}</span>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{meal.label}</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                      {kcal > 0 ? `${kcal} kcal` : `Rec: ${meal.defaultKcal} kcal`}
                    </p>
                  </div>
                </div>
                <button onClick={() => setModalMeal({ type: meal.type, label: meal.label })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                  <Plus size={24} color="var(--accent-primary)" />
                </button>
              </div>

              {entries.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {entries.map(entry => (
                    <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>{entry.foodName}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>{entry.grams}g</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: 13 }}>{entry.calories} kcal</span>
                        <button onClick={() => removeMealEntry(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                          <Trash2 size={14} color="var(--text-muted)" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Camera FAB hint */}
      <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 13 }}>
        <button onClick={() => navigate('/camera')} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 600, fontSize: 14,
        }}>
          📷 Foto para identificar alimento com IA
        </button>
      </div>

      {/* Food modal */}
      {modalMeal && (
        <FoodSearchModal
          mealType={modalMeal.type}
          mealLabel={modalMeal.label}
          onAdd={handleAddMeal}
          onClose={() => setModalMeal(null)}
        />
      )}
    </div>
  );
}
