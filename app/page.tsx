"use client"

import { useRef, useState, useEffect, Suspense } from "react"
import { CheckCircle2, X } from "lucide-react"
import { Header } from "@/components/header"
import { LeftHeroSidebar } from "@/components/left-hero-sidebar"
import { LeaderboardList } from "@/components/leaderboard-list"
import { RightAdsSidebar } from "@/components/right-ads-sidebar"
import { Footer } from "@/components/footer"
import { MobileLayout } from "@/components/mobile-layout"
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
        const timer = setTimeout(() => {
          setShowVerifiedBanner(true);
          setShowCongratsModal(true);
        }, 0);
        return () => clearTimeout(timer);
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
      <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-blue-600 selection:text-white">
        <Header />

        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-7">
          {showVerifiedBanner && (
            <div className="mb-6 p-4 rounded-2xl bg-blue-950/60 border border-blue-500/50 text-blue-300 text-xs font-mono flex items-center justify-between shadow-md animate-in fade-in-50 duration-300 w-full mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-blue-400 shrink-0" />
                <span>🎉 Your SaaS listing has been verified &amp; published to the public directory!</span>
              </div>
              <button
                type="button"
                onClick={() => setShowVerifiedBanner(false)}
                className="text-blue-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          {/* 3-Column Layout with Balanced Breathing Room */}
          <div className="flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-7 xl:gap-8 w-full">
            {/* 1. Left Sticky Column: Hero Pitch & Instant Claim Widget + Recent Bids */}
            <LeftHeroSidebar
              ref={inputRef}
              selectedRank={selectedRank}
              selectedBid={selectedBid}
            />

            {/* 2. Center Column: Well-Proportioned Clean Leaderboard Feed */}
            <div className="flex-1 w-full min-w-0 max-w-[720px] xl:max-w-[760px] 2xl:max-w-[800px] space-y-4">
              <Suspense fallback={null}>
                <LeaderboardList onClaimClick={handleClaimClick} />
              </Suspense>
            </div>

            {/* 3. Right Sticky Column: Dedicated Ads Only */}
            <RightAdsSidebar />
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