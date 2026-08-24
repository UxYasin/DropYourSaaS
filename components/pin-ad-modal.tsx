'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pin, Sparkles, CheckCircle2 } from 'lucide-react';

interface PinAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotPosition?: string; // e.g. 'left_1', 'left_3', 'right_2'
  defaultSiteUrl?: string;
  defaultProjectName?: string;
}

export function formatSlotLabel(slot: string = 'left_1') {
  const parts = slot.split('_');
  if (parts.length === 2) {
    const side = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return `${side} Rail • Slot #${parts[1]}`;
  }
  return slot;
}

export function PinAdModal({
  isOpen,
  onClose,
  slotPosition = 'left_1',
  defaultSiteUrl = '',
  defaultProjectName = '',
}: PinAdModalProps) {
  const [siteUrl, setSiteUrl] = useState(defaultSiteUrl);
  const [projectName, setProjectName] = useState(defaultProjectName);
  const [oneLiner, setOneLiner] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (defaultSiteUrl) setSiteUrl(defaultSiteUrl);
    if (defaultProjectName) setProjectName(defaultProjectName);
  }, [defaultSiteUrl, defaultProjectName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!siteUrl.trim() || !projectName.trim() || !oneLiner.trim() || !contactEmail.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/ads/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_url: siteUrl.trim(),
          project_name: projectName.trim(),
          one_liner: oneLiner.trim(),
          contact_email: contactEmail.trim(),
          slot_position: slotPosition,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(data.error || 'Failed to submit ad request. Please try again.');
      }
    } catch {
      setErrorMsg('An unexpected network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setErrorMsg('');
    setOneLiner('');
    setContactEmail('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleReset()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card text-foreground border border-border shadow-xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono border border-blue-500/20">
              <Pin className="size-3.5 fill-current" />
              <span>{formatSlotLabel(slotPosition)}</span>
            </div>
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight">
            Grab a spot
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Paste your URL, name, and one-liner. We will review your spot request for{' '}
            <span className="font-bold text-foreground font-mono">{formatSlotLabel(slotPosition)}</span> and send a payment link.
          </DialogDescription>
        </DialogHeader>

        {/* Large Price Tag Banner */}
        <div className="my-2 p-4 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 block uppercase tracking-wider">
              30-Day Sidebar Pin ({formatSlotLabel(slotPosition)})
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-black text-blue-600 dark:text-blue-400 tracking-tight">
              $100 <span className="text-sm font-normal text-muted-foreground">for 30 days</span>
            </span>
          </div>
          <Sparkles className="size-7 text-blue-500 animate-pulse" />
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="size-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-mono">Spot Requested!</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Thank you! We received your request for <span className="font-bold text-foreground">{formatSlotLabel(slotPosition)}</span>. Our team will review your submission and email a payment link to <span className="font-semibold text-foreground">{contactEmail}</span>.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleReset}
              className="w-full mt-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-1">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-destructive/15 text-destructive text-xs font-medium border border-destructive/30">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <Label htmlFor="site_url" className="text-xs font-bold text-foreground">
                Site URL
              </Label>
              <Input
                id="site_url"
                type="url"
                placeholder="https://yourproduct.com"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                required
                className="h-10 rounded-xl border-border bg-muted/40 text-xs"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label htmlFor="project_name" className="text-xs font-bold text-foreground">
                Product Name
              </Label>
              <Input
                id="project_name"
                type="text"
                placeholder="Invoice Mama"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="h-10 rounded-xl border-border bg-muted/40 text-xs"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label htmlFor="one_liner" className="text-xs font-bold text-foreground">
                One-liner Description
              </Label>
              <Textarea
                id="one_liner"
                rows={2}
                placeholder="Free invoices for contractors and freelancers."
                value={oneLiner}
                onChange={(e) => setOneLiner(e.target.value)}
                required
                className="rounded-xl border-border bg-muted/40 text-xs resize-none"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label htmlFor="contact_email" className="text-xs font-bold text-foreground">
                Contact Email
              </Label>
              <Input
                id="contact_email"
                type="email"
                placeholder="you@company.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="h-10 rounded-xl border-border bg-muted/40 text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 mt-3 rounded-2xl font-mono font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : `Request Spot (${formatSlotLabel(slotPosition)}) • $100`}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
