import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Dumbbell,
  Flame,
  Zap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Trophy,
  Activity
} from 'lucide-react';
import { signIn, signUp } from '../services/authService';

export function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  hasLocalLogs = false,
  isMandatory = false,
  onContinueAsGuest
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [importExisting, setImportExisting] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const session = await signIn(email, password);
        onAuthSuccess(session, false);
        if (onClose) onClose();
      } else {
        const result = await signUp(email, password, name);
        if (result.needsEmailConfirmation) {
          setSuccessInfo({
            title: 'Account Created Successfully!',
            message: 'A verification link has been sent to your email. Confirm it to log in, or sign in directly if confirmations are disabled in Supabase.'
          });
        } else if (result.session) {
          onAuthSuccess(result.session, importExisting);
          if (onClose) onClose();
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#051112]/85 backdrop-blur-xl animate-fadeIn">
      {/* Background ambient gym lighting effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2A9D8F]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-[#0A1D1E]/95 border border-[#2A9D8F]/40 rounded-3xl overflow-hidden shadow-2xl shadow-black/70 text-white">
        {/* Top Glow Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0F3D3E] via-[#2A9D8F] to-[#48CAE4]"></div>

        {/* Modal Header */}
        <div className="p-6 pb-4 relative">
          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/15 transition-all shadow-xs"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0F3D3E] to-[#2A9D8F] p-0.5 shadow-lg shadow-[#2A9D8F]/25 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#081819] rounded-[14px] flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-[#2A9D8F] transform -rotate-12" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#2A9D8F]/20 text-[#2A9D8F] border border-[#2A9D8F]/40 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#2A9D8F]" />
                  Athlete Portal
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                {mode === 'login' ? 'ENTER THE GYM' : 'JOIN THE SQUAD'}
              </h2>
              <p className="text-xs text-[#A0C4C7] mt-0.5 font-medium">
                {mode === 'login'
                  ? 'Sign in to access your workout logs & macros'
                  : 'Create your private athlete account & start tracking'}
              </p>
            </div>
          </div>

          {/* Athletic Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-5 bg-[#051112] p-1.5 rounded-2xl border border-[#2A9D8F]/30 shadow-inner">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessInfo(null); }}
              className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-[#2A9D8F] to-[#20756B] text-[#051112] shadow-md shadow-[#2A9D8F]/30 font-black'
                  : 'text-[#A0C4C7] hover:text-white hover:bg-white/5'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setSuccessInfo(null); }}
              className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-[#2A9D8F] to-[#20756B] text-[#051112] shadow-md shadow-[#2A9D8F]/30 font-black'
                  : 'text-[#A0C4C7] hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 pt-2">
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-600/50 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {successInfo && (
            <div className="mb-4 p-4 rounded-2xl bg-[#082223] border border-[#2A9D8F]/50 text-white text-xs animate-fadeIn">
              <div className="flex items-center gap-2 font-black text-sm text-[#2A9D8F]">
                <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />
                <span>{successInfo.title}</span>
              </div>
              <p className="mt-1.5 text-[#A0C4C7] leading-relaxed font-medium">
                {successInfo.message}
              </p>
              <button
                type="button"
                onClick={() => { setMode('login'); setSuccessInfo(null); }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-[#2A9D8F] text-[#051112] text-xs font-black uppercase tracking-wide flex items-center gap-1 shadow-xs"
              >
                <span>Switch to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!successInfo && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#A0C4C7] uppercase tracking-wider mb-1.5">
                    Athlete Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#2A9D8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kevi"
                      className="w-full bg-[#051112] border border-[#2A9D8F]/35 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/25 font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#A0C4C7] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#2A9D8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="athlete@domain.com"
                    className="w-full bg-[#051112] border border-[#2A9D8F]/35 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/25 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#A0C4C7] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#2A9D8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#051112] border border-[#2A9D8F]/35 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/25 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0C4C7] hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Migration Prompt for existing local logs */}
              {mode === 'signup' && hasLocalLogs && (
                <div className="p-3 bg-[#082223] rounded-2xl border border-[#2A9D8F]/35 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="importLogs"
                    checked={importExisting}
                    onChange={(e) => setImportExisting(e.target.checked)}
                    className="mt-1 rounded accent-[#2A9D8F] w-4 h-4"
                  />
                  <label htmlFor="importLogs" className="text-xs text-white cursor-pointer">
                    <strong className="block font-bold">Import current local logs</strong>
                    <span className="text-[11px] text-[#A0C4C7]">
                      Link your existing history to this new account so zero workout logs are lost.
                    </span>
                  </label>
                </div>
              )}

              {/* Pro Gym Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#2A9D8F] via-[#20756B] to-[#155455] hover:brightness-110 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#2A9D8F]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Dumbbell className="w-4 h-4" />
                    <span>{mode === 'login' ? 'ENTER FITTRACKER ZONE' : 'ACTIVATE ATHLETE PROFILE'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Athletic Highlights Strip */}
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-[#2A9D8F]/20 text-[10px] text-center text-[#A0C4C7]">
            <div className="bg-[#051112] p-2 rounded-xl border border-[#2A9D8F]/20">
              <span className="block font-extrabold text-white text-xs">120g</span>
              <span>Protein Goal</span>
            </div>
            <div className="bg-[#051112] p-2 rounded-xl border border-[#2A9D8F]/20">
              <span className="block font-extrabold text-white text-xs">2,100</span>
              <span>Deficit Kcal</span>
            </div>
            <div className="bg-[#051112] p-2 rounded-xl border border-[#2A9D8F]/20">
              <span className="block font-extrabold text-[#2A9D8F] text-xs">7-Day</span>
              <span>Audit Grade</span>
            </div>
          </div>

          {/* Guest / Multi-User Explainer Footer */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[#A0C4C7]">Testing without account?</span>
            <button
              type="button"
              onClick={onContinueAsGuest || onClose}
              className="text-[#2A9D8F] font-bold hover:underline"
            >
              Start as Guest (Clean) &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
