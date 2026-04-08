import { Clock, RefreshCw, Plus } from 'lucide-react';

export default function Diet() {
  return (
    <div className="page animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex justify-between items-center mb-6 pt-4">
        <h2>Plano Alimentar</h2>
        <div className="card text-center py-2 px-4 bg-white" style={{ borderRadius: 'var(--radius-full)' }}>
          <span className="font-semibold text-accent" style={{ fontSize: 14 }}>1.850 kcal</span>
        </div>
      </div>

      <div className="flex-col gap-6">
        {/* Café da Manhã */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4 bg-white border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 24 }}>🍳</span>
              <h3 className="font-semibold">Café da Manhã</h3>
            </div>
            <span className="text-muted text-sm flex items-center gap-1"><Clock size={14}/> 08:00</span>
          </div>
          <div className="p-4 flex-col gap-3">
            {[
              { name: 'Ovos mexidos', amount: '2 unidades' },
              { name: 'Pão integral', amount: '2 fatias' },
              { name: 'Café preto', amount: '1 xícara' }
            ].map(item => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="text-primary">{item.name}</span>
                <span className="text-muted text-sm">{item.amount}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button className="btn-ghost flex-1 flex justify-center items-center gap-1 text-sm py-2">
                <RefreshCw size={16} /> Trocar
              </button>
              <button className="btn-ghost flex-1 flex justify-center items-center gap-1 text-sm py-2">
                <Plus size={16} /> Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Almoço */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4 bg-white border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 24 }}>🍛</span>
              <h3 className="font-semibold">Almoço</h3>
            </div>
            <span className="text-muted text-sm flex items-center gap-1"><Clock size={14}/> 13:00</span>
          </div>
          <div className="p-4 flex-col gap-3">
            {[
              { name: 'Patilho Assado', amount: '150g' },
              { name: 'Arroz Integral', amount: '100g' },
              { name: 'Feijão', amount: '1 concha' },
              { name: 'Salada', amount: 'À vontade' }
            ].map(item => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="text-primary">{item.name}</span>
                <span className="text-muted text-sm">{item.amount}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button className="btn-ghost flex-1 flex justify-center items-center gap-1 text-sm py-2">
                <RefreshCw size={16} /> Trocar
              </button>
              <button className="btn-ghost flex-1 flex justify-center items-center gap-1 text-sm py-2">
                <Plus size={16} /> Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Jantar */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4 bg-white border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 24 }}>🌙</span>
              <h3 className="font-semibold">Jantar</h3>
            </div>
            <span className="text-muted text-sm flex items-center gap-1"><Clock size={14}/> 20:00</span>
          </div>
          <div className="p-4 flex-col gap-3">
            {[
              { name: 'Sopa de Legumes', amount: '1 prato fundo' },
              { name: 'Peixe Grelhado', amount: '120g' }
            ].map(item => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="text-primary">{item.name}</span>
                <span className="text-muted text-sm">{item.amount}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button className="btn-ghost flex-1 flex justify-center items-center gap-1 text-sm py-2">
                <RefreshCw size={16} /> Trocar
              </button>
              <button className="btn-ghost flex-1 flex justify-center items-center gap-1 text-sm py-2">
                <Plus size={16} /> Adicionar
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
