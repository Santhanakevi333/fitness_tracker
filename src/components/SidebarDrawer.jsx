import React from 'react';
import {
  X,
  User,
  LogOut,
  Users,
  Cloud,
  Camera,
  Mic,
  Download,
  Upload,
  Plus,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export function SidebarDrawer({
  isOpen,
  onClose,
  tabs,
  activeTab,
  onSelectTab,
  userDisplay,
  trackedDaysCount,
  isCloudConnected,
  onOpenAuth,
  onSignOut,
  onOpenAIScanner,
  onExportJSON,
  onImportJSONClick,
  onAddRow,
  dateRange
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0F3D3E]/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-[#FFFFFF] h-full shadow-2xl flex flex-col z-10 border-r border-[#2A9D8F]/25 overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A9D8F]/20 bg-gradient-to-r from-[#E8F5E9] to-[#FFFFFF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] border border-[#2A9D8F]/40 p-1 flex items-center justify-center overflow-hidden shadow-xs">
              <img src="/tracker.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#0F3D3E] tracking-tight">FitTracker Pro</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2A9D8F] border border-[#2A9D8F]/30">
                Navigation & Tools
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white hover:bg-gray-100 text-[#0F3D3E] border border-[#2A9D8F]/20 flex items-center justify-center transition-all shadow-xs"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Card (Prominent & Non-clipped) */}
        <div className="p-4 border-b border-[#2A9D8F]/15 bg-[#F4FAF5]">
          {!userDisplay.isGuest ? (
            <div className="theme-box rounded-2xl p-3.5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#0F3D3E] text-[#E8F5E9] font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {userDisplay.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-black text-xs text-[#0F3D3E] truncate">{userDisplay.name}</h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#E8F5E9] text-[#2A9D8F] border border-[#2A9D8F]/30">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-[#355E5F] truncate">{userDisplay.email}</p>
                  <div className="flex items-center gap-2 text-[10px] text-[#2A9D8F] font-bold mt-1">
                    <span>{trackedDaysCount} Tracked Days</span>
                    {isCloudConnected && (
                      <span className="inline-flex items-center gap-1 text-[#2A9D8F]">
                        &bull; 🟢 Cloud Synced
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* User Actions */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#2A9D8F]/15 text-xs">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white hover:bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/25 text-[11px] font-bold transition-all"
                >
                  <Users className="w-3 h-3 text-[#2A9D8F]" />
                  <span>Switch</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold transition-all"
                >
                  <LogOut className="w-3 h-3 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="theme-box rounded-2xl p-3.5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2A9D8F] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#0F3D3E]">Guest Mode (Local)</h3>
                  <p className="text-[11px] text-[#355E5F]">Sign in to isolate & sync multi-user logs</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Create Account</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Add Log Button in Drawer */}
        <div className="p-3 bg-white">
          <button
            onClick={() => {
              onClose();
              onAddRow();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] hover:brightness-110 text-white font-extrabold text-xs shadow-md shadow-[#2A9D8F]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Daily Workout Log</span>
          </button>
        </div>

        {/* Navigation Tabs List */}
        <div className="flex-1 p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-[#355E5F] uppercase tracking-wider">
            Menu Navigation
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-[#0F3D3E] text-white shadow-xs'
                    : 'text-[#0F3D3E] hover:bg-[#E8F5E9] hover:text-[#0F3D3E]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2A9D8F]' : 'text-[#2A9D8F]'}`} />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#355E5F]/50'}`} />
              </button>
            );
          })}
        </div>

        {/* Action Tools Section */}
        <div className="p-3 border-t border-[#2A9D8F]/15 bg-[#F9FCFA] space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-[#355E5F] uppercase tracking-wider">
            Tools & Cloud
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenAIScanner();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#0F3D3E] hover:bg-[#E8F5E9] transition-all"
          >
            <div className="flex items-center gap-1 text-[#2A9D8F]">
              <Camera className="w-3.5 h-3.5" />
              <Mic className="w-3.5 h-3.5 text-[#0F3D3E]" />
            </div>
            <span>AI Meal & Voice Scanner</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onClose();
                onExportJSON();
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white hover:bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/25 text-xs font-semibold transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#2A9D8F]" />
              <span>Export</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onImportJSONClick();
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white hover:bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/25 text-xs font-semibold transition-all shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#2A9D8F]" />
              <span>Import</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-[#2A9D8F]/15 bg-white text-center text-[10px] text-[#355E5F]">
          <div className="flex items-center justify-center gap-1 font-medium">
            <Calendar className="w-3 h-3 text-[#2A9D8F]" />
            <span className="truncate">{dateRange}</span>
          </div>
          <div className="mt-1 font-semibold text-[#0F3D3E]">
            FitTracker Pro &bull; Slate on Mint
          </div>
        </div>
      </div>
    </div>
  );
}

