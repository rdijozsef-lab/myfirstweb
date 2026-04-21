import { EventType, LeadSource, LeadStatus, TaskPriority, TaskStatus } from '@prisma/client';

export const leadStatusLabel: Record<LeadStatus, string> = {
  NEW: 'Uj',
  CONTACTED: 'Kapcsolatban',
  IN_PROGRESS: 'Folyamatban',
  OFFER_SENT: 'Ajanlat elkuldve',
  WAITING_FEEDBACK: 'Visszajelzesre var',
  WON: 'Megnyert',
  LOST: 'Elveszett',
};

export const taskStatusLabel: Record<TaskStatus, string> = {
  TODO: 'Uj',
  IN_PROGRESS: 'Folyamatban',
  WAITING: 'Varakozik',
  DONE: 'Kesz',
  CLOSED: 'Lezarva',
};

export const priorityLabel: Record<TaskPriority, string> = {
  LOW: 'Alacsony',
  MEDIUM: 'Normal',
  HIGH: 'Magas',
  URGENT: 'Surgos',
};

export const eventTypeLabel: Record<EventType, string> = {
  MEETING: 'Meeting',
  CALL: 'Hivas',
  DEADLINE: 'Hatarido',
  BOOKING: 'Foglalas',
  SOCIAL: 'Social',
  INTERNAL: 'Belso',
};

export const sourceLabel: Record<LeadSource, string> = {
  WEBSITE: 'Weboldal',
  PHONE: 'Telefon',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  LINKEDIN: 'LinkedIn',
  REFERRAL: 'Ajanlas',
  OTHER: 'Egyeb',
};

export function formatDate(value?: Date | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(value);
}

export function formatDateTime(value?: Date | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

export function toDateInput(value?: Date | null) {
  if (!value) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

export function toDateTimeLocalInput(value?: Date | null) {
  if (!value) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}
