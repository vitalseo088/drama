import React, { useState } from 'react';
import { X, Lock, Mail, Key, ShieldCheck, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { SupabaseConfig } from '../../types';
import { getSupabaseClient } from '../../lib/supabase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userEmail: string, isSupabaseAuth: boolean) => void;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseConfig: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  supabaseConfig,
  onOpenSupabaseConfig,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasSupabase = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const client = getSupabaseClient(supabaseConfig);
    if (!client) {
      setError('Supabase is not configured yet. You can use Quick Demo Admin or enter Supabase credentials.');
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
          onClose();
        } else {
          setSuccessMsg('Account created! Please check your email to confirm registration or sign in.');
        }
      } else {
        const { error: signInErr } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;
        onSuccess(email, true);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onSuccess('admin@streampost.local', false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">Admin Panel Access</h3>
              <p className="text-xs text-slate-400">Manage video posts, adsterra smartlinks & settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase Status Banner */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600">
              Supabase Auth:{' '}
              {hasSupabase ? (
                <span className="text-emerald-600 font-semibold">Configured</span>
              ) : (
                <span className="text-amber-600 font-medium">Demo Mode (Keys optional)</span>
              )}
            </span>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenSupabaseConfig();
            }}
            className="text-orange-600 hover:text-orange-700 font-medium cursor-pointer hover:underline text-[11px]"
          >
            Config Supabase
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1-Click Instant Evaluation Demo Admin Button */}
          <div className="mb-5 p-4 bg-orange-50/70 border border-orange-200 rounded-xl text-center">
            <p className="text-xs text-slate-700 font-medium mb-2.5">
              Instant evaluation mode available without requiring credentials:
            </p>
            <button
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>1-Click Instant Admin Login</span>
            </button>
          </div>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-3 bg-white text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              Or Sign In with Supabase Auth
            </span>
          </div>

          {/* Supabase Email/Password Form */}
          <form onSubmit={handleSupabaseAuth} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{isSignUp ? 'Create Supabase Admin Account' : 'Sign In via Supabase'}</span>
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer underline"
              >
                {isSignUp ? 'Already registered? Sign In' : 'Need an account? Register with Supabase'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
