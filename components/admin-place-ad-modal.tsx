'use client';

import React, { useState } from 'react';
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
import { Pin, CheckCircle2 } from 'lucide-react';
import { formatSlotLabel } from '@/components/pin-ad-modal';

interface AdminPlaceAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultSlotPosition?: string;
  defaultSiteUrl?: string;
  defaultProjectName?: string;
  defaultOneLiner?: string;
  defaultContactEmail?: string;
}

const SLOT_OPTIONS = [
  { value: 'left_1', label: 'Left Rail • Slot #1' },
  { value: 'left_2', label: 'Left Rail • Slot #2' },
  { value: 'left_3', label: 'Left Rail • Slot #3' },
  { value: 'left_4', label: 'Left Rail • Slot #4' },
  { value: 'left_5', label: 'Left Rail • Slot #5' },
  { value: 'right_1', label: 'Right Rail • Slot #1' },
  { value: 'right_2', label: 'Right Rail • Slot #2' },
  { value: 'right_3', label: 'Right Rail • Slot #3' },
  { value: 'right_4', label: 'Right Rail • Slot #4' },
  { value: 'right_5', label: 'Right Rail • Slot #5' },
];

const DURATION_OPTIONS = [
  { days: 7, label: '7 Days' },
  { days: 14, label: '14 Days' },
  { days: 30, label: '30 Days (Standard)' },
  { days: 60, label: '60 Days' },
  { days: 90, label: '90 Days' },
];

export function AdminPlaceAdModal({
  isOpen,
  onClose,
  onSuccess,
  defaultSlotPosition = 'left_1',
  defaultSiteUrl = '',
  defaultProjectName = '',
  defaultOneLiner = '',
  defaultContactEmail = '',
}: AdminPlaceAdModalProps) {
  const [siteUrl, setSiteUrl] = useState(defaultSiteUrl);
  const [projectName, setProjectName] = useState(defaultProjectName);
  const [oneLiner, setOneLiner] = useState(defaultOneLiner);
  const [contactEmail, setContactEmail] = useState(defaultContactEmail);
  const [slotPosition, setSlotPosition] = useState(defaultSlotPosition);
  const [durationDays, setDurationDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (defaultSlotPosition) setSlotPosition(defaultSlotPosition);
    if (defaultSiteUrl) setSiteUrl(defaultSiteUrl);
    if (defaultProjectName) setProjectName(defaultProjectName);
    if (defaultOneLiner) setOneLiner(defaultOneLiner);
    if (defaultContactEmail) setContactEmail(defaultContactEmail);
  }, [
    defaultSlotPosition,
    defaultSiteUrl,
    defaultProjectName,
    defaultOneLiner,
    defaultContactEmail,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!siteUrl.trim() || !projectName.trim() || !oneLiner.trim() || !slotPosition) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/ads/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_url: siteUrl.trim(),
          project_name: projectName.trim(),
          one_liner: oneLiner.trim(),
          contact_email: contactEmail.trim(),
          slot_position: slotPosition,
          duration_days: durationDays,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to publish pinned ad.');
      }
    } catch {
      setErrorMsg('An unexpected network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-card text-foreground border border-border shadow-xl">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono border border-blue-500/20">
            <Pin className="size-3.5 fill-current" />
            <span>ADMIN PUBLISHER</span>
          </div>
          <DialogTitle className="text-2xl font-mono font-extrabold tracking-tight">
            Place an Active Pinned Ad
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Directly assign a sponsored ad to a specific rail slot position with custom duration tracking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/15 text-destructive text-xs font-medium border border-destructive/30">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 text-left">
              <Label htmlFor="admin_slot" className="text-xs font-bold">
                Target Slot Position
              </Label>
              <select
                id="admin_slot"
                value={slotPosition}
                onChange={(e) => setSlotPosition(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40 text-xs font-mono font-bold text-foreground focus:outline-none cursor-pointer"
              >
                {SLOT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-left">
              <Label htmlFor="admin_duration" className="text-xs font-bold">
                Ad Duration
              </Label>
              <select
                id="admin_duration"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40 text-xs font-mono font-bold text-foreground focus:outline-none cursor-pointer"
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.days} value={opt.days}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1 text-left">
            <Label htmlFor="admin_site_url" className="text-xs font-bold">
              Site URL
            </Label>
            <Input
              id="admin_site_url"
              type="url"
              placeholder="https://yourproduct.com"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              required
              className="h-10 rounded-xl border-border bg-muted/40 text-xs"
            />
          </div>

          <div className="space-y-1 text-left">
            <Label htmlFor="admin_project_name" className="text-xs font-bold">
              Product Name
            </Label>
            <Input
              id="admin_project_name"
              type="text"
              placeholder="Invoice Mama"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="h-10 rounded-xl border-border bg-muted/40 text-xs"
            />
          </div>

          <div className="space-y-1 text-left">
            <Label htmlFor="admin_one_liner" className="text-xs font-bold">
              One-liner / Tagline
            </Label>
            <Textarea
              id="admin_one_liner"
              rows={2}
              placeholder="Free invoices for contractors and freelancers."
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              required
              className="rounded-xl border-border bg-muted/40 text-xs resize-none"
            />
          </div>

          <div className="space-y-1 text-left">
            <Label htmlFor="admin_contact_email" className="text-xs font-bold">
              Customer Email (Optional)
            </Label>
            <Input
              id="admin_contact_email"
              type="email"
              placeholder="customer@example.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="h-10 rounded-xl border-border bg-muted/40 text-xs"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 mt-2 rounded-xl font-mono font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-md cursor-pointer"
          >
            {isSubmitting ? 'Publishing...' : `Publish Pinned Ad to ${formatSlotLabel(slotPosition)} (${durationDays} Days)`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
