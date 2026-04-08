import { useState, useEffect } from 'react';
import { User, Scale, Bell, LogOut, ChevronRight, Check, X, Camera, Cloud, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { useBackup } from '../contexts/BackupContext';
import { useNavigate } from 'react-router-dom';
import {
  requestNotificationPermission,
  startNotifications, stopNotifications,
  saveSchedule, loadSchedule,
} from '../lib/notifications';
import type { NotificationSchedule } from '../lib/notifications';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { profile, saveProfile } = useUserData();
  const { isDriveConnected, syncing, lastSync, syncToDrive, restoreFromDrive } = useBackup();
  const navigate = useNavigate();

  const [editSection, setEditSection] = useState<string | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [schedule, setSchedule] = useState<NotificationSchedule>(loadSchedule());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [name, setName] = useState(profile?.name || '');
  const [weight, setWeight] = useState(String(profile?.weight || ''));
  const [height, setHeight] = useState(String(profile?.height || ''));
  const [age, setAge] = useState(String(profile?.age || ''));
  const [targetWeight, setTargetWeight] = useState(String(profile?.targetWeight || ''));

  useEffect(() => {
    if (profile) {
      setName(profile.name || user?.displayName || '');
      setWeight(String(profile.weight));
      setHeight(String(profile.height));
      setAge(String(profile.age));
      setTargetWeight(String(profile.targetWeight));
    }
  }, [profile, user]);

  useEffect(() => {
    setNotifEnabled(Notification.permission === 'granted');
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await saveProfile({
      name,
      weight: Number(weight) || profile?.weight,
      height: Number(height) || profile?.height,
      age: Number(age) || profile?.age,
      targetWeight: Number(targetWeight) || profile?.targetWeight,
    });
    setSaving(false);
    setSaved(true);
    setEditSection(null);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleNotifToggle = async () => {
    if (!notifEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotifEnabled(true);
        startNotifications(schedule);
      }
    } else {
      stopNotifications();
      setNotifEnabled(false);
    }
  };

  const handleScheduleChange = (key: keyof NotificationSchedule, value: string | number) => {
    const newSched = { ...schedule, [key]: value };
    setSchedule(newSched);
    saveSchedule(newSched);
    if (notifEnabled) startNotifications(newSched);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const InfoRow = ({ label, value, onEdit }: { label: string; value: string; onEdit?: () => void }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-color)' }} onClick={onEdit}>
      <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 14 }}>{value}</span>
        {onEdit && <ChevronRight size={16} color="var(--text-muted)" />}
      </div>
    </div>
  );

  return (
    <div className="page animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)', paddingBottom: 120 }}>

      {/* Avatar + Name */}
      <div style={{ textAlign: 'center', paddingTop: 20, marginBottom: 28 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 40, margin: '0 auto 14px',
          background: user?.photoURL ? 'transparent' : 'linear-gradient(135deg, var(--accent-primary), #FF8C42)',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(255,90,95,0.3)',
        }}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={36} color="white" />
          )}
        </div>
        <h2 style={{ marginBottom: 4 }}>{name || 'Usuário'}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email || 'Modo demo'}</p>
        {saved && <p style={{ color: '#22c55e', fontSize: 13, marginTop: 6 }}>✓ Salvo com sucesso!</p>}
      </div>

      {/* Personal info card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h3 style={{ margin: 0 }}>Dados Pessoais</h3>
          {editSection !== 'personal' ? (
            <button onClick={() => setEditSection('personal')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 600, fontSize: 14 }}>
              Editar
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditSection(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} color="var(--text-muted)" /></button>
              <button onClick={handleSave} disabled={saving} style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: 10, padding: '6px 14px', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                {saving ? '...' : <><Check size={14} style={{ display: 'inline', marginRight: 4 }} />Salvar</>}
              </button>
            </div>
          )}
        </div>

        {editSection !== 'personal' ? (
          <>
            <InfoRow label="Nome" value={name} onEdit={() => setEditSection('personal')} />
            <InfoRow label="Peso atual" value={`${weight} kg`} />
            <InfoRow label="Altura" value={`${height} cm`} />
            <InfoRow label="Idade" value={`${age} anos`} />
            <InfoRow label="Peso alvo" value={`${targetWeight} kg`} />
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {[
              { label: 'Nome', val: name, set: setName, type: 'text' },
              { label: 'Peso atual (kg)', val: weight, set: setWeight, type: 'number' },
              { label: 'Altura (cm)', val: height, set: setHeight, type: 'number' },
              { label: 'Idade', val: age, set: setAge, type: 'number' },
              { label: 'Peso alvo (kg)', val: targetWeight, set: setTargetWeight, type: 'number' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4, display: 'block' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                    background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                    borderRadius: 12, fontSize: 15, color: 'var(--text-main)', outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={20} color="var(--accent-primary)" />
            <h3 style={{ margin: 0 }}>Notificações</h3>
          </div>
          <button onClick={handleNotifToggle} style={{
            width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
            background: notifEnabled ? 'var(--accent-primary)' : 'var(--border-color)',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: 3, left: notifEnabled ? 25 : 3,
              width: 20, height: 20, borderRadius: 10, background: 'white',
              transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {notifEnabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: '☕ Café da manhã', key: 'breakfast' as const },
              { label: '🍛 Almoço', key: 'lunch' as const },
              { label: '🌙 Jantar', key: 'dinner' as const },
            ].map(n => (
              <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-main)', fontSize: 14 }}>{n.label}</span>
                <input
                  type="time"
                  value={schedule[n.key]}
                  onChange={e => handleScheduleChange(n.key, e.target.value)}
                  style={{
                    padding: '6px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                    borderRadius: 10, color: 'var(--text-main)', fontSize: 14, outline: 'none',
                  }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-main)', fontSize: 14 }}>💧 Lembrete de água</span>
              <select
                value={schedule.waterIntervalMinutes}
                onChange={e => handleScheduleChange('waterIntervalMinutes', Number(e.target.value))}
                style={{
                  padding: '6px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                  borderRadius: 10, color: 'var(--text-main)', fontSize: 14, outline: 'none',
                }}
              >
                <option value={30}>30 min</option>
                <option value={60}>1 hora</option>
                <option value={90}>1h 30min</option>
                <option value={120}>2 horas</option>
              </select>
            </div>
          </div>
        )}
        {!notifEnabled && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Ative para receber lembretes de refeições e água.</p>
        )}
      </div>

      {/* Backup / Drive */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Cloud size={20} color="var(--accent-primary)" />
          <h3 style={{ margin: 0 }}>Backup no Google Drive</h3>
        </div>
        {!isDriveConnected && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--text-main)' }}>Salvar dados na nuvem</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Faça login (abaixo) para testar esta função.</p>
            </div>
            <span style={{ fontSize: 12, padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: 8, color: 'var(--text-muted)' }}>Desconectado</span>
          </div>
        )}
        {isDriveConnected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ color: 'var(--text-main)', fontSize: 13, margin: 0 }}>
              Sua conta está conectada e pronta para backup.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <button 
                onClick={async () => {
                  const dataToSend = { profile, lastExport: new Date() }; // Example payload
                  await syncToDrive(dataToSend);
                  alert('Backup concluído com sucesso!');
                }}
                disabled={syncing}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, background: 'var(--accent-primary)',
                  color: 'white', border: 'none', fontWeight: 600, fontSize: 13, cursor: syncing ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: syncing ? 0.7 : 1
                }}
              >
                <Cloud size={16} /> Salvar Agora
              </button>
              <button 
                onClick={async () => {
                  const data = await restoreFromDrive();
                  if (data) alert('Mock Restore disparado! ' + (data.profile?.name || ''));
                  else alert('Nenhum backup encontrado.');
                }}
                disabled={syncing}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  color: 'var(--text-main)', fontWeight: 600, fontSize: 13, cursor: syncing ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: syncing ? 0.7 : 1
                }}
              >
                <RefreshCw size={16} /> Restaurar
              </button>
            </div>
            {lastSync && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>Último backup: {new Date(lastSync).toLocaleString()}</p>}
          </div>
        )}
      </div>

      {/* Other options */}
      <div className="card" style={{ marginBottom: 16 }}>
        {[
          { icon: <Scale size={18} color="var(--accent-primary)" />, label: 'Meu progresso de peso', action: () => navigate('/progress') },
          { icon: <Camera size={18} color="var(--accent-primary)" />, label: 'Escanear alimento com câmera', action: () => navigate('/camera') },
        ].map((item, i) => (
          <button key={i} onClick={item.action} style={{
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: i === 0 ? '1px solid var(--border-color)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {item.icon}
              <span style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: 14 }}>{item.label}</span>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} style={{
        width: '100%', padding: '15px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 16, color: '#ef4444', fontWeight: 600, fontSize: 15, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <LogOut size={18} />
        Sair da conta
      </button>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 20 }}>NutriAI v1.01</p>
    </div>
  );
}
