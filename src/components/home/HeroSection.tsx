"use client";

import React, { useState, useEffect } from 'react';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';

const HeroSection: React.FC = () => {
    const { data: res } = useGetSiteContentQuery({});
    const [current, setCurrent] = useState(0);

    // Get slides from API or fallback
    const apiSlides = res?.data?.heroSlides?.filter((s: any) => s.active !== false) || [];
    const slides = apiSlides.length > 0
        ? apiSlides.map((s: any) => ({ image: s.imageUrl }))
        : [{ image: '/images/hero.jpg' }];

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    // Reset current if slides change
    useEffect(() => {
        if (current >= slides.length) setCurrent(0);
    }, [slides.length, current]);

    return (
        <section className="w-full">
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 4.5' }}>
                {slides.map((slide: any, idx: number) => (
                    <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img
                            src={slide.image}
                            alt="Sinotri Global"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}

                {/* Dots */}
                {slides.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                        {slides.map((_: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === current ? 'bg-white w-7' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroSection;
