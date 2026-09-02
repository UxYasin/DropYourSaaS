'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Sparkles, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CongratulationsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  rank?: number;
}

export function CongratulationsModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  title: propTitle,
  rank: propRank,
}: CongratulationsModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [modalDetails, setModalDetails] = useState<{
    title?: string;
    rank?: number;
    type?: 'verified_boost' | 'pinned_ad' | 'free_listing';
    slot?: string;
  }>({
    title: propTitle,
    rank: propRank || 1,
    type: 'free_listing',
  });
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const isVerifiedParam = searchParams.get('verified') === 'true';
    const isPaymentSuccess = searchParams.get('payment') === 'success' || searchParams.get('success') === 'true';
    const slotParam = searchParams.get('slot');

    if (isVerifiedParam || isPaymentSuccess || slotParam) {
      setModalDetails({
        type: slotParam ? 'pinned_ad' : 'verified_boost',
        slot: slotParam || undefined,
        rank: 1,
      });
      setInternalIsOpen(true);
      router.refresh();
    } else if (propIsOpen) {
      setInternalIsOpen(true);
    } else if (propIsOpen === false) {
      setInternalIsOpen(false);
    }

    const handleCustomCongrats = (e: Event) => {
      const customEvent = e as CustomEvent<{ title?: string; rank?: number; url?: string; type?: 'verified_boost' | 'pinned_ad' | 'free_listing' }>;
      if (customEvent.detail) {
        setModalDetails({
          title: customEvent.detail.title,
          rank: customEvent.detail.rank || 1,
          type: customEvent.detail.type || 'free_listing',
        });
      }
      setInternalIsOpen(true);
    };

    window.addEventListener('show-congratulations', handleCustomCongrats);
    return () => {
      window.removeEventListener('show-congratulations', handleCustomCongrats);
    };
  }, [searchParams, propIsOpen, router]);

  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

  if (!isOpen || !mounted) return null;

  const isVerifiedBoost = modalDetails.type === 'verified_boost';
  const isPinnedAd = modalDetails.type === 'pinned_ad';

  const handleClose = () => {
    if (propOnClose) propOnClose();
    setInternalIsOpen(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('verified');
      url.searchParams.delete('payment');
      url.searchParams.delete('success');
      url.searchParams.delete('slot');
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
      <div className="relative w-full max-w-md bg-white dark:bg-[#181a1e] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden z-10 animate-in zoom-in-95 duration-200 space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        {/* Glowing Badge */}
        <div className={`size-16 mx-auto rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
          isVerifiedBoost
            ? 'bg-primary/15 border border-primary/30 text-primary shadow-primary/20'
            : isPinnedAd
            ? 'bg-accent/15 border border-accent/30 text-accent shadow-accent/20'
            : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/20'
        }`}>
          <CheckCircle2 className="size-8" />
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-sans font-bold text-xs ${
            isVerifiedBoost
              ? 'bg-primary/10 text-primary border-primary/20'
              : isPinnedAd
              ? 'bg-accent/10 text-accent border-accent/20'
              : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
          }`}>
            <Sparkles className="size-3.5" />
            <span>
              {isVerifiedBoost
                ? '⚡ Fast-Track Verified'
                : isPinnedAd
                ? '📌 Sponsor Ad Confirmed'
                : `Listing Published · Spot #${modalDetails.rank || 1}`}
            </span>
          </div>

          <h2 className="font-heading font-bold text-xl sm:text-2xl text-zinc-900 dark:text-white tracking-tight">
            {isVerifiedBoost
              ? 'Payment Confirmed! Your SaaS is Verified.'
              : isPinnedAd
              ? 'Payment Confirmed! Your Ad is Live.'
              : modalDetails.title
              ? `“${modalDetails.title}” is live!`
              : 'Congratulations! Your SaaS is live.'}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {isVerifiedBoost
              ? 'Your $5 Fast-Track has been processed. Your dofollow backlink and verified checkmark badge are now live on DropYourSaaS.'
              : isPinnedAd
              ? 'Your side-rail sponsor ad slot is now active and pinned on DropYourSaaS.'
              : `Your SaaS has been successfully published to DropYourSaaS at Spot #${modalDetails.rank || 1}.`}
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <Button
            onClick={handleClose}
            className={`w-full rounded-full text-white font-sans font-bold text-xs sm:text-sm h-12 shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isVerifiedBoost
                ? 'bg-primary hover:bg-[#76439c]'
                : isPinnedAd
                ? 'bg-accent hover:bg-[#b88258]'
                : 'bg-primary hover:bg-[#76439c]'
            }`}
          >
            <span>{isPinnedAd ? 'View Your Active Ad Spot' : 'Check out your product listing'}</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
