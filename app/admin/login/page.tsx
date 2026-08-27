'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Lock, User, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, username: identifier, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Invalid admin credentials.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-md rounded-3xl border border-border shadow-xl bg-card">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-[#FFFC00] flex items-center justify-center mx-auto border border-amber-500/20">
            <ShieldCheck className="size-6" />
          </div>
          <CardTitle className="text-2xl font-mono font-extrabold tracking-tight">
            DropYourSaaS Admin
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Sign in to access analytics breakdown, traffic control, and listings
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/15 text-destructive text-xs font-medium border border-destructive/30 text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <Label htmlFor="admin-id" className="text-xs font-bold">
                User ID or Email
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                <Input
                  id="admin-id"
                  type="text"
                  placeholder="loladmin"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="pl-10 h-10 rounded-xl border-border bg-muted/30 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <Label htmlFor="admin-password" className="text-xs font-bold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-10 rounded-xl border-border bg-muted/30 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#FFFC00] hover:bg-[#FFFC00]/90 text-black font-mono font-bold text-xs shadow-md transition-all mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
