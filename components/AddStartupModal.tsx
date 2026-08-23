'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  CheckCircle2,
  Lock,
  Globe,
  Loader2,
  DollarSign,
  Users,
  Code2,
  TrendingUp,
  UserCheck,
  Building,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import { cn } from '@/lib/utils';
import { SPONSOR_TIERS, type SponsorTier } from '@/lib/sponsor-tiers';
import { usePaddlePrices } from '@/hooks/usePaddlePrices';

interface AddStartupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type UpsellOption = 'dofollow' | 'ai_boost' | 'sponsor_panel' | null;

const MARKET_CATEGORIES = [
  'SaaS',
  'Mobile Apps',
  'AI Tool',
  'Developer Tool',
  'E-commerce',
  'Productivity',
  'Marketing',
];

const TEAM_SIZES = ['1 Solo', '2-5 people', '6-10', '10+'];
const FUNDING_STATUSES = ['Bootstrapped', 'Pre-seed', 'Seed', 'Series A+'];

export function AddStartupModal({ isOpen, onClose, onSuccess }: AddStartupModalProps) {
  // Product & Basic info
  const [url, setUrl] = useState('');
  const [founderName, setFounderName] = useState('');
  const [locationCountry, setLocationCountry] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Manual Financial Metrics
  const [last30DaysRevenue, setLast30DaysRevenue] = useState('');
  const [mrr, setMrr] = useState('');
  const [activeSubscriptions, setActiveSubscriptions] = useState('');

  // Bento Box Product Details
  const [valueProposition, setValueProposition] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [audience, setAudience] = useState('');
  const [marketCategory, setMarketCategory] = useState('SaaS');
  const [pricingModel, setPricingModel] = useState('');
  const [teamSize, setTeamSize] = useState('1 Solo');
  const [fundingStatus, setFundingStatus] = useState('Bootstrapped');
  const [techStack, setTechStack] = useState('');
  const [marketingChannels, setMarketingChannels] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Buy/Sell Marketplace & Upsells
  const [isForSale, setIsForSale] = useState(false);
  const [askingPrice, setAskingPrice] = useState('');
  const [ttmRevenue, setTtmRevenue] = useState('');
  const [email, setEmail] = useState('');
  const [selectedUpsell, setSelectedUpsell] = useState<UpsellOption>(null);

  // Dynamic Scarcity & Paddle State
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | undefined>();
  const [activeSponsorTier, setActiveSponsorTier] = useState<SponsorTier>(SPONSOR_TIERS[0]);
  const [slotsFilled, setSlotsFilled] = useState(0);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch active sponsor slots & initialize Paddle.js
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/sponsor-slots')
      .then((res) => res.json())
      .then((data) => {
        if (data?.activeTier) setActiveSponsorTier(data.activeTier);
        if (data?.slotsFilled !== undefined) setSlotsFilled(data.slotsFilled);
        if (data?.detectedCountry) setDetectedCountry(data.detectedCountry);
      })
      .catch(() => {});

    const clientToken =
      process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || 'test_01m0qcs48f1f7w4w7r8';
    const env = (process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox') as 'sandbox' | 'production';

    initializePaddle({
      token: clientToken,
      environment: env,
      eventCallback: (event) => {
        if (event.name === 'checkout.completed') {
          console.log('Paddle checkout completed successfully:', event.data);
          setSuccess(true);
          setTimeout(() => {
            window.location.href = '/thank-you';
          }, 1000);
        }
      },
    }).then((p) => {
      if (p) setPaddle(p);
    });
  }, [isOpen]);

  const { prices: localizedPrices } = usePaddlePrices(paddle, detectedCountry);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('Please enter your SaaS / Product URL.');
      return;
    }

    if (isForSale && !email.trim()) {
      setError('Please enter your email address to enable buyer contact inquiries.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = {
      url: url.trim(),
      founderName,
      locationCountry,
      foundedYear,
      xHandle,
      isAnonymous,
      last30DaysRevenue,
      mrr,
      activeSubscriptions,
      valueProposition,
      problemSolved,
      audience,
      marketCategory,
      category: marketCategory,
      pricingModel,
      teamSize,
      fundingStatus,
      techStack,
      marketingChannels,
      additionalInfo,
      isForSale,
      askingPrice: isForSale ? askingPrice : undefined,
      ttmRevenue: isForSale ? ttmRevenue : undefined,
      email: email.trim(),
      selectedUpsell,
    };

    // If Side-panel sponsor spot (Paddle Overlay Checkout)
    if (selectedUpsell === 'sponsor_panel' && paddle) {
      try {
        paddle.Checkout.open({
          settings: {
            displayMode: 'overlay',
            variant: 'one-page',
            successUrl: '/thank-you',
          },
          items: [{ priceId: activeSponsorTier.priceId, quantity: 1 }],
          customData: formData,
          customer: email.trim() ? { email: email.trim() } : undefined,
        });
      } catch (err) {
        console.warn('Paddle overlay checkout error:', err);
        setError('Could not open checkout overlay. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Standard Submit or Polar API route
    try {
      const endpoint = selectedUpsell ? '/api/checkout' : '/api/submit';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          priceId: selectedUpsell === 'sponsor_panel' ? activeSponsorTier.priceId : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.success) {
        setSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else if (data?.url) {
        window.location.href = data.url;
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      }
    } catch {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeLocalizedPrice =
    localizedPrices[activeSponsorTier.priceId] || `$${activeSponsorTier.baseUsd}`;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-2xl transition-all my-auto">
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors z-10"
        >
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </button>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">
          {/* Header */}
          <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-[#08F9C9] text-xs font-mono font-bold">
              <Sparkles className="size-3.5" />
              Comprehensive Startup Profile
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Add your startup
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Showcase your verified product details &amp; metrics to 200,000+ monthly visitors. It&apos;s free!
            </p>
          </div>

          {/* Section 1: Founder & Company Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="size-4 text-blue-500" />
              Section 1: Founder &amp; Company Info
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                SaaS / Product URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourproject.com"
                className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Founder Name
                </label>
                <input
                  type="text"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  placeholder="e.g., Dogan"
                  className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Country / Location
                </label>
                <input
                  type="text"
                  value={locationCountry}
                  onChange={(e) => setLocationCountry(e.target.value)}
                  placeholder="United States"
                  className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Founded Year
                </label>
                <input
                  type="text"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  placeholder="2024"
                  className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  X Handle (optional)
                </label>
                <input
                  type="text"
                  value={xHandle}
                  onChange={(e) => setXHandle(e.target.value)}
                  placeholder="@username"
                  className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Anonymous Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  Anonymous mode
                  <span
                    title="Hide your exact product name and founder details on public directory"
                    className="cursor-help text-zinc-400 text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800"
                  >
                    ?
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Hide your exact product name and founder details from public index
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isAnonymous}
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                  isAnonymous ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                    isAnonymous ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Section 2: Financial Metrics (Manual) */}
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="size-4 text-emerald-500" />
                Section 2: Financial Metrics (Manual)
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 italic">
                Manually verify your current metrics. These will be displayed on your listing profile.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Last 30 Days Revenue ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={last30DaysRevenue}
                  onChange={(e) => setLast30DaysRevenue(e.target.value)}
                  placeholder="5400"
                  className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Current MRR ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={mrr}
                  onChange={(e) => setMrr(e.target.value)}
                  placeholder="1850"
                  className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Active Subscriptions
                </label>
                <input
                  type="number"
                  min="0"
                  value={activeSubscriptions}
                  onChange={(e) => setActiveSubscriptions(e.target.value)}
                  placeholder="120"
                  className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Product Details (The Bento Box) */}
          <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="size-4 text-purple-500" />
              Section 3: Product Details (The Bento Box)
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Value Proposition
              </label>
              <textarea
                rows={2}
                value={valueProposition}
                onChange={(e) => setValueProposition(e.target.value)}
                placeholder="E.g., Uses AI to help users quickly identify gemstones..."
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Problem Solved
              </label>
              <textarea
                rows={2}
                value={problemSolved}
                onChange={(e) => setProblemSolved(e.target.value)}
                placeholder="E.g., People often cannot identify a gemstone without visiting an expert..."
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Target Audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Jewelry owners, collectors, shoppers..."
                className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Market Category
                </label>
                <select
                  value={marketCategory}
                  onChange={(e) => setMarketCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  {MARKET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Pricing Model
                </label>
                <input
                  type="text"
                  value={pricingModel}
                  onChange={(e) => setPricingModel(e.target.value)}
                  placeholder="Freemium, $15/mo, etc."
                  className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Team Size
                </label>
                <select
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  {TEAM_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Funding
                </label>
                <select
                  value={fundingStatus}
                  onChange={(e) => setFundingStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  {FUNDING_STATUSES.map((fund) => (
                    <option key={fund} value={fund}>
                      {fund}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Tech Stack
              </label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="Next.js, React Native, Supabase (comma separated)"
                className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Marketing Channels
              </label>
              <input
                type="text"
                value={marketingChannels}
                onChange={(e) => setMarketingChannels(e.target.value)}
                placeholder="Meta Ads, SEO, X/Twitter (comma separated)"
                className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Additional Info (Optional)
              </label>
              <textarea
                rows={2}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Expansion areas, ASO strategies, etc."
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Paid Upsell Section */}
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="size-4 text-amber-500" />
                Boost Your Visibility (Optional Upsells)
              </h3>
              {selectedUpsell && (
                <button
                  type="button"
                  onClick={() => setSelectedUpsell(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1 ($19) */}
              <div
                onClick={() =>
                  setSelectedUpsell(selectedUpsell === 'dofollow' ? null : 'dofollow')
                }
                className={cn(
                  'relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-2',
                  selectedUpsell === 'dofollow'
                    ? 'bg-blue-500/10 border-blue-500 dark:border-[#08F9C9] ring-2 ring-blue-500/40 dark:ring-[#08F9C9]/40 shadow-lg'
                    : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-[#08F9C9]">
                    $19
                  </span>
                  {selectedUpsell === 'dofollow' && (
                    <CheckCircle2 className="size-4 text-blue-500 dark:text-[#08F9C9]" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">
                    Dofollow link · DA 69
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Build trust with a verified revenue profile &amp; permanent SEO backlink.
                  </p>
                </div>
              </div>

              {/* Card 2 ($79) */}
              <div
                onClick={() =>
                  setSelectedUpsell(selectedUpsell === 'ai_boost' ? null : 'ai_boost')
                }
                className={cn(
                  'relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-2',
                  selectedUpsell === 'ai_boost'
                    ? 'bg-blue-500/10 border-blue-500 dark:border-[#08F9C9] ring-2 ring-blue-500/40 dark:ring-[#08F9C9]/40 shadow-lg'
                    : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-[#08F9C9]">
                    $79
                  </span>
                  {selectedUpsell === 'ai_boost' && (
                    <CheckCircle2 className="size-4 text-blue-500 dark:text-[#08F9C9]" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">
                    AI visibility boost
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Give ChatGPT, Claude, and AI assistants a verified profile to recommend your SaaS.
                  </p>
                </div>
              </div>

              {/* Card 3 (Dynamic Scarcity Sponsor Spot) */}
              <div
                onClick={() =>
                  setSelectedUpsell(selectedUpsell === 'sponsor_panel' ? null : 'sponsor_panel')
                }
                className={cn(
                  'relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-2',
                  selectedUpsell === 'sponsor_panel'
                    ? 'bg-amber-500/10 border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/40 shadow-lg'
                    : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Zap className="size-3 text-amber-500 fill-amber-500" />
                    {activeLocalizedPrice}
                  </span>
                  {selectedUpsell === 'sponsor_panel' ? (
                    <CheckCircle2 className="size-4 text-amber-500" />
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      {activeSponsorTier.label}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">
                    Side-panel sponsor spot
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Put your startup in sponsor panels across 50,000+ views. Price increases as slots fill up!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Quote */}
          <div className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-1.5">
            <div className="flex justify-center gap-1 text-amber-400 text-sm">
              ★ ★ ★ ★ ★
            </div>
            <p className="text-xs italic text-zinc-700 dark:text-zinc-300 leading-relaxed font-serif">
              &ldquo;DropYourSaaS brought me $3,200 in new MRR, 27 new clients. Absolutely insane results.&rdquo;
            </p>
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
              — Romàn · Founder of GojiberryAI
            </div>
          </div>

          {/* Footer & Submission Actions */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
            {/* List for Sale Toggle & Conditional Acquisition Inputs */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-zinc-900 dark:text-white">
                    List for sale
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Feature in Buy/Sell marketplace feed &amp; receive buyer offers
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isForSale}
                  onClick={() => setIsForSale(!isForSale)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    isForSale ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                      isForSale ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* Conditional Acquisition Financials & Contact Email when List for Sale is ON */}
              {isForSale && (
                <div className="pt-2 animate-in fade-in-50 duration-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                        Asking Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={askingPrice}
                        onChange={(e) => setAskingPrice(e.target.value)}
                        placeholder="25000"
                        className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                        TTM Revenue ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={ttmRevenue}
                        onChange={(e) => setTtmRevenue(e.target.value)}
                        placeholder="19500"
                        className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Contact Email (Required for Buyers)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required={isForSale}
                      className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs font-mono text-amber-500 text-center animate-in fade-in-50">
                {error}
              </p>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold text-center animate-in fade-in-50">
                🎉 Startup submitted successfully! Redirecting...
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'px-7 py-3 rounded-full font-bold text-xs sm:text-sm text-white shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50',
                  selectedUpsell
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <span>
                    {selectedUpsell === 'sponsor_panel'
                      ? `Continue to Payment (${activeLocalizedPrice})`
                      : selectedUpsell === 'dofollow'
                      ? 'Continue to Payment ($19)'
                      : selectedUpsell === 'ai_boost'
                      ? 'Continue to Payment ($79)'
                      : 'Add startup (Free)'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
