import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudCheck,
  CloudOff,
  Database,
  Copy,
  Check,
  ExternalLink,
  X,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import {
  getCloudConfig,
  saveCloudConfig,
  isCloudConfigured,
  fetchLogsFromCloud,
  bulkUploadLogsToCloud,
  SUPABASE_SQL_SCHEMA
} from '../services/cloudDbService';

export function CloudSyncModal({ isOpen, onClose, localData = [], onSyncSuccess }) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const config = getCloudConfig();
    if (config) {
      setUrl(config.url);
      setAnonKey(config.key);
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleConnectAndSync = async (e) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setError('Please enter both Supabase Project URL and Anon Key.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Save config locally
      saveCloudConfig(url, anonKey);

      // 2. Test connection by fetching
      let cloudRows = [];
      try {
        cloudRows = await fetchLogsFromCloud();
      } catch (fetchErr) {
        // If table doesn't exist, provide clear guidance
        if (fetchErr.message && fetchErr.message.includes('relation') && fetchErr.message.includes('does not exist')) {
          throw new Error('Table "fitness_logs" not found in Supabase! Please run the SQL snippet in Supabase SQL Editor first.');
        }
        throw fetchErr;
      }

      // 3. If localData has logs and cloud has fewer, or user wants to upload
      if (localData && localData.length > 0) {
        await bulkUploadLogsToCloud(localData);
        // re-fetch latest
        cloudRows = await fetchLogsFromCloud();
      }

      setIsConnected(true);
      setSuccessMsg(`Successfully connected! ${cloudRows.length} logs synced to your cloud database.`);
      onSyncSuccess(cloudRows);

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Cloud connect error:', err);
      setError(err.message || 'Failed to connect to Supabase. Check URL, Key, or run the SQL script.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchFromCloud = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rows = await fetchLogsFromCloud();
      setSuccessMsg(`Fetched ${rows.length} logs from cloud database!`);
      onSyncSuccess(rows);
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err) {
      setError(err.message || 'Failed to fetch logs from cloud.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushLocalToCloud = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await bulkUploadLogsToCloud(localData);
      setSuccessMsg(`Uploaded all ${localData.length} logs to your cloud database!`);
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err) {
      setError(err.message || 'Failed to upload local logs to cloud.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    saveCloudConfig(null, null);
    setUrl('');
    setAnonKey('');
    setIsConnected(false);
    setSuccessMsg('Disconnected from cloud database. App is now using local storage.');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F3D3E]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFFFF] border border-[#2A9D8F]/30 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl shadow-[#0F3D3E]/20 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2A9D8F]/20 flex items-center justify-between bg-[#F0F9F4]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] border border-[#2A9D8F]/40 flex items-center justify-center text-[#2A9D8F] shadow-xs">
              <Cloud className="w-5 h-5 text-[#2A9D8F]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0F3D3E] text-base sm:text-lg flex items-center gap-2">
                Cloud Database Sync
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isConnected
                      ? 'bg-[#E8F5E9] text-[#0F3D3E] border-[#2A9D8F]/40'
                      : 'bg-orange-50 text-orange-700 border-orange-200'
                  }`}
                >
                  {isConnected ? 'Connected' : 'Local Only'}
                </span>
              </h3>
              <p className="text-xs text-[#355E5F]">Access your fitness logs anywhere from any mobile or laptop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#355E5F] hover:text-[#0F3D3E] hover:bg-[#E8F5E9] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Status Banner */}
          {successMsg && (
            <div className="p-3 bg-[#E8F5E9] border border-[#2A9D8F]/50 rounded-2xl flex items-center gap-2.5 text-xs text-[#0F3D3E] font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-[#2A9D8F] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* If Connected */}
          {isConnected ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#F0F9F4] border border-[#2A9D8F]/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F3D3E] flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#2A9D8F]" />
                    <span>Supabase Postgres Database</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#2A9D8F] bg-white px-2.5 py-1 rounded-full border border-[#2A9D8F]/30 shadow-xs">
                    Live Active Sync
                  </span>
                </div>
                <div className="text-[#355E5F] text-[11px] truncate">
                  <strong>Project URL:</strong> {url}
                </div>
                <p className="text-[#355E5F] leading-relaxed">
                  All entries you add or edit on mobile/desktop automatically sync to this cloud database. Even if you clear browser cookies or change devices, your logs will never be lost!
                </p>
              </div>

              {/* Sync Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleFetchFromCloud}
                  disabled={isLoading}
                  className="py-2.5 px-3 bg-white hover:bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/30 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#2A9D8F] ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Fetch from Cloud</span>
                </button>
                <button
                  onClick={handlePushLocalToCloud}
                  disabled={isLoading}
                  className="py-2.5 px-3 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xs hover:scale-[1.02] disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Push Local Logs ({localData.length})</span>
                </button>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={handleDisconnect}
                  className="text-[11px] text-red-600 hover:text-red-700 font-bold hover:underline"
                >
                  Disconnect Cloud Database
                </button>
              </div>
            </div>
          ) : (
            /* Setup Guide & Connect Form */
            <div className="space-y-5">
              {/* Tanglish Step Guide */}
              <div className="p-4 bg-[#F0F9F4] border border-[#2A9D8F]/30 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-[#0F3D3E] text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2A9D8F]" />
                  <span>Free Cloud Database Setup (1 Minute)</span>
                </h4>
                <div className="space-y-2 text-[#355E5F] leading-relaxed">
                  <p>
                    <strong>1.</strong> Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#2A9D8F] font-bold underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a> and Sign Up for <strong>100% Free</strong>.
                  </p>
                  <p>
                    <strong>2.</strong> Create a new project (e.g. <em>fitness-tracker</em>).
                  </p>
                  <p>
                    <strong>3.</strong> Go to <strong>SQL Editor</strong>, paste this table script, and click <strong>Run</strong>:
                  </p>
                  <div className="relative bg-[#0F3D3E] text-white p-3 rounded-xl font-mono text-[10px] overflow-x-auto max-h-24">
                    <pre>{SUPABASE_SQL_SCHEMA}</pre>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="absolute top-2 right-2 px-2 py-1 bg-[#2A9D8F] hover:bg-[#32b5a6] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-all"
                    >
                      {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                    </button>
                  </div>
                  <p>
                    <strong>4.</strong> Go to <strong>Project Settings &rarr; API</strong>, copy <strong>Project URL</strong> and <strong>Anon Public Key</strong>, and paste them below:
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleConnectAndSync} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#0F3D3E]">Supabase Project URL</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzabcdefg.supabase.co"
                    required
                    className="w-full bg-[#FFFFFF] border border-[#2A9D8F]/30 focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F] rounded-xl px-3 py-2 text-[#0F3D3E] outline-none shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0F3D3E]">Supabase Anon (Public) Key</label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    required
                    className="w-full bg-[#FFFFFF] border border-[#2A9D8F]/30 focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F] rounded-xl px-3 py-2 text-[#0F3D3E] outline-none shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] hover:from-[#155455] hover:to-[#32b5a6] text-white rounded-xl font-bold shadow-md shadow-[#2A9D8F]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                >
                  <Cloud className="w-4 h-4" />
                  <span>
                    {isLoading
                      ? 'Connecting & Uploading...'
                      : `Connect & Upload My ${localData.length} Logs to Cloud`}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
