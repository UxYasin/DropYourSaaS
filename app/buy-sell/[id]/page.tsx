'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';
import { BentoRails } from '@/components/bento-rails';
import {
  ChevronRight,
  Share2,
  Mail,
  ExternalLink,
  ShieldCheck,
  Code2,
  DollarSign,
  Users,
  Globe,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { FaviconImage } from '@/components/favicon-image';

// Mock datasets for listing details
const MOCK_DETAILS_MAP: Record<
  string,
  {
    id: string;
    name: string;
    url: string;
    description: string;
    category: string;
    askingPrice: number;
    ttmRevenue: number;
    mrr: number;
    dateListed: string;
    email: string;
    favicon: string;
    about: string;
    techStack: string[];
    pricingModel: string;
    teamSize: string;
    platforms: string[];
    growthChannels: string[];
    founderName: string;
    founderRole: string;
    founderAvatar: string;
    founderQuote: string;
  }
> = {
  'outrank-so': {
    id: 'outrank-so',
    name: 'Outrank.so',
    url: 'https://outrank.so',
    description: 'AI-driven programmatic SEO & automated blog publisher for SaaS startups.',
    category: 'AI Tool',
    askingPrice: 45000,
    ttmRevenue: 28400,
    mrr: 2950,
    dateListed: 'Aug 2026',
    email: 'founders@outrank.so',
    favicon: 'https://www.google.com/s2/favicons?domain=outrank.so&sz=128',
    about:
      'Outrank.so is a fully automated programmatic SEO platform built for SaaS founders and content teams. It automatically researches high-intent long-tail keywords, generates rank-worthy articles using fine-tuned LLMs, and publishes directly to Webflow, Next.js, or WordPress blogs with automated internal linking and canonical SEO tags.',
    techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase', 'OpenAI API', 'Stripe'],
    pricingModel: 'Freemium ($29/mo Starter, $79/mo Growth)',
    teamSize: '1 Solo Founder',
    platforms: ['Web App', 'Chrome Extension'],
    growthChannels: ['Programmatic SEO (self-indexed)', 'ProductHunt Launch', 'X/Twitter Build in Public'],
    founderName: 'Alex Rivera',
    founderRole: 'Founder & Engineer',
    founderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    founderQuote:
      'I built Outrank.so to solve my own programmatic SEO pain point. It grew organically to $2,950 MRR with near-zero churn. Looking for an ambitious operator to take it to $10k+ MRR while I shift focus to hardware.',
  },
};

const DEFAULT_DETAIL = {
  id: 'featured-startup',
  name: 'Orynth.dev',
  url: 'https://orynth.dev',
  description: 'Developer sandbox & synthetic telemetry testing infrastructure for high-scale microservices.',
  category: 'Developer Tool',
  askingPrice: 68000,
  ttmRevenue: 42000,
  mrr: 4100,
  dateListed: 'Aug 2026',
  email: 'contact@orynth.dev',
  favicon: 'https://www.google.com/s2/favicons?domain=orynth.dev&sz=128',
  about:
    'Orynth.dev provides instant, isolated sandbox environments for testing microservices and API integrations without mocking dependencies. Thousands of developers use Orynth to test Webhooks, OAuth flows, and background worker queues in deterministic cloud environments.',
  techStack: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS ECS', 'Stripe Billing'],
  pricingModel: 'Tiered Subscription ($49/mo Pro, $199/mo Enterprise)',
  teamSize: '2 Co-Founders',
  platforms: ['Web Dashboard', 'CLI Tool'],
  growthChannels: ['Developer Documentation', 'GitHub Sponsorships', 'HackerNews Show HN'],
  founderName: 'Marcus Vance',
  founderRole: 'Co-Founder & CTO',
  founderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  founderQuote:
    'Orynth has hit incredible momentum with enterprise dev teams. We are selling to find an acquirer with strong B2B developer distribution channels.',
};

const MORE_STARTUPS = [
  {
    id: 'trycomp-ai',
    name: 'TryComp.ai',
    category: 'SaaS',
    description: 'Automated video competitor analysis benchmarking.',
    askingPrice: 32000,
    mrr: 1850,
    favicon: 'https://www.google.com/s2/favicons?domain=trycomp.ai&sz=128',
  },
  {
    id: 'lathire-com',
    name: 'Lathire.com',
    category: 'Productivity',
    description: 'Niche Tech job board and AI resume matching.',
    askingPrice: 18500,
    mrr: 1200,
    favicon: 'https://www.google.com/s2/favicons?domain=lathire.com&sz=128',
  },
  {
    id: 'mytb-ai',
    name: 'Mytb.ai',
    category: 'Mobile App',
    description: 'Personal knowledge assistant and bookmark summarizer.',
    askingPrice: 24000,
    mrr: 1550,
    favicon: 'https://www.google.com/s2/favicons?domain=mytb.ai&sz=128',
  },
];

function formatMoney(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export default function ListingDetailPage() {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id || '';
  const item = MOCK_DETAILS_MAP[rawId] || { ...DEFAULT_DETAIL, name: rawId ? rawId.replace(/-/g, '.') : DEFAULT_DETAIL.name };
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <MobileLayout>
      <div className="min-h-screen flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-white transition-colors duration-200">
        <Header />

        <main className="flex-1 max-w-[1600px] xl:max-w-[1680px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-start gap-6 lg:gap-8">
            <BentoRails side="left" />

            <div className="w-full max-w-4xl xl:max-w-5xl mx-auto min-w-0 space-y-8">
              {/* Top Sticky / Highlight Banner with Amber/Orange #FF8B06 Glow */}
              <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="size-9 rounded-full bg-[#FF8B06]/20 border border-[#FF8B06]/40 flex items-center justify-center shrink-0">
                    <Sparkles className="size-4 text-[#FF8B06]" />
                  </div>
                  <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                    This startup is for sale. Asking price: <span className="text-[#FF8B06]">{formatMoney(item.askingPrice)}</span>
                  </div>
                </div>

                <a
                  href={`mailto:${item.email}?subject=Inquiry%20regarding%20${encodeURIComponent(item.name)}%20acquisition`}
                  className="h-10 px-6 rounded-full font-bold text-xs sm:text-sm text-white bg-[#FF8B06] hover:bg-orange-600 shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Mail className="size-3.5" />
                  Contact Seller
                </a>
              </div>

              {/* Header Row & Breadcrumbs */}
              <div className="space-y-4">
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Home
                  </Link>
                  <ChevronRight className="size-3" />
                  <Link href="/buy-sell" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Buy/Sell
                  </Link>
                  <ChevronRight className="size-3" />
                  <span className="text-zinc-900 dark:text-white font-semibold truncate">{item.name}</span>
                </nav>

                {/* Profile Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
                  <div className="flex items-start gap-4">
                    <div className="size-16 sm:size-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-2 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                      <FaviconImage
                        url={item.url}
                        name={item.name}
                        src={item.favicon}
                        size={64}
                        containerClassName="rounded-xl size-full"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                          {item.name}
                        </h1>
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                          {item.category}
                        </span>
                      </div>

                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans max-w-2xl">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="h-10 px-4 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="size-3.5" />
                      <span>{copied ? 'Copied Link!' : 'Share'}</span>
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 px-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Key Financials Grid (4 Columns) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Card 1: Asking Price */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center sm:text-left space-y-1">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Asking Price
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-teal-600 dark:text-[#08F9C9]">
                    {formatMoney(item.askingPrice)}
                  </div>
                </div>

                {/* Card 2: Claimed MRR */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center sm:text-left space-y-1">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Claimed MRR
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                    {formatMoney(item.mrr)}
                  </div>
                </div>

                {/* Card 3: TTM Revenue */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center sm:text-left space-y-1">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    TTM Revenue
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                    {formatMoney(item.ttmRevenue)}
                  </div>
                </div>

                {/* Card 4: Date Listed */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center sm:text-left space-y-1">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Date Listed
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                    {item.dateListed}
                  </div>
                </div>
              </div>

              {/* Bento Box Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Block 1: About the product (Spans 2 cols on md) */}
                <div className="md:col-span-2 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Globe className="size-4 text-blue-500" />
                    About the Product
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
                    {item.about}
                  </p>
                </div>

                {/* Block 2: Tech Stack */}
                <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Code2 className="size-4 text-amber-500" />
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-[#C0FF00]/50 dark:border-[#C0FF00]/30 shadow-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Block 3: Pricing Model */}
                <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="size-4 text-emerald-500" />
                    Pricing Model
                  </h3>
                  <p className="text-sm font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {item.pricingModel}
                  </p>
                </div>

                {/* Block 4: Team Size */}
                <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Users className="size-4 text-purple-500" />
                    Team Size
                  </h3>
                  <p className="text-sm font-sans font-semibold text-zinc-800 dark:text-zinc-200">
                    {item.teamSize}
                  </p>
                </div>

                {/* Block 5: Platforms */}
                <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="size-4 text-sky-500" />
                    Supported Platforms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {item.platforms.map((p) => (
                      <span
                        key={p}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Block 6: Growth Channels (Spans 2 cols on md) */}
                <div className="md:col-span-2 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="size-4 text-emerald-500" />
                    Primary Growth Channels
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {item.growthChannels.map((channel) => (
                      <li
                        key={channel}
                        className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2"
                      >
                        <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                        {channel}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Founder Message & CTA Block */}
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                  <div className="relative size-16 rounded-full overflow-hidden border-2 border-blue-500 shrink-0">
                    <Image
                      src={item.founderAvatar}
                      alt={item.founderName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="space-y-2 min-w-0 flex-1">
                    <blockquote className="text-sm sm:text-base italic text-zinc-600 dark:text-zinc-300 font-serif leading-relaxed">
                      &ldquo;{item.founderQuote}&rdquo;
                    </blockquote>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white">
                      {item.founderName} <span className="font-normal text-zinc-500">· {item.founderRole}</span>
                    </div>
                  </div>
                </div>

                {/* Centered CTA Block */}
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-center space-y-3 shadow-sm">
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                    Interested in acquiring this project?
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                    Contact the founder directly to discuss metrics, due diligence, and acquisition pricing.
                  </p>
                  <div className="pt-1 flex justify-center">
                    <a
                      href={`mailto:${item.email}?subject=Inquiry%20regarding%20${encodeURIComponent(item.name)}%20acquisition`}
                      className="px-7 py-3 rounded-full font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-md hover:shadow-blue-500/20 active:scale-95 transition-all inline-flex items-center gap-2"
                    >
                      <Mail className="size-4" />
                      Email Founder
                    </a>
                  </div>
                </div>
              </div>

              {/* More Startups for Sale */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  More Startups for Sale
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {MORE_STARTUPS.map((startup) => (
                    <Link
                      key={startup.id}
                      href={`/buy-sell/${startup.id}`}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-xl bg-white dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 shrink-0 overflow-hidden">
                          <FaviconImage
                            url={`https://${startup.name}`}
                            name={startup.name}
                            src={startup.favicon}
                            size={32}
                            containerClassName="rounded-lg size-full"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-blue-500 transition-colors truncate">
                            {startup.name}
                          </div>
                          <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 mt-0.5">
                            {startup.category}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                        {startup.description}
                      </p>

                      <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-500">Asking: <strong className="text-blue-600 dark:text-[#08F9C9]">{formatMoney(startup.askingPrice)}</strong></span>
                        <span className="text-zinc-500">MRR: <strong className="text-zinc-900 dark:text-white">{formatMoney(startup.mrr)}</strong></span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <BentoRails side="right" />
          </div>
        </main>

        <Footer />
      </div>
    </MobileLayout>
  );
}
