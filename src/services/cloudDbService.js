// Cloud Database Service for FitTracker Pro using Supabase PostgREST
// 100% Zero-Dependency Native Fetch - Works across mobile, desktop, and all browsers

const CONFIG_STORAGE_KEY = 'fit_tracker_supabase_config';

export function getCloudConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.key) return parsed;
    }
  } catch (e) {
    console.error('Error reading cloud config:', e);
  }

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey) {
    return { url: envUrl, key: envKey };
  }

  return null;
}

export function saveCloudConfig(url, key) {
  try {
    if (url && key) {
      const cleanUrl = url.trim().replace(/\/+$/, '');
      const cleanKey = key.trim();
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ url: cleanUrl, key: cleanKey }));
      return { url: cleanUrl, key: cleanKey };
    } else {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
      return null;
    }
  } catch (e) {
    console.error('Error saving cloud config:', e);
    return null;
  }
}

export function isCloudConfigured() {
  return getCloudConfig() !== null;
}

// Convert app camelCase object to Postgres snake_case
function toDbRow(d) {
  return {
    id: String(d.id || d.date),
    date: d.date || '',
    raw_date: d.rawDate || d.raw_date || '',
    display_date: d.displayDate || d.display_date || '',
    day_of_week: d.dayOfWeek || d.day_of_week || '',
    wake_up: d.wakeUp || d.wake_up || '08:00 AM',
    weight: typeof d.weight === 'number' ? d.weight : null,
    water: typeof d.water === 'number' ? d.water : null,
    steps: typeof d.steps === 'number' ? d.steps : null,
    gym: Boolean(d.gym),
    workout: d.workout || 'Nil',
    workout_category: d.workoutCategory || d.workout_category || 'Rest',
    boxing: Boolean(d.boxing),
    abs: Boolean(d.abs),
    calories_goal: typeof d.caloriesGoal === 'number' ? d.caloriesGoal : 2100,
    calories_eaten: typeof d.caloriesEaten === 'number' ? d.caloriesEaten : 0,
    protein_goal: typeof d.proteinGoal === 'number' ? d.proteinGoal : 120,
    protein_eaten: typeof d.proteinEaten === 'number' ? d.proteinEaten : 0,
    fiber: typeof d.fiber === 'number' ? d.fiber : null,
    sleep: typeof d.sleep === 'number' ? d.sleep : null,
    energy: typeof d.energy === 'number' ? d.energy : null,
    notes: d.notes || ''
  };
}

// Convert Postgres snake_case back to app camelCase
function fromDbRow(r) {
  return {
    id: r.id || r.date,
    date: r.date,
    rawDate: r.raw_date || r.date,
    displayDate: r.display_date || r.date,
    dayOfWeek: r.day_of_week || '',
    wakeUp: r.wake_up || '08:00 AM',
    weight: typeof r.weight === 'number' ? r.weight : (r.weight ? Number(r.weight) : null),
    water: typeof r.water === 'number' ? r.water : (r.water ? Number(r.water) : null),
    steps: typeof r.steps === 'number' ? r.steps : (r.steps ? Number(r.steps) : null),
    gym: Boolean(r.gym),
    workout: r.workout || 'Nil',
    workoutCategory: r.workout_category || 'Rest',
    boxing: Boolean(r.boxing),
    abs: Boolean(r.abs),
    caloriesGoal: r.calories_goal || 2100,
    caloriesEaten: r.calories_eaten || 0,
    proteinGoal: r.protein_goal || 120,
    proteinEaten: r.protein_eaten || 0,
    fiber: typeof r.fiber === 'number' ? r.fiber : (r.fiber ? Number(r.fiber) : 0),
    sleep: typeof r.sleep === 'number' ? r.sleep : (r.sleep ? Number(r.sleep) : 0),
    energy: typeof r.energy === 'number' ? r.energy : (r.energy ? Number(r.energy) : 0),
    notes: r.notes || ''
  };
}

/**
 * Fetch all logs from Cloud Database
 */
export async function fetchLogsFromCloud() {
  const config = getCloudConfig();
  if (!config) return null;

  const endpoint = `${config.url}/rest/v1/fitness_logs?select=*&order=date.asc`;
  const res = await fetch(endpoint, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Cloud fetch error: ${res.status}`);
  }

  const rows = await res.json();
  return rows.map(fromDbRow);
}

/**
 * Upsert a single log row to Cloud Database
 */
export async function upsertLogRowToCloud(log) {
  const config = getCloudConfig();
  if (!config) return null;

  const endpoint = `${config.url}/rest/v1/fitness_logs?on_conflict=id`;
  const dbRow = toDbRow(log);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(dbRow)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Cloud upsert error: ${res.status}`);
  }

  return true;
}

/**
 * Bulk upload multiple logs to Cloud (e.g. migrate localStorage to Cloud in 1 click)
 */
export async function bulkUploadLogsToCloud(logs) {
  const config = getCloudConfig();
  if (!config) throw new Error('Cloud configuration missing. Please enter your Supabase URL & Key.');

  const endpoint = `${config.url}/rest/v1/fitness_logs?on_conflict=id`;
  const dbRows = logs.map(toDbRow);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(dbRows)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Cloud bulk upload error: ${res.status}`);
  }

  return true;
}

/**
 * Delete a log row from Cloud Database
 */
export async function deleteLogRowFromCloud(id) {
  const config = getCloudConfig();
  if (!config) return null;

  const endpoint = `${config.url}/rest/v1/fitness_logs?id=eq.${encodeURIComponent(id)}`;
  const res = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Cloud delete error: ${res.status}`);
  }

  return true;
}

// SQL Schema for the user to copy/paste in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- 1. Create fitness_logs table
CREATE TABLE IF NOT EXISTS public.fitness_logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  raw_date TEXT,
  display_date TEXT,
  day_of_week TEXT,
  wake_up TEXT DEFAULT '08:00 AM',
  weight NUMERIC,
  water NUMERIC,
  steps INTEGER,
  gym BOOLEAN DEFAULT false,
  workout TEXT DEFAULT 'Nil',
  workout_category TEXT DEFAULT 'Rest',
  boxing BOOLEAN DEFAULT false,
  abs BOOLEAN DEFAULT false,
  calories_goal INTEGER DEFAULT 2100,
  calories_eaten INTEGER DEFAULT 0,
  protein_goal INTEGER DEFAULT 120,
  protein_eaten INTEGER DEFAULT 0,
  fiber NUMERIC DEFAULT 0,
  sleep NUMERIC DEFAULT 0,
  energy NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) & Allow Read/Write
ALTER TABLE public.fitness_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Full Access" ON public.fitness_logs;
CREATE POLICY "Public Full Access"
ON public.fitness_logs
FOR ALL
USING (true)
WITH CHECK (true);
`;
