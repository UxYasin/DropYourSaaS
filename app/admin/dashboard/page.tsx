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
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Users,
  Bot,
  Zap,
  Globe,
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

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [pinnedAds, setPinnedAds] = useState<PinnedAd[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStatsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'active_ads' | 'stats'>('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isBotTicking, setIsBotTicking] = useState(false);
  const [botMessage, setBotMessage] = useState<string | null>(null);

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
      const [resReq, resPinned, resStats] = await Promise.all([
        fetch('/api/admin/ads'),
        fetch('/api/admin/ads/place'),
        fetch('/api/admin/stats'),
      ]);

      if (resReq.status === 401 || resPinned.status === 401 || resStats.status === 401) {
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

      const dataStats = await resStats.json();
      if (resStats.ok && dataStats) {
        setAdminStats(dataStats);
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

  const handleTriggerBotClick = async () => {
    setIsBotTicking(true);
    setBotMessage(null);
    try {
      const res = await fetch('/api/admin/stats', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.stats) {
        setAdminStats(data.stats);
        setBotMessage('🤖 Organic click simulation tick executed successfully!');
        setTimeout(() => setBotMessage(null), 3000);
      }
    } catch {
      setBotMessage('Error triggering simulation tick.');
    } finally {
      setIsBotTicking(false);
    }
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
        `https://whop.com/checkout/...\n\n` +
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
          <div className="size-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-[#FFFC00] flex items-center justify-center font-mono font-bold shadow-xs border border-amber-500/30">
            <BarChart3 className="size-4" />
          </div>
          <div>
            <h1 className="font-mono font-bold text-base sm:text-lg tracking-tight">
              DropYourSaaS Admin
            </h1>
            <p className="text-[11px] text-muted-foreground font-mono">
              Logged in as <span className="font-bold text-foreground">loladmin</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setPlaceModalState({ isOpen: true })}
            className="h-9 gap-1.5 rounded-xl font-mono text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Place an Ad</span>
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
                Active Rail Pins
              </span>
              <Sparkles className="size-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-mono font-black text-emerald-500 mt-2">
              {pinnedAds.length}
            </div>
          </Card>

          <Card className="rounded-2xl border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Public / Real Visitors
              </span>
              <Users className="size-4 text-sky-500" />
            </div>
            <div className="text-2xl font-mono font-black text-sky-500 mt-2">
              {adminStats ? adminStats.totalVisitors.toLocaleString() : '—'}
              <span className="text-xs text-muted-foreground font-normal ml-2">
                ({adminStats ? adminStats.realVisitors : 0} real)
              </span>
            </div>
          </Card>
        </div>

        {/* Tab Switcher: Requests vs Active Pins vs Stats */}
        <div className="flex items-center justify-between gap-4 border-b border-border pb-3 flex-wrap">
          <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={cn(
                'px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer',
                activeTab === 'requests'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Ad Requests ({requests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('active_ads')}
              className={cn(
                'px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer',
                activeTab === 'active_ads'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Active Rail Pins ({pinnedAds.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={cn(
                'px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'stats'
                  ? 'bg-card text-foreground shadow-xs text-amber-600 dark:text-[#FFFC00]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <BarChart3 className="size-3.5" />
              <span>Traffic & Clicks Stats (Admin Only)</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="h-9 gap-1.5 rounded-xl text-xs font-mono font-medium cursor-pointer"
            >
              <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin')} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* -------------------------------------------------------------
            TAB 3: STATS & CLICK BREAKDOWN (ADMIN ONLY)
            ------------------------------------------------------------- */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Bot Message / Alert */}
            {botMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold animate-in fade-in-50">
                {botMessage}
              </div>
            )}

            {/* Growth & Click Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 rounded-2xl border-border bg-card space-y-2">
                <div className="text-xs font-mono text-muted-foreground uppercase flex items-center justify-between">
                  <span>Real vs Boosted Traffic</span>
                  <Globe className="size-4 text-sky-500" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-mono font-bold text-foreground">
                    {adminStats ? adminStats.realVisitors.toLocaleString() : 0}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    + {adminStats ? adminStats.boostedVisitors.toLocaleString() : 0} boosted
                  </div>
                </div>
                <div className="text-[11px] font-sans text-muted-foreground">
                  Public displays total: <strong className="text-foreground">{adminStats?.totalVisitors.toLocaleString()}</strong>
                </div>
              </Card>

              <Card className="p-4 rounded-2xl border-border bg-card space-y-2">
                <div className="text-xs font-mono text-muted-foreground uppercase flex items-center justify-between">
                  <span>Real vs Added Clicks</span>
                  <MousePointerClick className="size-4 text-amber-500" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-mono font-bold text-amber-500">
                    {adminStats ? adminStats.realClicksTotal.toLocaleString() : 0}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    + {adminStats ? adminStats.boostedClicksTotal.toLocaleString() : 0} added
                  </div>
                </div>
                <div className="text-[11px] font-sans text-muted-foreground">
                  Total listing clicks: <strong className="text-foreground">{((adminStats?.realClicksTotal || 0) + (adminStats?.boostedClicksTotal || 0)).toLocaleString()}</strong>
                </div>
              </Card>

              <Card className="p-4 rounded-2xl border-border bg-card space-y-2">
                <div className="text-xs font-mono text-muted-foreground uppercase flex items-center justify-between">
                  <span>Daily Growth Target</span>
                  <TrendingUp className="size-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  700 – 1,000 / day
                </div>
                <div className="text-[11px] font-sans text-muted-foreground">
                  Current 24h pace: <strong className="text-foreground">{adminStats?.visitors24h.toLocaleString()} visitors</strong>
                </div>
              </Card>

              <Card className="p-4 rounded-2xl border-border bg-card space-y-2">
                <div className="text-xs font-mono text-muted-foreground uppercase flex items-center justify-between">
                  <span>Organic Click Bot</span>
                  <Bot className="size-4 text-purple-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-500">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                  <Button
                    size="sm"
                    onClick={handleTriggerBotClick}
                    disabled={isBotTicking}
                    className="h-7 px-2.5 rounded-lg text-[11px] font-mono font-bold bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    {isBotTicking ? 'Simulating...' : 'Run Click Tick'}
                  </Button>
                </div>
                <div className="text-[11px] font-sans text-muted-foreground">
                  Realistic rank-weighted distribution
                </div>
              </Card>
            </div>

            {/* Listing by Listing Breakdown Table */}
            <Card className="rounded-2xl border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-mono font-bold text-sm text-foreground">
                    Listings Click Performance (Real vs Added)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Transparency breakdown of real user clicks vs organic growth clicks
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {adminStats?.listingsStats.length || 0} listings
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Listing Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Real Clicks</th>
                      <th className="p-3 text-right">Added / Boosted</th>
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
                        <td className="p-3 text-right font-bold text-amber-500">
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
            TAB 1: AD REQUESTS
            ------------------------------------------------------------- */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search project, URL, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-card text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-border bg-card text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Review</option>
                  <option value="invoiced">Invoiced</option>
                  <option value="active">Active Pin</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
              <Card className="p-12 text-center rounded-2xl border-dashed border-border">
                <Pin className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-mono text-muted-foreground">No ad requests found.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((req) => (
                  <Card key={req.id} className="p-4 sm:p-5 rounded-2xl border-border bg-card shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-foreground truncate">
                            {req.project_name}
                          </span>
                          {statusBadge(req.status)}
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
                              onClick={() => handleStatusChange(req.id, 'invoiced')}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Send className="size-3" />
                              <span>Send Invoice</span>
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(req.id, 'rejected')}
                              disabled={updatingId === req.id}
                              className="h-8 rounded-xl font-mono text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
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
            TAB 2: ACTIVE RAIL PINS
            ------------------------------------------------------------- */}
        {activeTab === 'active_ads' && (
          <div className="space-y-4">
            {filteredPinnedAds.length === 0 ? (
              <Card className="p-12 text-center rounded-2xl border-dashed border-border">
                <Sparkles className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-mono text-muted-foreground">No active pinned ads currently running.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPinnedAds.map((ad) => (
                  <Card key={ad.id} className="p-4 rounded-2xl border-border bg-card shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-foreground truncate">
                            {ad.project_name}
                          </span>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/30">
                            {formatSlotLabel(ad.slot_position)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{ad.one_liner}</p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemovePinnedAd(ad.id)}
                        className="size-8 p-0 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 shrink-0"
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
    </div>
  );
}
