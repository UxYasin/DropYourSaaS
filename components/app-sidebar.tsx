'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Leaderboard', href: '/' },
  { title: 'Advertise', href: '/advertise' },
  { title: 'Guidelines', href: '/rules' },
  { title: 'About', href: '/about' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  // Desktop nav lives in the header instead — Sidebar's desktop variant
  // reserves layout width even when visually hidden, so skip mounting it.
  if (!isMobile) return null;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-light.svg"
            alt="DropYourSaaS"
            width={120}
            height={40}
            className="h-6 w-auto block dark:hidden"
          />
          <Image
            src="/logo-dark.svg"
            alt="DropYourSaaS"
            width={120}
            height={40}
            className="h-6 w-auto hidden dark:block"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={pathname === item.href}
                className={cn(pathname === item.href && 'bg-muted')}
                render={<Link href={item.href} />}
              >
                {item.title}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
