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
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Database
} from 'lucide-react';
import { signIn, signUp } from '../services/authService';

export function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  hasLocalLogs = false
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
        onClose();
      } else {
        const result = await signUp(email, password, name);
        if (result.needsEmailConfirmation) {
          setSuccessInfo({
            title: 'Account Created Successfully!',
            message: 'A confirmation link has been sent to your email. Please verify your email to log in, or disable email confirmations in your Supabase dashboard.'
          });
        } else if (result.session) {
          onAuthSuccess(result.session, importExisting);
          onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F3D3E]/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#FFFFFF] border border-[#2A9D8F]/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-[#0F3D3E]/20 text-[#0F3D3E]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#E8F5E9] via-[#F0FAF3] to-[#FFFFFF] p-6 border-b border-[#2A9D8F]/20 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] text-[#0F3D3E] flex items-center justify-center border border-[#2A9D8F]/20 transition-all shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F3D3E] text-[#E8F5E9] flex items-center justify-center shadow-sm">
              {mode === 'login' ? <LogIn className="w-6 h-6 text-[#2A9D8F]" /> : <UserPlus className="w-6 h-6 text-[#2A9D8F]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2A9D8F]/15 text-[#0F3D3E] border border-[#2A9D8F]/30">
                  Multi-User Access
                </span>
              </div>
              <h2 className="text-xl font-black text-[#0F3D3E] tracking-tight mt-0.5">
                {mode === 'login' ? 'Welcome Back!' : 'Create User Account'}
              </h2>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-5 bg-[#E8F5E9] p-1 rounded-2xl border border-[#2A9D8F]/25">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessInfo(null); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-[#0F3D3E] text-white shadow-xs'
                  : 'text-[#0F3D3E] hover:bg-[#FFFFFF]/60'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setSuccessInfo(null); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-[#0F3D3E] text-white shadow-xs'
                  : 'text-[#0F3D3E] hover:bg-[#FFFFFF]/60'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {successInfo && (
            <div className="mb-5 p-4 rounded-2xl bg-[#E8F5E9] border border-[#2A9D8F]/40 text-[#0F3D3E] text-xs animate-fadeIn">
              <div className="flex items-center gap-2 font-black text-sm text-[#0F3D3E]">
                <CheckCircle2 className="w-4 h-4 text-[#2A9D8F]" />
                <span>{successInfo.title}</span>
              </div>
              <p className="mt-1.5 text-[#355E5F] leading-relaxed font-medium">
                {successInfo.message}
              </p>
              <button
                type="button"
                onClick={() => { setMode('login'); setSuccessInfo(null); }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-[#0F3D3E] text-white text-xs font-bold flex items-center gap-1"
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
                  <label className="block text-xs font-bold text-[#0F3D3E] uppercase tracking-wide mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#2A9D8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Arun Kumar"
                      className="w-full bg-[#F4FAF5] border border-[#2A9D8F]/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#0F3D3E] placeholder-[#355E5F]/50 focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/20 font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0F3D3E] uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#2A9D8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#F4FAF5] border border-[#2A9D8F]/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#0F3D3E] placeholder-[#355E5F]/50 focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F3D3E] uppercase tracking-wide mb-1.5">
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
                    className="w-full bg-[#F4FAF5] border border-[#2A9D8F]/30 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-[#0F3D3E] placeholder-[#355E5F]/50 focus:outline-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/20 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#355E5F] hover:text-[#0F3D3E] p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-[10px] text-[#355E5F] mt-1">Must be at least 6 characters.</p>
                )}
              </div>

              {/* Multi-User Migration Prompt for existing local logs */}
              {mode === 'signup' && hasLocalLogs && (
                <div className="p-3 bg-[#E8F5E9]/70 rounded-2xl border border-[#2A9D8F]/30 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="importLogs"
                    checked={importExisting}
                    onChange={(e) => setImportExisting(e.target.checked)}
                    className="mt-1 rounded accent-[#2A9D8F] w-4 h-4"
                  />
                  <label htmlFor="importLogs" className="text-xs text-[#0F3D3E] cursor-pointer">
                    <strong className="block font-bold">Import current tracked logs</strong>
                    <span className="text-[11px] text-[#355E5F]">
                      Attach your existing tracked history to this new account so you don't lose any logs.
                    </span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] text-white font-extrabold text-xs shadow-md shadow-[#0F3D3E]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{mode === 'login' ? 'Sign In to FitTracker' : 'Create My Account'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Guest / Multi-User Explainer Footer */}
          <div className="mt-6 pt-5 border-t border-[#2A9D8F]/15 flex items-center justify-between text-xs">
            <span className="text-[#355E5F]">Don't want to sign in?</span>
            <button
              type="button"
              onClick={onClose}
              className="text-[#2A9D8F] font-bold hover:underline"
            >
              Continue as Guest &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

