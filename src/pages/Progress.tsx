import { Target, TrendingDown } from 'lucide-react';

export default function Progress() {
  return (
    <div className="page animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex justify-between items-center mb-6 pt-4">
        <h2>Seu Progresso</h2>
      </div>

      {/* Summary Cards */}
      <div className="flex gap-4 mb-6">
        <div className="card flex-1 text-center py-6">
          <p className="text-muted text-sm mb-1">Peso Atual</p>
          <span className="text-primary font-bold" style={{ fontSize: 24 }}>81.5<span style={{ fontSize: 14 }}>kg</span></span>
        </div>
        <div className="card flex-1 text-center py-6">
          <p className="text-muted text-sm mb-1">Meta</p>
          <span className="text-primary font-bold" style={{ fontSize: 24, color: 'var(--accent-protein)' }}>78.0<span style={{ fontSize: 14 }}>kg</span></span>
        </div>
      </div>

      {/* Chart Simulation */}
      <div className="card mb-6 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-primary">Histórico de Peso</h3>
          <span className="text-accent flex items-center text-sm font-semibold">
            <TrendingDown size={16} className="mr-1" />
            -2.5 kg
          </span>
        </div>

        <div style={{ height: 160, position: 'relative', width: '100%', marginBottom: '20px' }}>
          {/* Guides */}
          {[0, 25, 50, 75, 100].map((pos) => (
            <div key={pos} style={{ position: 'absolute', top: `${pos}%`, width: '100%', borderTop: '1px dashed var(--border-color)' }} />
          ))}

          {/* Line Chart Graphic */}
          <svg viewBox="0 0 100 50" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
            {/* Area */}
            <path d="M 0,40 L 20,35 L 40,30 L 60,32 L 80,20 L 100,10 L 100,50 L 0,50 Z" fill="rgba(255, 90, 95, 0.1)" />
            {/* Line */}
            <path d="M 0,40 L 20,35 L 40,30 L 60,32 L 80,20 L 100,10" fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Points */}
            <circle cx="0" cy="40" r="2" fill="white" stroke="var(--accent-primary)" strokeWidth="1.5" />
            <circle cx="20" cy="35" r="2" fill="white" stroke="var(--accent-primary)" strokeWidth="1.5" />
            <circle cx="40" cy="30" r="2" fill="white" stroke="var(--accent-primary)" strokeWidth="1.5" />
            <circle cx="60" cy="32" r="2" fill="white" stroke="var(--accent-primary)" strokeWidth="1.5" />
            <circle cx="80" cy="20" r="2" fill="white" stroke="var(--accent-primary)" strokeWidth="1.5" />
            <circle cx="100" cy="10" r="2" fill="white" stroke="var(--accent-primary)" strokeWidth="1.5" />
          </svg>
        </div>
        
        <div className="flex justify-between text-muted text-sm px-2">
          <span>Sem 1</span>
          <span>Sem 2</span>
          <span>Sem 3</span>
          <span>Sem 4</span>
          <span>Atual</span>
        </div>
      </div>

      {/* Projection Card */}
      <div className="card flex items-center gap-4 p-5" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(255,90,95,0.05) 100%)' }}>
        <div style={{ background: 'white', padding: 12, borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-sm)' }}>
          <Target color="var(--accent-primary)" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-primary mb-1">Previsão da Meta</h3>
          <p className="text-muted text-sm">Você atingirá sua meta em <strong className="text-primary">24 dias</strong> se mantiver o ritmo!</p>
        </div>
      </div>

    </div>
  );
}
