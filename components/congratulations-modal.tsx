'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, CheckCircle2, X, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CongratulationsModal({ isOpen, onClose }: CongratulationsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleCheckListing = () => {
    onClose();

    // Clean query params cleanly without page reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('verified');
      window.history.replaceState({}, '', url.pathname + url.search);

      // Smoothly scroll down to feed
      const feedElement = document.querySelector('#index-feed') || document.querySelector('.mt-8');
      if (feedElement) {
        feedElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden z-10 animate-in zoom-in-95 duration-200 space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-900 transition-colors"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        {/* Glowing Badge */}
        <div className="size-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_28px_rgba(0,102,255,0.3)] shrink-0">
          <CheckCircle2 className="size-8 text-blue-400" />
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold text-xs">
            <Sparkles className="size-3.5" />
            <span>Listing Verified</span>
          </div>
          <h2 className="font-mono font-extrabold text-xl sm:text-2xl text-white tracking-tight">
            Congratulations! Your SaaS is live.
          </h2>
          <p className="font-body text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Your submission has been verified and your account has been automatically created.
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={handleCheckListing}
            className="w-full rounded-full bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs sm:text-sm h-12 shadow-lg flex items-center justify-center gap-2"
          >
            <span>Check out your product listing</span>
            <ArrowDown className="size-4" />
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
