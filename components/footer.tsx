"use client"

import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 py-6">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>© 2026 DropYourSaaS · Developer Directory &amp; Software Index</p>
        <div className="flex items-center gap-3 text-[11px]">
          <Link href="/stats" className="hover:text-foreground transition-colors">Directory Stats</Link>
          <span>·</span>
          <Link href="/rules" className="hover:text-foreground transition-colors">Guidelines</Link>
          <span>·</span>
          <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
        </div>
      </div>
    </footer>
  )
}