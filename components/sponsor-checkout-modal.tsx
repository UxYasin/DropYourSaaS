'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SponsorCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  slotTitle?: string;
}

export function SponsorCheckoutModal({
  isOpen,
  onClose,
  defaultEmail = '',
  slotTitle = 'Side-Panel Sponsor Slot',
}: SponsorCheckoutModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok && (data.url || data.checkout_url)) {
        window.location.href = data.url || data.checkout_url;
      } else {
        setError(data.error || 'Failed to create Creem checkout session');
        setIsLoading(false);
      }
    } catch {
      setError('A network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        <div className="space-y-2">
          <div className="size-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Zap className="size-6 fill-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Rent {slotTitle}
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Enter your email below to complete checkout via Creem.io and activate your 30-day sponsor placement.
          </p>
        </div>

        <form onSubmit={handleCheckout} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-zinc-300">
              Your Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@yourcompany.com"
              disabled={isLoading}
              className="w-full h-11 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
            <span>Secure 256-bit encrypted checkout powered by Creem.io</span>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-white" />
                  <span>Redirecting to Creem...</span>
                </>
              ) : (
                <span>Proceed to Checkout</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
