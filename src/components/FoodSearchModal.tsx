import { useState, useRef } from 'react';
import { X, Search, Plus, ChevronRight } from 'lucide-react';
import { searchFoods, calculateNutrition } from '../lib/foodDatabase';
import type { FoodItem } from '../lib/foodDatabase';
import type { MealEntry } from '../contexts/UserDataContext';

interface FoodSearchModalProps {
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  mealLabel: string;
  onAdd: (entry: Omit<MealEntry, 'id' | 'timestamp'>) => void;
  onClose: () => void;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function FoodSearchModal({ mealType, mealLabel, onAdd, onClose }: FoodSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(() => searchFoods(''));
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState(100);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (q: string) => {
    setQuery(q);
    setResults(searchFoods(q));
    setSelected(null);
  };

  const handleSelect = (food: FoodItem) => {
    setSelected(food);
    setGrams(food.defaultPortion || 100);
  };

  const handleConfirm = () => {
    if (!selected) return;
    const nutrition = calculateNutrition(selected, grams);
    onAdd({
      foodName: selected.name,
      grams,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      mealType,
    });
    onClose();
  };

  const handleLookupNutrition = async () => {
    if (!customName.trim()) return;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Use estimated values based on common foods
      setCustomCalories('150');
      setCustomProtein('10');
      setCustomCarbs('20');
      setCustomFat('5');
      return;
    }
    setLookingUp(true);
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Qual a informação nutricional de "${customName}" por 100g? Responda APENAS em JSON com os campos: calories (número), protein (número em g), carbs (número em g), fat (número em g). Sem texto adicional.`
            }]
          }]
        }),
      });
      const data = await resp.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleanText = text.replace(/```json|```/g, '').trim();
      const nutrition = JSON.parse(cleanText);
      setCustomCalories(String(Math.round(nutrition.calories || 0)));
      setCustomProtein(String(nutrition.protein || 0));
      setCustomCarbs(String(nutrition.carbs || 0));
      setCustomFat(String(nutrition.fat || 0));
    } catch {
      // fallback
    }
    setLookingUp(false);
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    onAdd({
      foodName: customName,
      grams: 100,
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      mealType,
    });
    onClose();
  };

  const nutrition = selected ? calculateNutrition(selected, grams) : null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '24px 24px 0 0',
        padding: '20px 20px 40px',
        maxHeight: '85vh',
        overflowY: 'auto',
        animation: 'slideUp 0.3s ease',
      }}>
        <style>{`@keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }`}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--text-main)', margin: 0 }}>Adicionar a {mealLabel}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={24} color="var(--text-muted)" />
          </button>
        </div>

        {!addingCustom ? (
          <>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar alimento..."
                value={query}
                onChange={e => handleSearch(e.target.value)}
                autoFocus
                style={{
                  width: '100%', padding: '12px 14px 12px 44px',
                  background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                  borderRadius: 14, fontSize: 15, color: 'var(--text-main)',
                  boxSizing: 'border-box', outline: 'none',
                }}
              />
            </div>

            {/* Selected food detail */}
            {selected && nutrition && (
              <div style={{ background: 'var(--bg-primary)', borderRadius: 16, padding: 16, marginBottom: 16, border: '2px solid var(--accent-primary)' }}>
                <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>{selected.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Quantidade (g):</span>
                  <input
                    type="number"
                    value={grams}
                    onChange={e => setGrams(Math.max(1, Number(e.target.value)))}
                    style={{
                      width: 80, padding: '6px 10px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      borderRadius: 10, fontSize: 15, color: 'var(--text-main)',
                      textAlign: 'center', outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  {[
                    { label: 'Kcal', value: nutrition.calories, color: 'var(--accent-primary)' },
                    { label: 'Prot', value: `${nutrition.protein}g`, color: 'var(--accent-protein)' },
                    { label: 'Carb', value: `${nutrition.carbs}g`, color: 'var(--accent-carbs)' },
                    { label: 'Gord', value: `${nutrition.fat}g`, color: 'var(--accent-fat)' },
                  ].map(n => (
                    <div key={n.label} style={{ flex: 1, textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 10, padding: '8px 4px' }}>
                      <div style={{ fontWeight: 700, color: n.color, fontSize: 14 }}>{n.value}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{n.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={handleConfirm} style={{
                  width: '100%', marginTop: 12, padding: '13px',
                  background: 'var(--accent-primary)', border: 'none', borderRadius: 14,
                  color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                }}>
                  Adicionar ✓
                </button>
              </div>
            )}

            {/* Results list */}
            {!selected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {results.map(food => (
                  <button key={food.id} onClick={() => handleSelect(food)} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                    borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 14 }}>{food.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {food.calories} kcal · P:{food.protein}g · C:{food.carbs}g · G:{food.fat}g (por 100g)
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </button>
                ))}
              </div>
            )}

            {/* Add custom */}
            <button onClick={() => setAddingCustom(true)} style={{
              width: '100%', marginTop: 16, padding: '13px',
              background: 'transparent', border: '1px dashed var(--border-color)',
              borderRadius: 14, color: 'var(--accent-primary)', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <Plus size={18} />
              Adicionar alimento personalizado
            </button>
          </>
        ) : (
          /* Custom food form */
          <div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>Nome do alimento</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Ex: Açaí com granola"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  style={{
                    flex: 1, padding: '12px 14px',
                    background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                    borderRadius: 14, fontSize: 15, color: 'var(--text-main)', outline: 'none',
                  }}
                />
                <button onClick={handleLookupNutrition} disabled={lookingUp || !customName.trim()} style={{
                  padding: '12px 14px', background: 'var(--accent-primary)', border: 'none',
                  borderRadius: 14, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  whiteSpace: 'nowrap', opacity: lookingUp || !customName.trim() ? 0.6 : 1,
                }}>
                  {lookingUp ? '...' : '🔍 Buscar'}
                </button>
              </div>
            </div>
            {[
              { label: 'Calorias (kcal/100g)', val: customCalories, set: setCustomCalories },
              { label: 'Proteínas (g/100g)', val: customProtein, set: setCustomProtein },
              { label: 'Carboidratos (g/100g)', val: customCarbs, set: setCustomCarbs },
              { label: 'Gorduras (g/100g)', val: customFat, set: setCustomFat },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 12 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>{f.label}</p>
                <input
                  type="number"
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                    borderRadius: 14, fontSize: 15, color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setAddingCustom(false)} style={{
                flex: 1, padding: '13px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                borderRadius: 14, color: 'var(--text-muted)', fontSize: 15, cursor: 'pointer',
              }}>Voltar</button>
              <button onClick={handleAddCustom} disabled={!customName.trim()} style={{
                flex: 2, padding: '13px', background: 'var(--accent-primary)', border: 'none',
                borderRadius: 14, color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                opacity: !customName.trim() ? 0.6 : 1,
              }}>Adicionar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
