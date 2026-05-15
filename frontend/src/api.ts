const BASE = '/api';

function headers(auth = true): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) h['Authorization'] = `Bearer ${localStorage.getItem('token') || ''}`;
  return h;
}

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return res.json();
}

export const api = {
  register: (username: string, password: string) =>
    req<{ token: string; username: string; error?: string }>(`${BASE}/auth/register`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify({ username, password }),
    }),

  login: (username: string, password: string) =>
    req<{ token: string; username: string; error?: string }>(`${BASE}/auth/login`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify({ username, password }),
    }),

  getGroups: () =>
    req<Group[]>(`${BASE}/groups`, { headers: headers() }),

  createGroup: (group_name: string) =>
    req<Group & { error?: string }>(`${BASE}/groups`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ group_name }),
    }),

  joinGroup: (invite_code: string) =>
    req<{ message?: string; group?: Group; error?: string }>(`${BASE}/groups/join`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ invite_code }),
    }),

  getGroupMembers: (group_id: number) =>
    req<Member[]>(`${BASE}/groups/${group_id}/members`, { headers: headers() }),

  getInbox: () =>
    req<Letter[]>(`${BASE}/letters/inbox`, { headers: headers() }),

  getOutbox: () =>
    req<OutboxLetter[]>(`${BASE}/letters/outbox`, { headers: headers() }),

  getTodayStatus: () =>
    req<TodayStatus>(`${BASE}/letters/today-status`, { headers: headers() }),

  sendLetter: (group_id: number, receiver_id: number, content: string) =>
    req<{ letter_id?: number; error?: string }>(`${BASE}/letters/groups/${group_id}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ receiver_id, content }),
    }),

  openLetter: (letter_id: number) =>
    req<Letter & { error?: string; sent_today?: number; can_open?: number }>(
      `${BASE}/letters/${letter_id}/open`,
      { method: 'POST', headers: headers() }
    ),
};

export interface Letter {
  letter_id: number;
  group_id: number;
  content: string | null;
  created_at: string;
  opened_at: string | null;
  status: 'pending' | 'opened';
}

export interface OutboxLetter {
  letter_id: number;
  group_id: number;
  receiver_id: number;
  receiver_username: string;
  content: string;
  created_at: string;
  opened_at: string | null;
  status: 'pending' | 'opened';
}

export interface Group {
  group_id: number;
  group_name: string;
  invite_code: string;
  created_by: number;
  created_at: string;
  member_count?: number;
}

export interface Member {
  user_id: number;
  username: string;
  joined_at: string;
}

export interface TodayStatus {
  sent_today: number;
  opened_today: number;
  can_open: number;
}
