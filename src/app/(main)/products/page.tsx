"use client";

import { Suspense } from 'react';
import ProductsPage from '@/components/products/ProductsPage';

export default function ProductsRoutePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
            </div>
        }>
            <ProductsPage />
        </Suspense>
    );
}
