'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Key, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingMagic, setIsLoadingMagic] = useState(false);
  const [isLoadingPass, setIsLoadingPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setStep(2);
  };

  const handleSendMagicLink = async () => {
    setIsLoadingMagic(true);
    setError(null);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError('Authentication client is not configured');
      setIsLoadingMagic(false);
      return;
    }

    try {
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (otpErr) {
        setError(otpErr.message || 'Failed to send magic link');
      } else {
        setMessage('✨ Magic link sent! Check your email inbox to verify.');
      }
    } catch {
      setError('An unexpected error occurred sending magic link');
    } finally {
      setIsLoadingMagic(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingPass(true);
    setError(null);
    setMessage(null);

    if (!password) {
      setError('Please enter your password');
      setIsLoadingPass(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError('Authentication client is not configured');
      setIsLoadingPass(false);
      return;
    }

    try {
      const { error: passErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (passErr) {
        setError(passErr.message || 'Invalid password or credentials');
      } else {
        setMessage('Successfully signed in!');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1000);
      }
    } catch {
      setError('An unexpected error occurred during password sign in');
    } finally {
      setIsLoadingPass(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setError(null);
    setMessage(null);
    setPassword('');
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-900 transition-colors"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h2 className="font-mono font-bold text-lg text-white">Log In</h2>
            <p className="font-body text-xs text-zinc-400">
              {step === 1 ? 'Enter your email to get started' : `Verification for ${email}`}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-400 text-xs font-sans">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: EMAIL INPUT ONLY */
          <form onSubmit={handleContinue} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
                Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-zinc-900 border-zinc-800 text-white font-sans text-xs sm:text-sm h-11 rounded-xl pl-10 focus-visible:ring-blue-500"
                  required
                  autoFocus
                />
                <Mail className="size-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs sm:text-sm h-11 shadow-lg flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </form>
        ) : (
          /* STEP 2: HYBRID SELECTION (MAGIC LINK vs PASSWORD) */
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            {/* Email pill */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
              <span className="truncate">{email}</span>
              <button
                type="button"
                onClick={handleReset}
                className="text-blue-400 hover:underline text-[11px] shrink-0 font-sans"
              >
                Change
              </button>
            </div>

            {/* Option A: Send Magic Link */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white font-sans">
                <Mail className="size-4 text-blue-400" />
                <span>Passwordless Magic Link</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-body">
                We will email you a 1-click instant verification link. No password required.
              </p>
              <Button
                type="button"
                onClick={handleSendMagicLink}
                disabled={isLoadingMagic}
                className="w-full rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-sans font-semibold text-xs h-10 flex items-center justify-center gap-2"
              >
                {isLoadingMagic ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Magic Link</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative bg-zinc-950 px-3 text-[10px] uppercase tracking-wider font-mono text-zinc-500">
                OR SIGN IN WITH PASSWORD
              </span>
            </div>

            {/* Option B: Password Login Form */}
            <form onSubmit={handlePasswordLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
                  Account Password
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-zinc-900 border-zinc-800 text-white font-sans text-xs h-10 rounded-xl pl-9 focus-visible:ring-blue-500"
                  />
                  <Key className="size-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoadingPass}
                className="w-full rounded-xl bg-white text-black hover:bg-zinc-200 font-sans font-bold text-xs h-10 flex items-center justify-center gap-2"
              >
                {isLoadingPass ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <span>Sign in with Password</span>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
