'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminPlaceAdModal } from '@/components/admin-place-ad-modal';
import { formatSlotLabel } from '@/components/pin-ad-modal';
import {
  Pin,
  ExternalLink,
  Mail,
  LogOut,
  Sun,
  Moon,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Send,
  Plus,
  Trash2,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdRequest {
  id: string;
  site_url: string;
  project_name: string;
  one_liner: string;
  contact_email: string;
  slot_position: string;
  status: 'pending' | 'invoiced' | 'active' | 'rejected';
  created_at: string;
}

interface PinnedAd {
  id: string;
  site_url: string;
  project_name: string;
  one_liner: string;
  logo_url?: string;
  slot_position: string;
  contact_email?: string;
  duration_days: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [pinnedAds, setPinnedAds] = useState<PinnedAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'active_ads'>('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Place Ad Modal State
  const [placeModalState, setPlaceModalState] = useState<{
    isOpen: boolean;
    slotPosition?: string;
    siteUrl?: string;
    projectName?: string;
    oneLiner?: string;
    contactEmail?: string;
  }>({ isOpen: false });

  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [resReq, resPinned] = await Promise.all([
        fetch('/api/admin/ads'),
        fetch('/api/admin/ads/place'),
      ]);

      if (resReq.status === 401 || resPinned.status === 401) {
        router.push('/admin/login');
        return;
      }

      const dataReq = await resReq.json();
      if (resReq.ok && Array.isArray(dataReq.requests)) {
        setRequests(dataReq.requests);
      }

      const dataPinned = await resPinned.json();
      if (resPinned.ok && Array.isArray(dataPinned.pinnedAds)) {
        setPinnedAds(dataPinned.pinnedAds);
      }
    } catch {
      // network error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r))
        );
      }
    } catch {} finally {
      setUpdatingId(null);
    }
  };

  const handleRemovePinnedAd = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate and remove this pinned ad?')) return;
    try {
      const res = await fetch(`/api/admin/ads/place?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPinnedAds((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {}
  };

  const createMailtoLink = (req: AdRequest) => {
    const slotText = formatSlotLabel(req.slot_position || 'left_1');
    const subject = encodeURIComponent(`Your DropYourSaaS Ad Spot (${slotText}) is Approved!`);
    const body = encodeURIComponent(
      `Hi ${req.project_name},\n\n` +
        `Great news! Your spot request for ${req.site_url} on DropYourSaaS for position ${slotText} has been reviewed and approved.\n\n` +
        `Please complete your payment of $100 for 30 days of featured sidebar placement:\n` +
        `https://creem.io/checkout/...\n\n` +
        `Once paid, your ad will go live on the sidebar immediately.\n\n` +
        `Best regards,\n` +
        `The DropYourSaaS Team`
    );
    return `mailto:${req.contact_email}?subject=${subject}&body=${body}`;
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.site_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.slot_position && r.slot_position.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPinnedAds = pinnedAds.filter((p) => {
    return (
      p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.site_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.slot_position && p.slot_position.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const statusBadge = (status: AdRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/30">
            Pending Review
          </Badge>
        );
      case 'invoiced':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-400/30">
            Invoiced
          </Badge>
        );
      case 'active':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/30">
            Active Pin
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-400/30">
            Rejected
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-bold shadow-xs">
            <Pin className="size-4 fill-current" />
          </div>
          <div>
            <h1 className="font-mono font-bold text-base sm:text-lg tracking-tight">
              Admin Ad Manager
            </h1>
            <p className="text-[11px] text-muted-foreground font-mono">
              DropYourSaaS · Ad Requests & Active Rail Pins
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Place an Ad Button */}
          <Button
            onClick={() => setPlaceModalState({ isOpen: true })}
            className="h-9 gap-1.5 rounded-xl font-mono text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Place an Ad</span>
          </Button>

          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="size-9 p-0 rounded-xl cursor-pointer"
            title="Toggle Light / Dark mode"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="h-9 gap-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Total Inquiries
              </span>
              <Pin className="size-4 text-blue-500" />
            </div>
            <div className="text-2xl font-mono font-black mt-2">{requests.length}</div>
          </Card>

          <Card className="rounded-2xl border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Pending Review
              </span>
              <Clock className="size-4 text-amber-500" />
            </div>
            <div className="text-2xl font-mono font-black text-amber-500 mt-2">
              {requests.filter((r) => r.status === 'pending').length}
            </div>
          </Card>

          <Card className="rounded-2xl border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Invoiced
              </span>
              <Send className="size-4 text-blue-500" />
            </div>
            <div className="text-2xl font-mono font-black text-blue-500 mt-2">
              {requests.filter((r) => r.status === 'invoiced').length}
            </div>
          </Card>

          <Card className="rounded-2xl border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Active Rail Pins
              </span>
              <Sparkles className="size-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-mono font-black text-emerald-500 mt-2">
              {pinnedAds.length}
            </div>
          </Card>
        </div>

        {/* Tab Switcher: Requests vs Active Pins */}
        <div className="flex items-center justify-between gap-4 border-b border-border pb-3 flex-wrap">
          <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer',
                activeTab === 'requests'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Spot Inquiries ({requests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('active_ads')}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'active_ads'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Pin className="size-3.5 text-blue-500 fill-current" />
              <span>Active Pinned Ads ({pinnedAds.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name, URL, slot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 h-9 rounded-xl border border-border bg-card text-xs focus:outline-none"
              />
            </div>

            {activeTab === 'requests' && (
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs hidden md:flex">
                <SlidersHorizontal className="size-3 text-muted-foreground ml-1" />
                {['all', 'pending', 'invoiced', 'active'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={cn(
                      'px-2.5 py-0.5 rounded-md font-bold capitalize transition-all cursor-pointer text-[11px]',
                      statusFilter === st
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="size-9 p-0 rounded-xl cursor-pointer"
              title="Refresh data"
            >
              <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* TAB 1: SPOT INQUIRIES */}
        {activeTab === 'requests' && (
          <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-4">Requested Slot</th>
                    <th className="p-4">Product Name & URL</th>
                    <th className="p-4">One-Liner</th>
                    <th className="p-4">Contact Email</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground font-mono">
                        Loading ad inquiries...
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground font-mono">
                        No spot inquiries found.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        {/* Requested Slot */}
                        <td className="p-4 font-mono font-bold">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px]">
                            <Pin className="size-3 fill-current" />
                            <span>{formatSlotLabel(req.slot_position || 'left_1')}</span>
                          </span>
                        </td>

                        {/* Name & URL */}
                        <td className="p-4 font-medium">
                          <div className="font-bold text-foreground text-sm font-mono">
                            {req.project_name}
                          </div>
                          <a
                            href={req.site_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <span className="truncate max-w-[160px]">{req.site_url}</span>
                            <ExternalLink className="size-3" />
                          </a>
                        </td>

                        {/* One Liner */}
                        <td className="p-4 max-w-[220px]">
                          <p className="line-clamp-2 leading-relaxed text-muted-foreground">
                            {req.one_liner}
                          </p>
                        </td>

                        {/* Contact Email */}
                        <td className="p-4 font-mono text-foreground">
                          <a
                            href={`mailto:${req.contact_email}`}
                            className="hover:underline flex items-center gap-1.5"
                          >
                            <Mail className="size-3.5 text-muted-foreground" />
                            <span>{req.contact_email}</span>
                          </a>
                        </td>

                        {/* Status */}
                        <td className="p-4">{statusBadge(req.status)}</td>

                        {/* Date */}
                        <td className="p-4 font-mono text-muted-foreground text-[11px]">
                          {new Date(req.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Publish Pin Direct Action */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPlaceModalState({
                                  isOpen: true,
                                  slotPosition: req.slot_position || 'left_1',
                                  siteUrl: req.site_url,
                                  projectName: req.project_name,
                                  oneLiner: req.one_liner,
                                  contactEmail: req.contact_email,
                                });
                              }}
                              className="h-8 px-2.5 rounded-xl font-mono text-[11px] font-bold border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                              title="Directly assign and publish to pinned ads"
                            >
                              <Plus className="size-3" />
                              <span>Publish</span>
                            </Button>

                            {/* Send Invoice Email Button */}
                            <a
                              href={createMailtoLink(req)}
                              onClick={() => {
                                if (req.status === 'pending') {
                                  handleStatusChange(req.id, 'invoiced');
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-[11px] inline-flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                              title="Send pre-filled payment link invoice email"
                            >
                              <Send className="size-3" />
                              <span>Invoice</span>
                            </a>

                            {/* Status Selector */}
                            <select
                              value={req.status}
                              disabled={updatingId === req.id}
                              onChange={(e) => handleStatusChange(req.id, e.target.value)}
                              className="h-8 px-2 rounded-xl border border-border bg-card text-[11px] font-mono font-semibold text-foreground focus:outline-none cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="invoiced">Invoiced</option>
                              <option value="active">Active</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 2: ACTIVE PINNED ADS */}
        {activeTab === 'active_ads' && (
          <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-4">Locked Slot</th>
                    <th className="p-4">Product & URL</th>
                    <th className="p-4">One-Liner</th>
                    <th className="p-4">Customer Email</th>
                    <th className="p-4">Duration / Expires</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground font-mono">
                        Loading active pinned ads...
                      </td>
                    </tr>
                  ) : filteredPinnedAds.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground font-mono">
                        No active rail pinned ads right now. Click "+ Place an Ad" to feature a sponsor spot!
                      </td>
                    </tr>
                  ) : (
                    filteredPinnedAds.map((pinned) => (
                      <tr key={pinned.id} className="hover:bg-muted/30 transition-colors">
                        {/* Locked Slot */}
                        <td className="p-4 font-mono font-bold">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs">
                            <Pin className="size-3.5 fill-current" />
                            <span>{formatSlotLabel(pinned.slot_position)}</span>
                          </span>
                        </td>

                        {/* Product & URL */}
                        <td className="p-4 font-medium">
                          <div className="font-bold text-foreground text-sm font-mono">
                            {pinned.project_name}
                          </div>
                          <a
                            href={pinned.site_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <span className="truncate max-w-[180px]">{pinned.site_url}</span>
                            <ExternalLink className="size-3" />
                          </a>
                        </td>

                        {/* One Liner */}
                        <td className="p-4 max-w-[240px]">
                          <p className="line-clamp-2 leading-relaxed text-muted-foreground">
                            {pinned.one_liner}
                          </p>
                        </td>

                        {/* Customer Email */}
                        <td className="p-4 font-mono text-foreground">
                          {pinned.contact_email ? (
                            <a
                              href={`mailto:${pinned.contact_email}`}
                              className="hover:underline flex items-center gap-1.5"
                            >
                              <Mail className="size-3.5 text-muted-foreground" />
                              <span>{pinned.contact_email}</span>
                            </a>
                          ) : (
                            <span className="text-muted-foreground italic">N/A</span>
                          )}
                        </td>

                        {/* Duration & Expiration */}
                        <td className="p-4 font-mono text-xs">
                          <div className="font-bold text-foreground">
                            {pinned.duration_days} Days
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            Expires:{' '}
                            {new Date(pinned.expires_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemovePinnedAd(pinned.id)}
                            className="h-8 px-3 rounded-xl font-mono text-xs font-bold border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer gap-1"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Remove</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* Admin Place an Ad Modal */}
      <AdminPlaceAdModal
        isOpen={placeModalState.isOpen}
        onClose={() => setPlaceModalState({ isOpen: false })}
        onSuccess={fetchDashboardData}
        defaultSlotPosition={placeModalState.slotPosition}
        defaultSiteUrl={placeModalState.siteUrl}
        defaultProjectName={placeModalState.projectName}
        defaultOneLiner={placeModalState.oneLiner}
        defaultContactEmail={placeModalState.contactEmail}
      />
    </div>
  );
}
