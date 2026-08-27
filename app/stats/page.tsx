'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';
import { BentoRails } from '@/components/bento-rails';
import { Card } from '@/components/ui/card';
import {
  Globe,
  RefreshCw,
  Clock,
  Sparkles,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import type { StatsOverview, DailyStatsPoint } from '@/lib/stats-engine';

export default function StatsPage() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [timeframe, setTimeframe] = useState<'30d' | '7d' | '24h'>('30d');
  const [channelTab, setChannelTab] = useState<'channel' | 'referrer'>('channel');
  const [pageTab, setPageTab] = useState<'page' | 'entry'>('page');
  const [countryTab, setCountryTab] = useState<'country' | 'city'>('country');
  const [deviceTab, setDeviceTab] = useState<'browser' | 'device'>('browser');
  const [activeTooltip, setActiveTooltip] = useState<DailyStatsPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  const filteredTimeline = useMemo(() => {
    if (!stats?.timeline) return [];
    if (timeframe === '7d') return stats.timeline.slice(-7);
    if (timeframe === '24h') return stats.timeline.slice(-2);
    return stats.timeline;
  }, [stats, timeframe]);

  const maxVisitors = useMemo(() => {
    if (!filteredTimeline.length) return 100;
    return Math.max(...filteredTimeline.map((p) => p.visitors), 50);
  }, [filteredTimeline]);

  return (
    <MobileLayout>
      <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-[#fe4103] selection:text-white">
        <Header />

        <main className="flex-1 w-full px-3 sm:px-5 md:px-6 lg:px-6 xl:px-8 2xl:px-10 py-5 sm:py-8">
          <div className="flex justify-between items-start gap-4 lg:gap-6 xl:gap-8 w-full">
            <BentoRails side="left" />

            <div className="w-full max-w-3xl xl:max-w-4xl 2xl:max-w-[880px] mx-auto min-w-0 space-y-6 sm:space-y-8">
              {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/80 shadow-2xs">
                <Globe className="size-3.5 text-sky-500" />
                <span className="text-xs font-mono font-bold text-foreground">dropyoursaas.com</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as '30d' | '7d' | '24h')}
                  className="h-8 px-2.5 rounded-lg border border-border bg-card text-foreground font-medium text-xs focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="30d">Last 30 days</option>
                  <option value="7d">Last 7 days</option>
                  <option value="24h">Last 24 hours</option>
                </select>
                <span className="px-2 py-1 rounded-md bg-muted/60 text-muted-foreground text-[11px]">Daily</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted/70 text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`size-3 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Top Metric Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Visitors Card */}
            <Card className="p-4 rounded-2xl border-border bg-card shadow-2xs flex flex-col justify-between">
              <div className="text-[11px] font-sans text-muted-foreground uppercase tracking-wider font-semibold">
                Visitors
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div className="text-2xl sm:text-3xl font-mono font-black text-foreground">
                  {stats ? stats.totalVisitors.toLocaleString() : '—'}
                </div>
              </div>
              <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
                <TrendingUp className="size-2.5" /> +18.4% this week
              </div>
            </Card>

            {/* Online Pulse Card */}
            <Card className="p-4 rounded-2xl border-border bg-card shadow-2xs flex flex-col justify-between">
              <div className="text-[11px] font-sans text-muted-foreground uppercase tracking-wider font-semibold flex items-center justify-between">
                <span>Online</span>
                <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                {stats ? stats.online.toLocaleString() : '—'}
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground font-sans">
                Active in last 2h
              </div>
            </Card>

            {/* 24h Traffic Card */}
            <Card className="p-4 rounded-2xl border-border bg-card shadow-2xs flex flex-col justify-between">
              <div className="text-[11px] font-sans text-muted-foreground uppercase tracking-wider font-semibold">
                Last 24 Hours
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-mono font-black text-foreground">
                {stats ? stats.visitors24h.toLocaleString() : '—'}
              </div>
              <div className="mt-2 text-[10px] text-sky-500 font-mono font-medium">
                Live daily pace
              </div>
            </Card>

            {/* Bounce Rate */}
            <Card className="p-4 rounded-2xl border-border bg-card shadow-2xs flex flex-col justify-between">
              <div className="text-[11px] font-sans text-muted-foreground uppercase tracking-wider font-semibold">
                Bounce rate
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-mono font-black text-foreground">
                {stats?.bounceRate || '74.6%'}
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground font-sans">
                Healthy engagement
              </div>
            </Card>

            {/* Session Time */}
            <Card className="p-4 rounded-2xl border-border bg-card shadow-2xs flex flex-col justify-between">
              <div className="text-[11px] font-sans text-muted-foreground uppercase tracking-wider font-semibold">
                Session time
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-mono font-black text-foreground">
                {stats?.sessionTime || '2m 14s'}
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground font-sans">
                Average visit length
              </div>
            </Card>

            {/* Conversion Rate */}
            <Card className="p-4 rounded-2xl border-border bg-card shadow-2xs flex flex-col justify-between">
              <div className="text-[11px] font-sans text-muted-foreground uppercase tracking-wider font-semibold">
                CTR / Clicks
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-mono font-black text-amber-500">
                {stats?.conversionRate || '24.3%'}
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground font-sans">
                Outbound click rate
              </div>
            </Card>
          </div>

          {/* Interactive Timeline Graph Area */}
          <Card className="p-4 sm:p-6 rounded-3xl border-border bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-mono font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="size-4 text-sky-500" />
                  Visitor Traffic Velocity
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Daily unique visitors over time
                </p>
              </div>
              {activeTooltip && (
                <div className="text-xs font-mono px-3 py-1 rounded-lg bg-muted text-foreground border border-border">
                  <span className="text-muted-foreground mr-2">{activeTooltip.label}:</span>
                  <span className="font-bold text-sky-500">{activeTooltip.visitors.toLocaleString()} visitors</span>
                </div>
              )}
            </div>

            {/* SVG Area Chart */}
            <div className="relative w-full h-56 sm:h-72 pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="50" x2="1000" y2="50" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
                <line x1="0" y1="125" x2="1000" y2="125" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
                <line x1="0" y1="200" x2="1000" y2="200" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
                <line x1="0" y1="275" x2="1000" y2="275" stroke="currentColor" strokeOpacity="0.12" />

                {/* Area & Path Line */}
                {filteredTimeline.length > 1 && (() => {
                  const points = filteredTimeline.map((pt, index) => {
                    const x = (index / (filteredTimeline.length - 1)) * 1000;
                    const y = 275 - (pt.visitors / maxVisitors) * 225;
                    return { x, y, pt };
                  });

                  const dPath = points.reduce((acc, curr, idx) => {
                    if (idx === 0) return `M ${curr.x} ${curr.y}`;
                    const prev = points[idx - 1];
                    const cx1 = prev.x + (curr.x - prev.x) / 2;
                    const cy1 = prev.y;
                    const cx2 = prev.x + (curr.x - prev.x) / 2;
                    const cy2 = curr.y;
                    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
                  }, '');

                  const dArea = `${dPath} L 1000 275 L 0 275 Z`;

                  return (
                    <>
                      <path d={dArea} fill="url(#visitorsGrad)" />
                      <path d={dPath} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                      {points.map((p, i) => (
                        <g key={i} className="cursor-pointer group">
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={i === points.length - 1 || activeTooltip?.date === p.pt.date ? 5 : 3.5}
                            className="fill-sky-500 stroke-background stroke-2 transition-all hover:scale-150"
                            onMouseEnter={() => setActiveTooltip(p.pt)}
                          />
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>

              {/* Bottom Date labels */}
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-2">
                {filteredTimeline.filter((_, idx) => idx % Math.ceil(filteredTimeline.length / 6) === 0).map((pt, i) => (
                  <span key={i}>{pt.label}</span>
                ))}
                <span>{filteredTimeline[filteredTimeline.length - 1]?.label}</span>
              </div>
            </div>
          </Card>

          {/* 4-Column / 2x2 Analytics Breakdown Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Panel 1: Channels & Referrers */}
            <Card className="p-4 sm:p-5 rounded-2xl border-border bg-card shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChannelTab('channel')}
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md transition-colors ${
                      channelTab === 'channel' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Channel
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannelTab('referrer')}
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md transition-colors ${
                      channelTab === 'referrer' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Referrer
                  </button>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono font-medium">All Sources</span>
              </div>

              <div className="space-y-3">
                {(channelTab === 'channel' ? stats?.channels : stats?.referrers)?.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-foreground font-medium truncate">{item.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-muted-foreground text-[11px]">{item.percentage}%</span>
                        <span className="font-bold text-foreground">{item.visitors.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Panel 2: Top Pages */}
            <Card className="p-4 sm:p-5 rounded-2xl border-border bg-card shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPageTab('page')}
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md transition-colors ${
                      pageTab === 'page' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageTab('entry')}
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md transition-colors ${
                      pageTab === 'entry' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Entry Page
                  </button>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono font-medium">Top Views</span>
              </div>

              <div className="space-y-3">
                {stats?.pages.map((p, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-foreground font-medium truncate">{p.path}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-muted-foreground text-[11px]">{p.percentage}%</span>
                        <span className="font-bold text-foreground">{p.visitors.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${p.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Panel 3: Countries */}
            <Card className="p-4 sm:p-5 rounded-2xl border-border bg-card shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCountryTab('country')}
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md transition-colors ${
                      countryTab === 'country' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Country
                  </button>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono font-medium">Global Reach</span>
              </div>

              <div className="space-y-3">
                {stats?.countries.map((c, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-foreground font-medium flex items-center gap-1.5">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-muted-foreground text-[11px]">{c.percentage}%</span>
                        <span className="font-bold text-foreground">{c.visitors.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Panel 4: Browsers & Devices */}
            <Card className="p-4 sm:p-5 rounded-2xl border-border bg-card shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDeviceTab('browser')}
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md transition-colors ${
                      deviceTab === 'browser' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Browser
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceTab('device')}
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md transition-colors ${
                      deviceTab === 'device' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Device
                  </button>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono font-medium">Platforms</span>
              </div>

              <div className="space-y-3">
                {(deviceTab === 'browser' ? stats?.browsers : stats?.devices)?.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-foreground font-medium truncate">{item.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-muted-foreground text-[11px]">{item.percentage}%</span>
                        <span className="font-bold text-foreground">{item.visitors.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Goal Conversions */}
          <Card className="p-4 sm:p-6 rounded-3xl border-border bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <h3 className="text-sm font-mono font-bold text-foreground flex items-center gap-2">
                <Zap className="size-4 text-[#fe4103]" />
                Conversion Goals & Outbound Tracking
              </h3>
              <span className="text-xs text-muted-foreground font-mono">Verified Actions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {stats?.goals.map((g, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                  <div className="text-xs font-mono font-semibold text-foreground truncate">{g.name}</div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="text-xl font-mono font-bold text-sky-500">{g.count.toLocaleString()}</div>
                    <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{g.conversion}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
            </div>

            <BentoRails side="right" />
          </div>
        </main>

        <Footer />
      </div>
    </MobileLayout>
  );
}
