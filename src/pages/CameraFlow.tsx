import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera as CameraIcon, X, Check, Search, Edit2, Loader2 } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import FoodSearchModal from '../components/FoodSearchModal';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface DetectedFood {
  name: string;
  amount: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  grams: number;
}

type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

function currentMealType(): MealType {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 18) return 'snack';
  return 'dinner';
}

export default function CameraFlow() {
  const [step, setStep] = useState<'camera' | 'processing' | 'result'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedFoods, setDetectedFoods] = useState<DetectedFood[]>([]);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const { addMealEntry } = useUserData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [usingCamera, setUsingCamera] = useState(false);
  const mealType = currentMealType();

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setStream(s);
      setUsingCamera(true);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      // Fallback to file picker
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setUsingCamera(false);
  };

  const captureFromVideo = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    stopCamera();
    analyzeImage(dataUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (dataUrl: string) => {
    setCapturedImage(dataUrl);
    setStep('processing');
    setError('');

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Demo mode — simulate AI detection
      setTimeout(() => {
        setDetectedFoods([
          { name: 'Arroz Branco Cozido', amount: '150g', kcal: 195, protein: 4, carbs: 42, fat: 0.5, grams: 150 },
          { name: 'Feijão Carioca Cozido', amount: '100g', kcal: 76, protein: 4.8, carbs: 14, fat: 0.5, grams: 100 },
          { name: 'Peito de Frango Grelhado', amount: '120g', kcal: 198, protein: 37, carbs: 0, fat: 4.3, grams: 120 },
          { name: 'Salada Mista com Legumes', amount: '80g', kcal: 20, protein: 1.2, carbs: 4, fat: 0.2, grams: 80 },
        ]);
        setStep('result');
      }, 2500);
      return;
    }

    try {
      const base64 = dataUrl.split(',')[1];
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64,
                }
              },
              {
                text: `Você é um nutricionista especializado. Analise esta foto de comida e identifique todos os alimentos visíveis.
Para cada alimento, estime a quantidade em gramas e os valores nutricionais.
Responda APENAS em JSON válido, sem texto adicional, no formato:
{
  "foods": [
    {
      "name": "Nome do alimento em português",
      "grams": 100,
      "kcal": 130,
      "protein": 2.7,
      "carbs": 28,
      "fat": 0.3
    }
  ]
}
Se não conseguir identificar nenhum alimento, retorne {"foods": []}.`
              }
            ]
          }]
        }),
      });

      const data = await resp.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{"foods":[]}';
      const cleanText = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      const foods: DetectedFood[] = (parsed.foods || []).map((f: any) => ({
        name: f.name,
        amount: `${f.grams}g`,
        kcal: Math.round(f.kcal),
        protein: parseFloat(f.protein.toFixed(1)),
        carbs: parseFloat(f.carbs.toFixed(1)),
        fat: parseFloat(f.fat.toFixed(1)),
        grams: f.grams,
      }));
      setDetectedFoods(foods);
      setStep('result');
    } catch (err) {
      setError('Não foi possível analisar a imagem. Tente novamente.');
      setStep('camera');
    }
  };

  const confirmMeal = async () => {
    for (const food of detectedFoods) {
      await addMealEntry({
        foodName: food.name,
        grams: food.grams,
        calories: food.kcal,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        mealType,
      });
    }
    navigate('/dashboard');
  };

  const totalKcal = detectedFoods.reduce((s, f) => s + f.kcal, 0);

  return (
    <div className="page" style={{ padding: 0, backgroundColor: step === 'camera' ? '#000' : 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* CAMERA STEP */}
      {step === 'camera' && (
        <div style={{ minHeight: '100vh', position: 'relative', background: '#1a1d20' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 20px', position: 'absolute', top: 0, width: '100%', zIndex: 10, boxSizing: 'border-box' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'white' }}>
              <X size={28} color="white" />
            </button>
            <span style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Registrar Refeição</span>
            <div style={{ width: 36 }} />
          </div>

          {/* Video / Viewfinder */}
          {usingCamera ? (
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100vh', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
              <div style={{ width: '75%', height: '50%', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 24, position: 'relative' }}>
                {[
                  { top: -2, left: -2, borderTop: '4px solid white', borderLeft: '4px solid white', borderTopLeftRadius: 24 },
                  { top: -2, right: -2, borderTop: '4px solid white', borderRight: '4px solid white', borderTopRightRadius: 24 },
                  { bottom: -2, left: -2, borderBottom: '4px solid white', borderLeft: '4px solid white', borderBottomLeftRadius: 24 },
                  { bottom: -2, right: -2, borderBottom: '4px solid white', borderRight: '4px solid white', borderBottomRightRadius: 24 },
                ].map((s, i) => (
                  <div key={i} style={{ position: 'absolute', width: 40, height: 40, ...s }} />
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, padding: '24px 0 48px', position: 'absolute', bottom: 0, width: '100%' }}>
            {/* Gallery */}
            <button onClick={() => fileInputRef.current?.click()} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 14, padding: '12px 16px', cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 600 }}>
              Galeria
            </button>

            {/* Shutter */}
            <button onClick={usingCamera ? captureFromVideo : startCamera} style={{
              width: 76, height: 76, borderRadius: 38, background: 'white',
              border: '4px solid rgba(255,255,255,0.4)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CameraIcon size={32} color="#1A1D20" />
            </button>

            <div style={{ width: 68 }} />
          </div>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

          {error && (
            <div style={{ position: 'absolute', bottom: 140, left: 20, right: 20, background: 'rgba(239,68,68,0.9)', borderRadius: 12, padding: 12, color: 'white', textAlign: 'center', fontSize: 14 }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* PROCESSING STEP */}
      {step === 'processing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, gap: 24 }}>
          {capturedImage && (
            <img src={capturedImage} alt="captured" style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }} />
          )}
          <Loader2 size={48} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ textAlign: 'center' }}>
            <h2>Analisando com IA...</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Identificando alimentos e calculando nutrição</p>
          </div>
        </div>
      )}

      {/* RESULT STEP */}
      {step === 'result' && (
        <div style={{ padding: 24, minHeight: '100vh', paddingBottom: 140 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 8 }}>
            <h2>Alimentos Detectados</h2>
            <button onClick={() => setStep('camera')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <Edit2 size={20} color="var(--accent-primary)" />
            </button>
          </div>

          {/* Summary card */}
          <div className="card" style={{ background: 'var(--accent-primary)', color: 'white', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ opacity: 0.85, fontSize: 13 }}>Total da refeição</p>
              <h1 style={{ color: 'white', fontSize: 32 }}>{totalKcal} kcal</h1>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px 16px', borderRadius: 14 }}>
              <span style={{ fontWeight: 700 }}>
                {mealType === 'breakfast' ? '☕ Café' : mealType === 'lunch' ? '🍛 Almoço' : mealType === 'dinner' ? '🌙 Jantar' : '🍌 Lanche'}
              </span>
            </div>
          </div>

          {detectedFoods.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 40 }}>🤔</p>
              <p style={{ marginTop: 12 }}>Nenhum alimento identificado.</p>
              <button onClick={() => setStep('camera')} style={{ marginTop: 16, background: 'var(--accent-primary)', border: 'none', borderRadius: 14, padding: '12px 24px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                Tentar novamente
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {detectedFoods.map((food, i) => (
                <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>{food.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {food.amount} · P:{food.protein}g · C:{food.carbs}g · G:{food.fat}g
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: 16 }}>{food.kcal}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> kcal</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => setShowAddModal(true)} style={{
              width: '100%', padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              borderRadius: 16, fontWeight: 600, fontSize: 15, cursor: 'pointer', color: 'var(--text-main)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <Search size={18} /> Adicionar outro alimento
            </button>
            <button onClick={confirmMeal} disabled={detectedFoods.length === 0} style={{
              width: '100%', padding: '14px', background: 'var(--accent-primary)', border: 'none',
              borderRadius: 16, color: 'white', fontWeight: 700, fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: detectedFoods.length === 0 ? 0.6 : 1,
            }}>
              <Check size={20} /> Confirmar Refeição
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <FoodSearchModal
          mealType={mealType}
          mealLabel="esta refeição"
          onAdd={async entry => {
            setDetectedFoods(prev => [...prev, {
              name: entry.foodName,
              amount: `${entry.grams}g`,
              kcal: entry.calories,
              protein: entry.protein,
              carbs: entry.carbs,
              fat: entry.fat,
              grams: entry.grams,
            }]);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
