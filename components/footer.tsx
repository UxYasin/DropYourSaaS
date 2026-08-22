"use client"

import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Separator className="mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 DropYourSaaS · Developer Directory &amp; Software Index</p>
          <div className="flex items-center gap-4">
            <Link href="/stats" className="hover:text-foreground transition-colors">Directory Stats</Link>
            <Link href="/rules" className="hover:text-foreground transition-colors">Guidelines</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}