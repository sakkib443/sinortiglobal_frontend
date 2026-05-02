import { Suspense } from 'react';
import NewHomePage from '@/components/home/NewHomePage';

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <NewHomePage />
    </Suspense>
  );
}
