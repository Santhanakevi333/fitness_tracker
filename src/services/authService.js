// Authentication Service for FitTracker Pro using Supabase GoTrue Auth
// 100% Zero-Dependency Native Fetch - Works across mobile, desktop, and all browsers

import { getCloudConfig } from './cloudDbService';

const AUTH_STORAGE_KEY = 'fit_tracker_auth_session';
const LOCAL_USERS_KEY = 'fit_tracker_local_users';

/**
 * Get current saved auth session from localStorage
 */
export function getSavedSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && session.user && session.user.id) {
      return session;
    }
  } catch (e) {
    console.error('Error reading auth session:', e);
  }
  return null;
}

/**
 * Save auth session to localStorage
 */
export function saveSession(session) {
  try {
    if (session) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error saving auth session:', e);
  }
}

/**
 * Clear current session
 */
export function clearSession() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing auth session:', e);
  }
}

/**
 * Get friendly display info for user
 */
export function getUserDisplay(user) {
  if (!user) return { name: 'Guest User', email: '', initials: 'GU', isGuest: true };

  const email = user.email || '';
  const metaName = user.user_metadata?.name || user.user_metadata?.full_name;
  const name = metaName || (email ? email.split('@')[0] : 'Fitness Pro');

  let initials = 'FP';
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      initials = name.slice(0, 2).toUpperCase();
    }
  }

  return {
    id: user.id,
    name,
    email,
    initials,
    isGuest: false
  };
}

/**
 * Sign In with Email & Password
 */
export async function signIn(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    throw new Error('Please enter both email and password.');
  }

  const config = getCloudConfig();

  // If Supabase Cloud is configured, authenticate with Supabase GoTrue Auth
  if (config) {
    const endpoint = `${config.url}/auth/v1/token?grant_type=password`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: config.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: cleanEmail,
        password: cleanPassword
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data.error_description || data.msg || data.message || `Login failed (${res.status})`;
      if (msg.toLowerCase().includes('invalid login credentials')) {
        throw new Error('Incorrect email or password. Please verify and try again.');
      }
      if (msg.toLowerCase().includes('email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link first, or disable email confirmation in Supabase Dashboard.');
      }
      throw new Error(msg);
    }

    const session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at || Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
      user: data.user
    };

    saveSession(session);
    return session;
  }

  // Fallback: Local offline accounts if Supabase Cloud is not yet configured
  let localUsers = [];
  try {
    localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch (e) {
    localUsers = [];
  }

  const found = localUsers.find(u => u.email === cleanEmail && u.password === cleanPassword);
  if (!found) {
    throw new Error('Account not found or password incorrect. (Local offline mode)');
  }

  const localSession = {
    access_token: `local_token_${found.id}`,
    user: {
      id: found.id,
      email: found.email,
      user_metadata: { name: found.name }
    }
  };

  saveSession(localSession);
  return localSession;
}

/**
 * Sign Up (Create Account) with Email & Password
 */
export async function signUp(email, password, name = '') {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();
  const cleanName = (name || '').trim();

  if (!cleanEmail) throw new Error('Please enter a valid email address.');
  if (cleanPassword.length < 6) throw new Error('Password must be at least 6 characters long.');

  const config = getCloudConfig();

  // Supabase Cloud Sign Up
  if (config) {
    const endpoint = `${config.url}/auth/v1/signup`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: config.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: cleanEmail,
        password: cleanPassword,
        data: {
          name: cleanName || cleanEmail.split('@')[0]
        }
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data.error_description || data.msg || data.message || `Signup failed (${res.status})`;
      if (msg.toLowerCase().includes('user already registered') || msg.toLowerCase().includes('already exists')) {
        throw new Error('An account with this email already exists. Please switch to Sign In.');
      }
      throw new Error(msg);
    }

    // If email confirmation is disabled in Supabase, access_token is returned immediately
    if (data.access_token && data.user) {
      const session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at || Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
        user: data.user
      };
      saveSession(session);
      return { session, needsEmailConfirmation: false };
    }

    // If email confirmation is required by Supabase
    return {
      session: null,
      user: data.user || data,
      needsEmailConfirmation: true
    };
  }

  // Fallback: Local offline mode account creation
  let localUsers = [];
  try {
    localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch (e) {
    localUsers = [];
  }

  if (localUsers.some(u => u.email === cleanEmail)) {
    throw new Error('An account with this email already exists locally. Please sign in.');
  }

  const newUser = {
    id: `local_user_${Date.now()}`,
    email: cleanEmail,
    password: cleanPassword,
    name: cleanName || cleanEmail.split('@')[0],
    createdAt: new Date().toISOString()
  };

  localUsers.push(newUser);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));

  const localSession = {
    access_token: `local_token_${newUser.id}`,
    user: {
      id: newUser.id,
      email: newUser.email,
      user_metadata: { name: newUser.name }
    }
  };

  saveSession(localSession);
  return { session: localSession, needsEmailConfirmation: false };
}

/**
 * Sign Out
 */
export async function signOut() {
  const session = getSavedSession();
  const config = getCloudConfig();

  if (config && session && session.access_token && !session.access_token.startsWith('local_token')) {
    try {
      const endpoint = `${config.url}/auth/v1/logout`;
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${session.access_token}`
        }
      });
    } catch (e) {
      console.warn('Remote logout failed (possibly offline):', e);
    }
  }

  clearSession();
  return true;
}

