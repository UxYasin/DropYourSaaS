'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Sparkles, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CongratulationsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CongratulationsModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
}: CongratulationsModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (searchParams.get('verified') === 'true') {
      setInternalIsOpen(true);
      router.refresh();
    } else if (propIsOpen) {
      setInternalIsOpen(true);
    } else if (propIsOpen === false) {
      setInternalIsOpen(false);
    }
  }, [searchParams, propIsOpen, router]);

  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

  if (!isOpen || !mounted) return null;

  const handleClose = () => {
    if (propOnClose) propOnClose();
    setInternalIsOpen(false);
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
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-card border border-border/80 text-foreground rounded-3xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden z-10 animate-in zoom-in-95 duration-200 space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        {/* Glowing Badge */}
        <div className="size-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-[0_0_28px_rgba(0,102,255,0.3)] shrink-0">
          <CheckCircle2 className="size-8 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs">
            <Sparkles className="size-3.5" />
            <span>Listing Verified</span>
          </div>
          <h2 className="font-mono font-extrabold text-xl sm:text-2xl text-foreground tracking-tight">
            Congratulations! Your SaaS is live.
          </h2>
          <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Your submission has been verified and your account has been automatically created.
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <Button
            onClick={handleClose}
            className="w-full rounded-full bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs sm:text-sm h-12 shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <span>Check out your product listing</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
