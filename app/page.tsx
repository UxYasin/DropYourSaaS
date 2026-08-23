"use client"

import { useRef, useState, useEffect, Suspense } from "react"
import { CheckCircle2, X } from "lucide-react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TrendingSection } from "@/components/trending-section"
import { LatestActivity } from "@/components/latest-activity"
import { LeaderboardList } from "@/components/leaderboard-list"
import { Footer } from "@/components/footer"
import { MobileLayout } from "@/components/mobile-layout"

import { BentoRails } from "@/components/bento-rails"
import { CongratulationsModal } from "@/components/congratulations-modal"

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedRank, setSelectedRank] = useState<number | undefined>()
  const [selectedBid, setSelectedBid] = useState<number | undefined>()
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(false)
  const [showCongratsModal, setShowCongratsModal] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('verified') === 'true') {
        setShowVerifiedBanner(true);
        setShowCongratsModal(true);
      }
    }
  }, []);

  const handleClaimClick = (rank: number, bid: number) => {
    setSelectedRank(rank)
    setSelectedBid(bid)
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <MobileLayout>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-8">
          <div className="flex justify-center items-start gap-8">
            <BentoRails side="left" />

            <div className="max-w-3xl w-full mx-auto min-w-0">
              {showVerifiedBanner && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs sm:text-sm font-mono flex items-center justify-between shadow-lg animate-in fade-in-50 duration-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                    <span>🎉 Your SaaS listing has been verified &amp; published to the public directory!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVerifiedBanner(false)}
                    className="text-emerald-400 hover:text-white p-1"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              <HeroSection key={selectedRank} ref={inputRef} selectedRank={selectedRank} selectedBid={selectedBid} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <TrendingSection />
                <LatestActivity />
              </div>

              <div id="index-feed" className="mt-4">
                <Suspense fallback={null}>
                  <LeaderboardList onClaimClick={handleClaimClick} />
                </Suspense>
              </div>
            </div>

            <BentoRails side="right" />
          </div>
        </main>
        <Footer />
      </div>

      <Suspense fallback={null}>
        <CongratulationsModal
          isOpen={showCongratsModal}
          onClose={() => setShowCongratsModal(false)}
        />
      </Suspense>
    </MobileLayout>
  )
}