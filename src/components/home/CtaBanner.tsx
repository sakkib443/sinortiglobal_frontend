"use client";

import React from 'react';
import Link from 'next/link';

const CtaBanner: React.FC = () => {
    return (
        <section className="w-full relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] via-[#0d5a2e] to-[var(--color-primary)]" />
            <div className="absolute inset-0 bg-[url('/images/hero.jpg')] bg-cover bg-center opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/90 via-[var(--color-primary)]/80 to-[var(--color-primary)]/90" />

            {/* Content */}
            <div className="relative container mx-auto px-2 py-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Are you prepared to begin?
                </h2>
                <p className="text-sm md:text-base text-white/70 mb-8 max-w-xl mx-auto">
                    Explore millions of products from trusted suppliers by signing up today!
                </p>
                <Link
                    href="/register"
                    className="inline-block bg-white text-[var(--color-primary)] font-semibold text-sm px-8 py-3 rounded-md hover:bg-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                    Let's Sinotri
                </Link>
            </div>
        </section>
    );
};

export default CtaBanner;
