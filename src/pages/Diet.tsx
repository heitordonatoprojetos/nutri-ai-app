import { useState } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import FoodSearchModal from '../components/FoodSearchModal';
import type { MealEntry } from '../contexts/UserDataContext';

type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

const MEAL_CONFIG: { type: MealType; label: string; icon: string; time: string }[] = [
  { type: 'breakfast', label: 'Café da Manhã', icon: '🍳', time: '08:00' },
  { type: 'lunch', label: 'Almoço', icon: '🍛', time: '12:00' },
  { type: 'snack', label: 'Lanches', icon: '🍌', time: '15:00' },
  { type: 'dinner', label: 'Jantar', icon: '🌙', time: '19:00' },
];

export default function Diet() {
  const { profile, todayData, addMealEntry, removeMealEntry } = useUserData();
  const [modalMeal, setModalMeal] = useState<{ type: MealType; label: string } | null>(null);

  const goalKcal = profile?.dailyCalories || 1850;
  const totalKcal = todayData.meals.reduce((s, m) => s + m.calories, 0);

  const mealEntries = (type: MealType) => todayData.meals.filter(m => m.mealType === type);
  const mealKcal = (type: MealType) => mealEntries(type).reduce((s, m) => s + m.calories, 0);

  const handleAdd = async (entry: Omit<MealEntry, 'id' | 'timestamp'>) => {
    await addMealEntry(entry);
  };

  return (
    <div className="page animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 8 }}>
        <h2>Plano Alimentar</h2>
        <div className="card" style={{ borderRadius: 50, padding: '8px 16px' }}>
          <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: 14 }}>
            {totalKcal} / {goalKcal} kcal
          </span>
        </div>
      </div>

      {/* Daily progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ height: 8, borderRadius: 4, background: 'var(--border-color)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            background: totalKcal > goalKcal
              ? '#ef4444'
              : 'linear-gradient(90deg, var(--accent-primary), #FF8C42)',
            width: `${Math.min(totalKcal / goalKcal * 100, 100)}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6, textAlign: 'center' }}>
          {goalKcal - totalKcal > 0
            ? `Faltam ${goalKcal - totalKcal} kcal para atingir sua meta`
            : `Meta diária atingida! 🎉`}
        </p>
      </div>

      {/* Meal cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MEAL_CONFIG.map(meal => {
          const entries = mealEntries(meal.type);
          const kcal = mealKcal(meal.type);
          return (
            <div key={meal.type} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Meal header */}
              <div style={{
                padding: '14px 16px', background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{meal.icon}</span>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{meal.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Clock size={12} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{meal.time}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {kcal > 0 && (
                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: 15, display: 'block' }}>{kcal} kcal</span>
                  )}
                </div>
              </div>

              {/* Food list */}
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {entries.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>
                    Nenhum alimento registrado
                  </p>
                ) : entries.map(entry => (
                  <div key={entry.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: 10, borderBottom: '1px solid var(--border-color)',
                  }}>
                    <div>
                      <span style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: 14 }}>{entry.foodName}</span>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                        {entry.grams}g · P:{entry.protein}g · C:{entry.carbs}g · G:{entry.fat}g
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: 13 }}>{entry.calories}kcal</span>
                      <button onClick={() => removeMealEntry(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <Trash2 size={15} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add button */}
                <button onClick={() => setModalMeal({ type: meal.type, label: meal.label })} style={{
                  width: '100%', padding: '10px', marginTop: 4,
                  background: 'rgba(255,90,95,0.07)', border: '1px dashed rgba(255,90,95,0.4)',
                  borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <Plus size={16} /> Adicionar alimento
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modalMeal && (
        <FoodSearchModal
          mealType={modalMeal.type}
          mealLabel={modalMeal.label}
          onAdd={handleAdd}
          onClose={() => setModalMeal(null)}
        />
      )}
    </div>
  );
}
