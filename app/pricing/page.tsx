import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Advertise & Pricing | DropYourSaaS.com',
  description: 'Direct advertising, pay-to-rank leaderboard listings, and high-visibility sponsor slots on DropYourSaaS.com.',
};

export default function PricingPage() {
  redirect('/advertise');
}

