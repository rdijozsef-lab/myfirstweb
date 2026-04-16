import { LeadStatus, TaskPriority, TaskStatus, EventType, LeadSource } from '@prisma/client';

export const leadStatusLabel: Record<LeadStatus, string> = {
  NEW: 'Új',
  CONTACTED: 'Kapcsolatban',
  IN_PROGRESS: 'Folyamatban',
  OFFER_SENT: 'Ajánlat elküldve',
  WAITING_FEEDBACK: 'Visszajelzésre vár',
  WON: 'Megnyert',
  LOST: 'Elveszett',
};

export const taskStatusLabel: Record<TaskStatus, string> = {
  TODO: 'Új',
  IN_PROGRESS: 'Folyamatban',
  WAITING: 'Várakozik',
  DONE: 'Kész',
  CLOSED: 'Lezárva',
};

export const priorityLabel: Record<TaskPriority, string> = {
  LOW: 'Alacsony',
  MEDIUM: 'Normál',
  HIGH: 'Magas',
  URGENT: 'Sürgős',
};

export const eventTypeLabel: Record<EventType, string> = {
  MEETING: 'Meeting',
  CALL: 'Hívás',
  DEADLINE: 'Határidő',
  BOOKING: 'Foglalás',
  SOCIAL: 'Social',
  INTERNAL: 'Belső',
};

export const sourceLabel: Record<LeadSource, string> = {
  WEBSITE: 'Weboldal',
  PHONE: 'Telefon',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  LINKEDIN: 'LinkedIn',
  REFERRAL: 'Ajánlás',
  OTHER: 'Egyéb',
};

export function formatDate(value?: Date | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(value);
}

export function formatDateTime(value?: Date | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  }).format(value);
}

export function toDateTimeLocalInput(value?: Date | null) {
  if (!value) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}
