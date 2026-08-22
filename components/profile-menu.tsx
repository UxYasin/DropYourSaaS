'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogIn, HelpCircle, MessageSquare, LayoutGrid, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Profile Icon Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User Profile Menu"
        className={cn(
          'relative rounded-full transition-colors',
          isOpen && 'bg-muted'
        )}
      >
        <User className="h-5 w-5 text-foreground" />
        {isLoggedIn && (
          <span className="absolute top-1 right-1 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
        )}
      </Button>

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border/80 shadow-2xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150 text-foreground font-sans">
          {isLoggedIn ? (
            /* LOGGED IN MENU */
            <div className="space-y-1">
              {/* User Header */}
              <div className="px-3 py-2 border-b border-border/60 mb-1">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs font-mono">
                    ME
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold font-sans truncate text-foreground">My Account</div>
                    <div className="text-[10px] font-mono text-muted-foreground truncate">creator@dropyoursaas.com</div>
                  </div>
                </div>
              </div>

              {/* My Listings */}
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted/70 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="size-4 text-amber-500" />
                  <span>My listings</span>
                </div>
                <ChevronRight className="size-3.5 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
              </Link>

              {/* Messages */}
              <Link
                href="/messages"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted/70 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="size-4 text-blue-500" />
                  <span>Messages</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-primary/20 text-primary">
                  2
                </span>
              </Link>

              {/* Support */}
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <HelpCircle className="size-4 text-emerald-500" />
                <span>Support</span>
              </Link>

              <div className="border-t border-border/60 my-1" />

              {/* Logout */}
              <button
                type="button"
                onClick={() => {
                  setIsLoggedIn(false);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="size-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* LOGGED OUT MENU */
            <div className="space-y-1">
              {/* Log In */}
              <button
                type="button"
                onClick={() => {
                  setIsLoggedIn(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted/70 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <LogIn className="size-4 text-primary" />
                  <span className="font-semibold">Log In</span>
                </div>
                <ChevronRight className="size-3.5 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
              </button>

              {/* Support */}
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <HelpCircle className="size-4 text-emerald-500" />
                <span>Support</span>
              </Link>
            </div>
          )}

          {/* Quick State Toggle for Demo / Testing */}
          <div className="mt-1 pt-1.5 border-t border-border/50 text-[10px] text-muted-foreground px-3 py-1 flex items-center justify-between font-mono bg-muted/20 rounded-b-xl">
            <span className="flex items-center gap-1">
              <Sparkles className="size-3 text-amber-500" />
              <span>Status: {isLoggedIn ? 'Logged In' : 'Logged Out'}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsLoggedIn(!isLoggedIn)}
              className="text-primary hover:underline font-semibold"
            >
              Toggle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
