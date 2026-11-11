import React, { useState } from 'react';
import { Lock, Mail, Key, ShieldCheck, Database, CheckCircle2, AlertCircle, ArrowLeft, Video } from 'lucide-react';
import { SupabaseConfig } from '../../types';
import { getSupabaseClient } from '../../lib/supabase';
import { SupabaseSettingsModal } from './SupabaseSettingsModal';

interface AdminLoginPageProps {
  onSuccess: (userEmail: string, isSupabaseAuth: boolean) => void;
  supabaseConfig: SupabaseConfig;
  onUpdateSupabaseConfig: (config: SupabaseConfig) => void;
  onBackToSite: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onSuccess,
  supabaseConfig,
  onUpdateSupabaseConfig,
  onBackToSite,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const rawUrl = supabaseConfig.url || (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const rawKey = supabaseConfig.anonKey || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  const hasSupabase = Boolean(
    rawUrl &&
    !rawUrl.includes('your-project-id') &&
    rawKey &&
    !rawKey.includes('your-anon')
  );

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const client = getSupabaseClient(supabaseConfig);
    if (!client) {
      setError('Supabase is not configured. Please configure your Supabase URL and Anon Key first.');
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error: signUpErr } = await client.auth.signUp({
          email,
          password,
        });
        if (signUpErr) throw signUpErr;
        if (data.session) {
          onSuccess(email, true);
        } else {
          setSuccessMsg('Account created successfully! Please check your email to confirm registration or sign in.');
        }
      } else {
        const { error: signInErr } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;
        onSuccess(email, true);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your Supabase credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
      {/* Top Navigation Back */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onBackToSite}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Website</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white">StreamPost Admin Portal</h1>
              <p className="text-xs text-slate-400">Secure Supabase Authentication Login</p>
            </div>
          </div>
        </div>

        {/* Supabase Status Banner */}
        <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-slate-400">
              Supabase Auth:{' '}
              {hasSupabase ? (
                <span className="text-emerald-400 font-semibold">Connected</span>
              ) : (
                <span className="text-amber-400 font-medium">Not configured</span>
              )}
            </span>
          </div>
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="text-orange-400 hover:text-orange-300 font-medium cursor-pointer hover:underline text-[11px]"
          >
            Configure Supabase
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSupabaseAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@streampost.com"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSignUp ? 'Create Supabase Admin Account' : 'Sign In to Admin Panel'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer underline"
              >
                {isSignUp ? 'Already have an admin account? Sign In' : 'Need a new admin account? Register with Supabase'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Supabase Config Modal */}
      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        config={supabaseConfig}
        onSave={(newCfg) => {
          onUpdateSupabaseConfig(newCfg);
        }}
      />
    </div>
  );
};
