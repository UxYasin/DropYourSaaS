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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Globe, ShieldCheck, Link2, DollarSign, Tag, Share2 } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';

export interface AdminListingData {
  id?: string;
  name: string;
  url: string;
  description?: string;
  category?: string;
  bid_cents?: number;
  bid?: number;
  is_verified?: boolean;
  is_dofollow?: boolean;
  status?: string;
  twitter_handle?: string;
  favicon_url?: string;
  submitter_email?: string;
  is_for_sale?: boolean;
  asking_price?: number;
  mrr?: number;
  clicks?: number;
  real_clicks?: number;
}

interface AdminListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  listing?: AdminListingData | null;
}

export function AdminListingModal({
  isOpen,
  onClose,
  onSuccess,
  listing,
}: AdminListingModalProps) {
  const isEditing = Boolean(listing?.id);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SaaS');
  const [bidDollars, setBidDollars] = useState(1);
  const [isVerified, setIsVerified] = useState(true);
  const [isDofollow, setIsDofollow] = useState(true);
  const [status, setStatus] = useState('published');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [isForSale, setIsForSale] = useState(false);
  const [askingPrice, setAskingPrice] = useState(0);
  const [mrr, setMrr] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [realClicks, setRealClicks] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (listing) {
      setName(listing.name || '');
      setUrl(listing.url || '');
      setDescription(listing.description || '');
      setCategory(listing.category || 'SaaS');
      setBidDollars(
        listing.bid !== undefined
          ? listing.bid
          : listing.bid_cents !== undefined
          ? Math.round(listing.bid_cents / 100)
          : 1
      );
      setIsVerified(listing.is_verified ?? true);
      setIsDofollow(listing.is_dofollow ?? true);
      setStatus(listing.status || 'published');
      setTwitterHandle(listing.twitter_handle || '');
      setSubmitterEmail(listing.submitter_email || '');
      setIsForSale(Boolean(listing.is_for_sale));
      setAskingPrice(Number(listing.asking_price || 0));
      setMrr(Number(listing.mrr || 0));
      setClicks(Number(listing.clicks || 0));
      setRealClicks(Number(listing.real_clicks || 0));
    } else {
      setName('');
      setUrl('');
      setDescription('');
      setCategory('SaaS');
      setBidDollars(1);
      setIsVerified(true);
      setIsDofollow(true);
      setStatus('published');
      setTwitterHandle('');
      setSubmitterEmail('');
      setIsForSale(false);
      setAskingPrice(0);
      setMrr(0);
      setClicks(0);
      setRealClicks(0);
    }
    setError(null);
  }, [listing, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !url.trim()) {
      setError('Name and URL are required.');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && listing?.id) {
        const res = await fetch('/api/admin/listings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: listing.id,
            updates: {
              name: name.trim(),
              url: url.trim(),
              description: description.trim(),
              value_proposition: description.trim(),
              category,
              bid: bidDollars,
              is_verified: isVerified,
              is_dofollow: isDofollow,
              status,
              twitter_handle: twitterHandle ? twitterHandle.replace(/^@/, '').trim() : null,
              submitter_email: submitterEmail.trim() || null,
              is_for_sale: isForSale,
              asking_price: Number(askingPrice || 0),
              mrr: Number(mrr || 0),
              clicks: Number(clicks || 0),
              real_clicks: Number(realClicks || 0),
            },
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update listing');
      } else {
        const res = await fetch('/api/admin/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            url: url.trim(),
            description: description.trim(),
            category,
            bidAmount: bidDollars,
            is_verified: isVerified,
            is_dofollow: isDofollow,
            status,
            twitter_handle: twitterHandle ? twitterHandle.replace(/^@/, '').trim() : undefined,
            submitter_email: submitterEmail.trim() || undefined,
            is_for_sale: isForSale,
            asking_price: Number(askingPrice || 0),
            mrr: Number(mrr || 0),
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create listing');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="font-mono text-xl font-bold flex items-center gap-2">
            <Globe className="size-5 text-amber-500" />
            <span>{isEditing ? 'Edit SaaS Listing' : 'Create New SaaS Listing'}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-mono">
            {isEditing
              ? `Update rankings, bid amount, verified badge, and marketplace details for ${name || 'listing'}`
              : 'Add a new verified SaaS listing directly to the DropYourSaaS directory & leaderboard'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/15 text-destructive text-xs font-mono border border-destructive/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono font-bold">Project Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ChatSaaS AI"
                required
                className="h-9 font-mono text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono font-bold">Website URL *</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourproject.com"
                required
                className="h-9 font-mono text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-mono font-bold">One-Liner / Value Proposition</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What problem does this SaaS solve in 1 sentence?"
              rows={2}
              className="font-mono text-xs rounded-xl resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono font-bold">Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-border bg-card text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono font-bold flex items-center gap-1">
                <DollarSign className="size-3.5 text-emerald-500" />
                <span>Bid Amount ($)</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={bidDollars}
                onChange={(e) => setBidDollars(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="h-9 font-mono text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono font-bold">Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-border bg-card text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="published">Published (Live)</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="rejected">Rejected / Hidden</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono font-bold flex items-center gap-1">
                <Share2 className="size-3.5 text-sky-500" />
                <span>Twitter / X Handle</span>
              </Label>
              <Input
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@username"
                className="h-9 font-mono text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono font-bold">Founder / Contact Email</Label>
              <Input
                type="email"
                value={submitterEmail}
                onChange={(e) => setSubmitterEmail(e.target.value)}
                placeholder="founder@example.com"
                className="h-9 font-mono text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Feature Badges */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2.5">
            <div className="font-mono text-xs font-bold text-foreground">Listing Badges &amp; SEO</div>
            <div className="flex items-center gap-6 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                <Checkbox
                  checked={isVerified}
                  onCheckedChange={(checked) => setIsVerified(Boolean(checked))}
                />
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="size-3.5" />
                  Verified Badge
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                <Checkbox
                  checked={isDofollow}
                  onCheckedChange={(checked) => setIsDofollow(Boolean(checked))}
                />
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                  <Link2 className="size-3.5" />
                  Dofollow SEO Backlink
                </span>
              </label>
            </div>
          </div>

          {/* Marketplace For Sale Controls */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs font-bold flex items-center gap-1.5">
                <Tag className="size-3.5 text-amber-500" />
                <span>Marketplace: Listed for Sale?</span>
              </div>
              <Checkbox
                checked={isForSale}
                onCheckedChange={(checked) => setIsForSale(Boolean(checked))}
              />
            </div>

            {isForSale && (
              <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in-50 duration-200">
                <div className="space-y-1">
                  <Label className="text-[11px] font-mono text-muted-foreground">Asking Price ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(Number(e.target.value) || 0)}
                    placeholder="15000"
                    className="h-8 font-mono text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-mono text-muted-foreground">Monthly Recurring Revenue MRR ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={mrr}
                    onChange={(e) => setMrr(Number(e.target.value) || 0)}
                    placeholder="1200"
                    className="h-8 font-mono text-xs rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Click Telemetry Override (if editing) */}
          {isEditing && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-muted/20 border border-border/80 text-xs font-mono">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Real User Clicks</Label>
                <Input
                  type="number"
                  min="0"
                  value={realClicks}
                  onChange={(e) => setRealClicks(Number(e.target.value) || 0)}
                  className="h-8 font-mono text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Total Public Clicks</Label>
                <Input
                  type="number"
                  min="0"
                  value={clicks}
                  onChange={(e) => setClicks(Number(e.target.value) || 0)}
                  className="h-8 font-mono text-xs rounded-xl"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 rounded-xl font-mono text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-9 rounded-xl font-mono text-xs font-bold bg-[#FFFC00] hover:bg-[#FFFC00]/90 text-black shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Listing'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
