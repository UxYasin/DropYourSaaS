"use client"

import { useRef, useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TrendingSection } from "@/components/trending-section"
import { LatestActivity } from "@/components/latest-activity"
import { LeaderboardList } from "@/components/leaderboard-list"
import { Footer } from "@/components/footer"
import { MobileLayout } from "@/components/mobile-layout"

import { BentoRails } from "@/components/bento-rails"

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedRank, setSelectedRank] = useState<number | undefined>()
  const [selectedBid, setSelectedBid] = useState<number | undefined>()

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
              <HeroSection key={selectedRank} ref={inputRef} selectedRank={selectedRank} selectedBid={selectedBid} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <TrendingSection />
                <LatestActivity />
              </div>

              <div className="mt-4">
                <LeaderboardList onClaimClick={handleClaimClick} />
              </div>
            </div>

            <BentoRails side="right" />
          </div>
        </main>
        <Footer />
      </div>
    </MobileLayout>
  )
}