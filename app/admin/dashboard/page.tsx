'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminPlaceAdModal } from '@/components/admin-place-ad-modal';
import { AdminListingModal, AdminListingData } from '@/components/admin-listing-modal';
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
  Sparkles,
  BarChart3,
  Users,
  Bot,
  Zap,
  Globe,
  DollarSign,
  ShieldCheck,
  Link2,
  Tag,
  Share2,
  Database,
  CheckCircle2,
  AlertCircle,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminStatsOverview } from '@/lib/stats-engine';

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

interface BidRecord {
  id: string;
  entry_url: string;
  entry_name: string;
  amount_cents: number;
  polar_checkout_id?: string;
  status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'listings' | 'requests' | 'active_ads' | 'bids' | 'system'>('stats');
  
  // Data States
  const [adminStats, setAdminStats] = useState<AdminStatsOverview | null>(null);
  const [listings, setListings] = useState<AdminListingData[]>([]);
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [pinnedAds, setPinnedAds] = useState<PinnedAd[]>([]);
  const [bidsData, setBidsData] = useState<{ bids: BidRecord[]; stats: { totalGrossUsd: number; paidCount: number; pendingCount: number; failedCount: number; totalOrders: number } } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');

  // Modals
  const [listingModalState, setListingModalState] = useState<{ isOpen: boolean; listing?: AdminListingData | null }>({ isOpen: false });
  const [placeModalState, setPlaceModalState] = useState<{
    isOpen: boolean;
    slotPosition?: string;
    siteUrl?: string;
    projectName?: string;
    oneLiner?: string;
    contactEmail?: string;
  }>({ isOpen: false });

  // Twitter status
  const [twitterConfig, setTwitterConfig] = useState<{ configured: boolean } | null>(null);

  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setStatusNotification({ type, message });
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [resStats, resListings, resReq, resPinned, resBids, resTwitter] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/listings'),
        fetch('/api/admin/ads'),
        fetch('/api/admin/ads/place'),
        fetch('/api/admin/bids'),
        fetch('/api/admin/twitter/test'),
      ]);

      if (resStats.status === 401 || resListings.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (resStats.ok) {
        const data = await resStats.json();
        setAdminStats(data);
      }

      if (resListings.ok) {
        const data = await resListings.json();
        setListings(data.listings || []);
      }

      if (resReq.ok) {
        const data = await resReq.json();
        setRequests(data.requests || []);
      }

      if (resPinned.ok) {
        const data = await resPinned.json();
        setPinnedAds(data.pinnedAds || []);
      }

      if (resBids.ok) {
        const data = await resBids.json();
        setBidsData(data);
      }

      if (resTwitter.ok) {
        const data = await resTwitter.json();
        setTwitterConfig(data);
      }
    } catch {
      showNotification('Network error loading admin dashboard data', 'error');
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

  // --- ACTIONS ---

  // 1. Simulation Bot Tick
  const handleTriggerBotClick = async () => {
    setActionLoading('bot-tick');
    try {
      const res = await fetch('/api/admin/stats', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.stats) {
        setAdminStats(data.stats);
        showNotification('🤖 Organic traffic & click simulation tick executed successfully!');
      }
    } catch {
      showNotification('Error triggering simulation tick.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 2. Cache Flush
  const handleFlushCache = async () => {
    setActionLoading('cache-flush');
    try {
      const res = await fetch('/api/admin/cache/flush', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showNotification('⚡ Upstash Redis cache flushed! Site is live syncing with Postgres.');
        await fetchDashboardData();
      } else {
        showNotification(data.error || 'Failed to flush cache', 'error');
      }
    } catch {
      showNotification('Error flushing cache', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 3. Test X/Twitter
  const handleTestTwitter = async () => {
    setActionLoading('twitter-test');
    try {
      const res = await fetch('/api/admin/twitter/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: 'DropYourSaaS',
          siteUrl: 'https://www.dropyoursaas.com',
          tagline: 'Leaderboard #1 outbid verification live test',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('🐦 Test tweet posted to X successfully!');
      } else {
        showNotification(data.error || 'Failed to post tweet. Check X credentials.', 'error');
      }
    } catch {
      showNotification('Error contacting Twitter API', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 4. Update Listing Inline Badges / Status
  const handleQuickUpdateListing = async (id: string, updates: Record<string, unknown>) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });
      if (res.ok) {
        setListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        );
        showNotification('Listing updated & cache invalidated.');
      }
    } catch {
      showNotification('Failed to update listing', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 5. Delete Listing
  const handleDeleteListing = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from the directory?`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/listings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setListings((prev) => prev.filter((item) => item.id !== id));
        showNotification(`Listing "${name}" deleted.`);
      }
    } catch {
      showNotification('Failed to delete listing', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 6. Ad Request Status Update
  const handleAdRequestStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id);
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
        showNotification(`Ad request marked as ${newStatus}.`);
      }
    } catch {
      showNotification('Failed to update ad request', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 7. Remove Pinned Ad
  const handleRemovePinnedAd = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate and remove this pinned ad?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/ads/place?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPinnedAds((prev) => prev.filter((p) => p.id !== id));
        showNotification('Pinned ad removed successfully.');
      }
    } catch {
      showNotification('Failed to remove pinned ad', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 8. Mailto link for Ad Request
  const createMailtoLink = (req: AdRequest) => {
    const slotText = formatSlotLabel(req.slot_position || 'left_1');
    const subject = encodeURIComponent(`Your DropYourSaaS Ad Spot (${slotText}) is Approved!`);
    const body = encodeURIComponent(
      `Hi ${req.project_name},\n\n` +
        `Great news! Your spot request for ${req.site_url} on DropYourSaaS for position ${slotText} has been reviewed and approved.\n\n` +
        `Please complete your payment of $100 for 30 days of featured sidebar placement:\n` +
        `https://www.dropyoursaas.com/advertise\n\n` +
        `Once paid, your ad will go live on the sidebar immediately.\n\n` +
        `Best regards,\n` +
        `The DropYourSaaS Team`
    );
    return `mailto:${req.contact_email}?subject=${subject}&body=${body}`;
  };

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.category && l.category.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus =
        listingStatusFilter === 'all' ||
        (listingStatusFilter === 'for_sale' ? Boolean(l.is_for_sale) : l.status === listingStatusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [listings, searchTerm, listingStatusFilter]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.site_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = requestStatusFilter === 'all' || r.status === requestStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, requestStatusFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-[#FFFC00] flex items-center justify-center font-mono font-bold shadow-xs border border-amber-500/30">
            <Zap className="size-4 fill-current" />
          </div>
          <div>
            <h1 className="font-mono font-black text-base sm:text-lg tracking-tight flex items-center gap-2">
              <span>DropYourSaaS Command Center</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                Live DB
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground font-mono">
              Logged in as <span className="font-bold text-foreground">loladmin</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setListingModalState({ isOpen: true, listing: null })}
            className="h-9 gap-1.5 rounded-xl font-mono text-xs font-bold bg-[#FFFC00] hover:bg-[#FFFC00]/90 text-black shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add Listing</span>
          </Button>

          <Button
            onClick={() => setPlaceModalState({ isOpen: true })}
            className="h-9 gap-1.5 rounded-xl font-mono text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer"
          >
            <Pin className="size-3.5" />
            <span className="hidden sm:inline">Place Ad</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="h-9 w-9 p-0 rounded-xl cursor-pointer"
            title="Refresh All Data"
          >
            <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin')} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="size-9 p-0 rounded-xl cursor-pointer"
            title="Toggle Light / Dark mode"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="h-9 gap-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Floating Status Notification Banner */}
      {statusNotification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={cn(
              'px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 font-mono text-xs',
              statusNotification.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/50'
            )}
          >
            {statusNotification.type === 'success' ? (
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-rose-400 shrink-0" />
            )}
            <span>{statusNotification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Metric Telemetry Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Total Real Revenue
              </span>
              <DollarSign className="size-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-mono font-black text-emerald-500 mt-2">
              ${bidsData ? bidsData.stats.totalGrossUsd.toLocaleString() : '0'}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mt-1">
              {bidsData?.stats.paidCount || 0} paid bids · {bidsData?.stats.pendingCount || 0} pending
            </div>
          </Card>

          <Card className="rounded-2xl border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Real / Public Traffic
              </span>
              <Users className="size-4 text-sky-500" />
            </div>
            <div className="text-2xl font-mono font-black text-sky-500 mt-2">
              {adminStats ? adminStats.realVisitors : 0}{' '}
              <span className="text-xs text-muted-foreground font-normal">
                / {adminStats ? adminStats.totalVisitors.toLocaleString() : '—'} public
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mt-1">
              {adminStats ? adminStats.online : 0} online now · {adminStats?.realClicksTotal || 0} real clicks
            </div>
          </Card>

          <Card className="rounded-2xl border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Active Listings
              </span>
              <Globe className="size-4 text-amber-500" />
            </div>
            <div className="text-2xl font-mono font-black text-foreground mt-2">
              {listings.length}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mt-1">
              {listings.filter((l) => l.is_for_sale).length} for sale · {listings.filter((l) => l.is_verified).length} verified
            </div>
          </Card>

          <Card className="rounded-2xl border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Rail Ads &amp; Inquiries
              </span>
              <Pin className="size-4 text-purple-500" />
            </div>
            <div className="text-2xl font-mono font-black text-purple-500 mt-2">
              {pinnedAds.length} Active
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mt-1">
              {requests.filter((r) => r.status === 'pending').length} pending inquiries
            </div>
          </Card>
        </div>

        {/* Dynamic 6-Tab Switcher Navigation */}
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl border border-border overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                activeTab === 'stats'
                  ? 'bg-card text-foreground shadow-xs text-amber-600 dark:text-[#FFFC00]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <BarChart3 className="size-3.5" />
              <span>Real vs. Showing Stats</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('listings')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                activeTab === 'listings'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Globe className="size-3.5" />
              <span>Leaderboard Listings ({listings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                activeTab === 'requests'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Mail className="size-3.5" />
              <span>Ad Requests ({requests.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('active_ads')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                activeTab === 'active_ads'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Sparkles className="size-3.5" />
              <span>Active Rail Pins ({pinnedAds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bids')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                activeTab === 'bids'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <DollarSign className="size-3.5" />
              <span>Bids Telemetry ({bidsData?.bids.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('system')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                activeTab === 'system'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Layers className="size-3.5" />
              <span>System &amp; Cache</span>
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: REAL VS. SHOWING STATS
            ------------------------------------------------------------- */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Quick Bot Simulator Trigger */}
            <Card className="p-5 rounded-3xl border border-border bg-gradient-to-r from-card via-card to-amber-500/5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-mono font-bold text-sm text-foreground flex items-center gap-2">
                  <Bot className="size-4 text-amber-500" />
                  <span>Organic Traffic &amp; Click Simulation Engine</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Simulates realistic organic user browsing, distributed clicks across top ranks, and diurnal waves.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleTriggerBotClick}
                  disabled={actionLoading === 'bot-tick'}
                  className="h-9 gap-1.5 rounded-xl font-mono text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-xs cursor-pointer"
                >
                  <Bot className={cn('size-4', actionLoading === 'bot-tick' && 'animate-spin')} />
                  <span>{actionLoading === 'bot-tick' ? 'Simulating...' : 'Run Simulation Tick'}</span>
                </Button>
              </div>
            </Card>

            {/* Side-by-Side Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 rounded-3xl border-border bg-card shadow-xs space-y-3">
                <div className="font-mono text-xs text-muted-foreground uppercase">Unique Visitors</div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-muted-foreground">Real Unique Hits:</span>
                    <span className="font-mono font-bold text-lg text-emerald-500">
                      {adminStats?.realVisitors || 0}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-muted-foreground">Boosted / Added:</span>
                    <span className="font-mono font-bold text-lg text-muted-foreground">
                      +{adminStats?.boostedVisitors.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-border/60">
                    <span className="text-xs font-mono font-bold text-foreground">Total Public Display:</span>
                    <span className="font-mono font-black text-xl text-sky-500">
                      {adminStats?.totalVisitors.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-5 rounded-3xl border-border bg-card shadow-xs space-y-3">
                <div className="font-mono text-xs text-muted-foreground uppercase">Outbound Clicks</div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-muted-foreground">Real User Clicks:</span>
                    <span className="font-mono font-bold text-lg text-emerald-500">
                      {adminStats?.realClicksTotal || 0}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-muted-foreground">Simulated Clicks:</span>
                    <span className="font-mono font-bold text-lg text-muted-foreground">
                      +{adminStats?.boostedClicksTotal || 0}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-border/60">
                    <span className="text-xs font-mono font-bold text-foreground">Total Public Clicks:</span>
                    <span className="font-mono font-black text-xl text-amber-500">
                      {(adminStats?.realClicksTotal || 0) + (adminStats?.boostedClicksTotal || 0)}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-5 rounded-3xl border-border bg-card shadow-xs space-y-3">
                <div className="font-mono text-xs text-muted-foreground uppercase">Conversion Telemetry</div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-muted-foreground">Paid Checkouts:</span>
                    <span className="font-mono font-bold text-lg text-emerald-500">
                      {bidsData?.stats.paidCount || 0}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-muted-foreground">Conversion on Real Hits:</span>
                    <span className="font-mono font-bold text-lg text-sky-500">
                      {adminStats && adminStats.realVisitors > 0
                        ? `${(((bidsData?.stats.paidCount || 0) / adminStats.realVisitors) * 100).toFixed(1)}%`
                        : '0.0%'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-border/60">
                    <span className="text-xs font-mono font-bold text-foreground">Public Showing Rate:</span>
                    <span className="font-mono font-black text-xl text-purple-500">
                      {adminStats?.conversionRate || '24.0%'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Per-Listing Real vs Boosted Click Breakdown Table */}
            <Card className="rounded-3xl border-border bg-card shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-mono font-bold text-sm text-foreground">
                    Listing Click Telemetry Breakdown
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Granular breakdown of verified real user clicks vs simulated growth clicks per SaaS listing
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {adminStats?.listingsStats.length || 0} listings tracked
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Listing Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Real User Clicks</th>
                      <th className="p-3 text-right">Boosted / Added</th>
                      <th className="p-3 text-right">Total Public</th>
                      <th className="p-3 text-center">URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {adminStats?.listingsStats.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-bold text-foreground">#{item.rank}</td>
                        <td className="p-3 font-semibold text-foreground max-w-xs truncate">
                          {item.name}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-500">
                          {item.realClicks}
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          +{item.boostedClicks}
                        </td>
                        <td className="p-3 text-right font-black text-foreground">
                          {item.totalClicks}
                        </td>
                        <td className="p-3 text-center">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: LEADERBOARD & LISTINGS MANAGEMENT (FULL CRUD)
            ------------------------------------------------------------- */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search name, URL, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-card text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={listingStatusFilter}
                  onChange={(e) => setListingStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-border bg-card text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">All Listings ({listings.length})</option>
                  <option value="published">Published</option>
                  <option value="pending_verification">Pending Verification</option>
                  <option value="rejected">Rejected / Hidden</option>
                  <option value="for_sale">Listed for Sale ({listings.filter((l) => l.is_for_sale).length})</option>
                </select>

                <Button
                  onClick={() => setListingModalState({ isOpen: true, listing: null })}
                  className="h-9 gap-1 rounded-xl font-mono text-xs font-bold bg-[#FFFC00] hover:bg-[#FFFC00]/90 text-black"
                >
                  <Plus className="size-3.5" />
                  <span>Create</span>
                </Button>
              </div>
            </div>

            {/* Listings Table */}
            <Card className="rounded-3xl border-border bg-card shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">SaaS Project</th>
                      <th className="p-3">Bid ($)</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Clicks (Real/Tot)</th>
                      <th className="p-3">Badges</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredListings.map((item, idx) => {
                      const bidDollars = item.bid !== undefined ? item.bid : Math.round((item.bid_cents || 0) / 100);
                      return (
                        <tr key={item.id || item.url} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-bold text-foreground">#{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-bold text-foreground flex items-center gap-1.5">
                              <span>{item.name}</span>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <ArrowUpRight className="size-3" />
                              </a>
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate max-w-xs">
                              {item.description || item.url}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-black text-amber-500">
                              ${bidDollars}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">
                              {item.category || 'SaaS'}
                            </span>
                          </td>
                          <td className="p-3 font-mono">
                            <span className="text-emerald-500 font-bold">{item.real_clicks || 0}</span>
                            <span className="text-muted-foreground"> / {item.clicks || 0}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.is_verified && (
                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0">
                                  Verified
                                </Badge>
                              )}
                              {item.is_dofollow && (
                                <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] py-0">
                                  Dofollow
                                </Badge>
                              )}
                              {item.is_for_sale && (
                                <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] py-0">
                                  For Sale (${(item.asking_price || 0).toLocaleString()})
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge
                              className={cn(
                                'text-[10px]',
                                item.status === 'published'
                                  ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                                  : item.status === 'pending_verification'
                                  ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                                  : 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                              )}
                            >
                              {item.status || 'published'}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setListingModalState({ isOpen: true, listing: item })}
                                className="h-7 px-2.5 rounded-lg text-xs font-mono"
                              >
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => item.id && handleDeleteListing(item.id, item.name)}
                                className="h-7 px-2 rounded-lg text-rose-600 hover:bg-rose-500/10"
                                title="Delete listing"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: AD REQUESTS & SPONSORSHIPS
            ------------------------------------------------------------- */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search project, URL, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-card text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-border bg-card text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer w-full sm:w-auto"
              >
                <option value="all">All Inquiries ({requests.length})</option>
                <option value="pending">Pending Review</option>
                <option value="invoiced">Invoiced</option>
                <option value="active">Active Pin</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border-dashed border-border">
                <Pin className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-mono text-muted-foreground">No ad requests found.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((req) => (
                  <Card key={req.id} className="p-4 sm:p-5 rounded-3xl border-border bg-card shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-foreground truncate">
                            {req.project_name}
                          </span>
                          <Badge
                            className={cn(
                              'text-[10px]',
                              req.status === 'pending' && 'bg-amber-500/15 text-amber-600 border-amber-500/30',
                              req.status === 'invoiced' && 'bg-blue-500/15 text-blue-600 border-blue-500/30',
                              req.status === 'active' && 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
                              req.status === 'rejected' && 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                            )}
                          >
                            {req.status}
                          </Badge>
                          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-mono">
                            {formatSlotLabel(req.slot_position || 'left_1')}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-1">{req.one_liner}</p>

                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono pt-1">
                          <a
                            href={req.site_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground inline-flex items-center gap-1 truncate max-w-xs"
                          >
                            <ExternalLink className="size-3" />
                            <span>{req.site_url}</span>
                          </a>
                          <span className="inline-flex items-center gap-1 truncate">
                            <Mail className="size-3" />
                            <span>{req.contact_email}</span>
                          </span>
                          <span>{new Date(req.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                        {req.status === 'pending' && (
                          <>
                            <a
                              href={createMailtoLink(req)}
                              onClick={() => handleAdRequestStatusChange(req.id, 'invoiced')}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Send className="size-3" />
                              <span>Send Invoice</span>
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdRequestStatusChange(req.id, 'rejected')}
                              className="h-8 rounded-xl font-mono text-xs text-rose-600 hover:bg-rose-500/10"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {req.status === 'invoiced' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              setPlaceModalState({
                                isOpen: true,
                                slotPosition: req.slot_position,
                                siteUrl: req.site_url,
                                projectName: req.project_name,
                                oneLiner: req.one_liner,
                                contactEmail: req.contact_email,
                              })
                            }
                            className="h-8 rounded-xl font-mono text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            <CheckCircle className="size-3 mr-1" />
                            Activate Pin
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 4: ACTIVE RAIL PINS
            ------------------------------------------------------------- */}
        {activeTab === 'active_ads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono font-bold text-sm text-foreground">
                  Active Sidebar Sponsor Ads
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  Ads currently live in the left &amp; right Bento rail slots
                </p>
              </div>
              <Button
                onClick={() => setPlaceModalState({ isOpen: true })}
                className="h-9 gap-1.5 rounded-xl font-mono text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white"
              >
                <Plus className="size-4" />
                <span>Place New Ad</span>
              </Button>
            </div>

            {pinnedAds.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border-dashed border-border">
                <Sparkles className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-mono text-muted-foreground">No active pinned ads currently running.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pinnedAds.map((ad) => (
                  <Card key={ad.id} className="p-4 rounded-3xl border-border bg-card shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-foreground truncate">
                            {ad.project_name}
                          </span>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/30 text-[10px]">
                            {formatSlotLabel(ad.slot_position)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{ad.one_liner}</p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemovePinnedAd(ad.id)}
                        className="size-8 p-0 rounded-xl text-rose-600 hover:bg-rose-500/10 shrink-0"
                        title="Remove pinned ad"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-2 border-t border-border/60">
                      <span>Expires: {new Date(ad.expires_at).toLocaleDateString()}</span>
                      <a
                        href={ad.site_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground inline-flex items-center gap-1"
                      >
                        <span>Visit</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 5: BIDS TELEMETRY & REVENUE
            ------------------------------------------------------------- */}
        {activeTab === 'bids' && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-border bg-card shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-mono font-bold text-sm text-foreground">
                    Live Transaction &amp; Outbid Feed
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    All payment attempts and successful outbids recorded from Whop &amp; Polar
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {bidsData?.bids.length || 0} total records
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">SaaS / URL</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Checkout ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {bidsData?.bids.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-muted-foreground">
                          {new Date(b.created_at).toLocaleString()}
                        </td>
                        <td className="p-3 font-semibold text-foreground">
                          <div>{b.entry_name}</div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-xs">{b.entry_url}</div>
                        </td>
                        <td className="p-3 font-black text-emerald-500">
                          ${(b.amount_cents / 100).toFixed(2)}
                        </td>
                        <td className="p-3">
                          <Badge
                            className={cn(
                              'text-[10px]',
                              b.status === 'paid' && 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
                              b.status === 'pending' && 'bg-amber-500/15 text-amber-600 border-amber-500/30',
                              b.status === 'failed' && 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                            )}
                          >
                            {b.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground truncate max-w-xs">
                          {b.polar_checkout_id || 'whop_direct'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 6: SYSTEM CONTROLS, TWITTER & CACHE
            ------------------------------------------------------------- */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Redis Cache Control */}
            <Card className="p-5 rounded-3xl border-border bg-card shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="font-mono font-bold text-sm text-foreground flex items-center gap-2">
                  <Database className="size-4 text-emerald-500" />
                  <span>Upstash Redis Cache Management</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  The directory uses Upstash Redis to serve leaderboard reads with sub-millisecond latency. Flush cache whenever you want to force instant Postgres synchronization.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleFlushCache}
                  disabled={actionLoading === 'cache-flush'}
                  className="h-10 gap-2 rounded-xl font-mono text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer"
                >
                  <RefreshCw className={cn('size-4', actionLoading === 'cache-flush' && 'animate-spin')} />
                  <span>{actionLoading === 'cache-flush' ? 'Flushing Redis...' : 'Flush All Redis Cache Layers'}</span>
                </Button>
              </div>
            </Card>

            {/* X / Twitter Auto-Poster Control */}
            <Card className="p-5 rounded-3xl border-border bg-card shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="font-mono font-bold text-sm text-foreground flex items-center gap-2">
                  <Share2 className="size-4 text-sky-500" />
                  <span>X (Twitter) Auto-Poster</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Automatically broadcasts a promotional tweet whenever a new product outbids and takes the #1 spot.
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Credentials Status:</span>
                  <Badge
                    className={cn(
                      'text-[10px]',
                      twitterConfig?.configured
                        ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                    )}
                  >
                    {twitterConfig?.configured ? 'Configured & Active' : 'Keys Pending in Env'}
                  </Badge>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleTestTwitter}
                  disabled={actionLoading === 'twitter-test'}
                  className="h-10 gap-2 rounded-xl font-mono text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs cursor-pointer"
                >
                  <Share2 className="size-4" />
                  <span>{actionLoading === 'twitter-test' ? 'Posting...' : 'Send Test Tweet to X'}</span>
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Place Ad Modal */}
      <AdminPlaceAdModal
        isOpen={placeModalState.isOpen}
        onClose={() => setPlaceModalState({ isOpen: false })}
        onSuccess={() => {
          setPlaceModalState({ isOpen: false });
          fetchDashboardData();
        }}
        defaultSlotPosition={placeModalState.slotPosition}
        defaultSiteUrl={placeModalState.siteUrl}
        defaultProjectName={placeModalState.projectName}
        defaultOneLiner={placeModalState.oneLiner}
        defaultContactEmail={placeModalState.contactEmail}
      />

      {/* Listing Create/Edit Modal */}
      <AdminListingModal
        isOpen={listingModalState.isOpen}
        onClose={() => setListingModalState({ isOpen: false, listing: null })}
        onSuccess={() => {
          setListingModalState({ isOpen: false, listing: null });
          fetchDashboardData();
        }}
        listing={listingModalState.listing}
      />
    </div>
  );
}
