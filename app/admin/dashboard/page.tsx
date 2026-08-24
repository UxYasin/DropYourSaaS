'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdRequest {
  id: string;
  site_url: string;
  project_name: string;
  one_liner: string;
  contact_email: string;
  status: 'pending' | 'invoiced' | 'active' | 'rejected';
  created_at: string;
}

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/ads');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (res.ok && Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
    } catch {
      // network error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
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

  const createMailtoLink = (req: AdRequest) => {
    const subject = encodeURIComponent(`Your DropYourSaaS Ad Spot is Approved!`);
    const body = encodeURIComponent(
      `Hi ${req.project_name},\n\n` +
        `Great news! Your spot request for ${req.site_url} on DropYourSaaS has been reviewed and approved.\n\n` +
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
      r.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
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
              Admin Dashboard
            </h1>
            <p className="text-[11px] text-muted-foreground font-mono">
              DropYourSaaS · Ad Requests & Monetization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            <span>Logout</span>
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
                Total Requests
              </span>
              <Pin className="size-4 text-blue-500" />
            </div>
            <div className="text-2xl font-mono font-black mt-2">{requests.length}</div>
          </Card>
          <Card className="rounded-2xl border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Pending
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
                Active Pins
              </span>
              <CheckCircle className="size-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-mono font-black text-emerald-500 mt-2">
              {requests.filter((r) => r.status === 'active').length}
            </div>
          </Card>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by product name, URL, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-10 rounded-xl border border-border bg-card text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs">
              <SlidersHorizontal className="size-3.5 text-muted-foreground ml-2" />
              {['all', 'pending', 'invoiced', 'active', 'rejected'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={cn(
                    'px-3 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer text-xs',
                    statusFilter === st
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {st}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              disabled={isLoading}
              className="size-10 p-0 rounded-xl cursor-pointer"
              title="Refresh requests"
            >
              <RefreshCw className={cn('size-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Requests Table */}
        <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Product Name & URL</th>
                  <th className="p-4">One-Liner</th>
                  <th className="p-4">Contact Email</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Requested At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-mono">
                      Loading ad requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-mono">
                      No ad requests found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-muted/30 transition-colors">
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
                          <span className="truncate max-w-[180px]">{req.site_url}</span>
                          <ExternalLink className="size-3" />
                        </a>
                      </td>

                      {/* One Liner */}
                      <td className="p-4 max-w-[260px]">
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
                      <td className="p-4 font-mono text-muted-foreground">
                        {new Date(req.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
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
                            <span>Send Invoice</span>
                          </a>

                          {/* Status Dropdown Selector */}
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
      </main>
    </div>
  );
}
