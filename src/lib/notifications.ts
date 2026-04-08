// Notification utilities for NutriAI
// Uses the Web Notifications API

export interface NotificationSchedule {
  breakfast: string;  // "HH:MM"
  lunch: string;
  dinner: string;
  waterIntervalMinutes: number;
}

export const DEFAULT_SCHEDULE: NotificationSchedule = {
  breakfast: '08:00',
  lunch: '12:00',
  dinner: '19:00',
  waterIntervalMinutes: 60,
};

let waterIntervalId: ReturnType<typeof setInterval> | null = null;
const mealTimeoutIds: ReturnType<typeof setTimeout>[] = [];

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendNotification(title: string, body: string, icon?: string) {
  if (Notification.permission !== 'granted') return;
  new Notification(title, {
    body,
    icon: icon || '/favicon.ico',
    badge: '/favicon.ico',
  });
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

function msUntilTime(hours: number, minutes: number): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1); // schedule for tomorrow if time has passed
  }
  return target.getTime() - now.getTime();
}

function scheduleRepeatingNotification(
  timeStr: string,
  title: string,
  body: string
) {
  const { hours, minutes } = parseTime(timeStr);
  const ms = msUntilTime(hours, minutes);

  const id = setTimeout(() => {
    sendNotification(title, body);
    // Re-schedule for next day
    scheduleRepeatingNotification(timeStr, title, body);
  }, ms);

  mealTimeoutIds.push(id);
}

export function startNotifications(schedule: NotificationSchedule) {
  stopNotifications();

  scheduleRepeatingNotification(
    schedule.breakfast,
    '☕ Hora do Café da Manhã!',
    'Não esqueça de registrar seu café da manhã no NutriAI.'
  );
  scheduleRepeatingNotification(
    schedule.lunch,
    '🍛 Hora do Almoço!',
    'Registre seu almoço e acompanhe suas metas do dia.'
  );
  scheduleRepeatingNotification(
    schedule.dinner,
    '🌙 Hora do Jantar!',
    'Finalize o dia registrando seu jantar.'
  );

  // Water reminders
  const intervalMs = schedule.waterIntervalMinutes * 60 * 1000;
  waterIntervalId = setInterval(() => {
    sendNotification(
      '💧 Beba Água!',
      `Lembrete: mantenha-se hidratado! Que tal um copo de água agora?`
    );
  }, intervalMs);
}

export function stopNotifications() {
  mealTimeoutIds.forEach(id => clearTimeout(id));
  mealTimeoutIds.length = 0;
  if (waterIntervalId) {
    clearInterval(waterIntervalId);
    waterIntervalId = null;
  }
}

export function saveSchedule(schedule: NotificationSchedule) {
  localStorage.setItem('nutriai_notification_schedule', JSON.stringify(schedule));
}

export function loadSchedule(): NotificationSchedule {
  try {
    const stored = localStorage.getItem('nutriai_notification_schedule');
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_SCHEDULE;
}
