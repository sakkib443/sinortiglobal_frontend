import { Suspense } from 'react';
import type { Metadata } from 'next';
import NewHomePage from '@/components/home/NewHomePage';

export const metadata: Metadata = {
  title: "Source Quality Products from China to Bangladesh",
  description: "Sinotri Global is your trusted B2B trading platform — sourcing, shipping, freight forwarding, and customs clearance from China to Bangladesh. Browse thousands of quality products at the best prices.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <NewHomePage />
    </Suspense>
  );
}
