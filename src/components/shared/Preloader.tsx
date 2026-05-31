"use client";

import React, { useState, useEffect, useRef } from 'react';

const Preloader: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [progress, setProgress] = useState(0);

    const pageLoadedRef = useRef(false);
    const finishedRef = useRef(false);

    useEffect(() => {
        // Mark when the actual page has fully loaded.
        const markLoaded = () => { pageLoadedRef.current = true; };
        if (document.readyState === 'complete') {
            pageLoadedRef.current = true;
        } else {
            window.addEventListener('load', markLoaded);
        }

        const finish = () => {
            if (finishedRef.current) return;
            finishedRef.current = true;
            setProgress(100);
            // Hold at 100% briefly, then fade the website in.
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => setIsLoading(false), 700);
            }, 450);
        };

        // Smoothly count up. Race ahead to ~90% while assets load, then
        // only complete the final stretch once the page is actually ready.
        const tick = setInterval(() => {
            setProgress(prev => {
                if (finishedRef.current) return prev;

                // If the page is ready, drive straight to 100%.
                if (pageLoadedRef.current) {
                    const next = prev + Math.max(2, (100 - prev) * 0.25);
                    if (next >= 100) {
                        clearInterval(tick);
                        finish();
                        return 100;
                    }
                    return next;
                }

                // Otherwise ease toward 90% and wait there.
                if (prev >= 90) return 90;
                return prev + Math.max(1.5, (90 - prev) * 0.12);
            });
        }, 90);

        // Safety net: never let the preloader hang.
        const safety = setTimeout(finish, 6000);

        return () => {
            clearInterval(tick);
            clearTimeout(safety);
            window.removeEventListener('load', markLoaded);
        };
    }, []);

    if (!isLoading) return null;

    const rounded = Math.round(Math.min(progress, 100));

    return (
        <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center transition-all duration-700 ease-out ${fadeOut ? 'opacity-0 scale-[1.03]' : 'opacity-100 scale-100'}`}
            style={{
                background: 'radial-gradient(120% 120% at 50% 0%, #ffffff 0%, #f4f8f4 55%, #eaf3ec 100%)',
                pointerEvents: fadeOut ? 'none' : 'auto',
            }}
        >
            {/* Soft brand glows */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full"
                    style={{ background: 'rgba(24,118,74,0.10)', filter: 'blur(110px)', animation: 'preloaderFloat 7s ease-in-out infinite' }}
                />
                <div
                    className="absolute -bottom-40 -right-40 w-[460px] h-[460px] rounded-full"
                    style={{ background: 'rgba(34,197,94,0.10)', filter: 'blur(90px)', animation: 'preloaderFloat 9s ease-in-out infinite reverse' }}
                />
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(11,66,34,0.6) 1px, transparent 1px)',
                        backgroundSize: '38px 38px',
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center px-6">

                {/* Logo with animated ring */}
                <div className="relative mb-10 flex items-center justify-center">
                    <div className="absolute w-44 h-44 sm:w-48 sm:h-48" style={{ animation: 'preloaderSpin 3.2s linear infinite' }}>
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                            <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(11,66,34,0.07)" strokeWidth="2" />
                            <circle cx="100" cy="100" r="96" fill="none" stroke="url(#preloaderRing)" strokeWidth="3" strokeDasharray="120 480" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="preloaderRing" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#22c55e" />
                                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div
                        className="relative flex items-center justify-center rounded-3xl bg-white px-7 py-6 shadow-[0_18px_50px_-12px_rgba(11,66,34,0.25)]"
                        style={{ animation: 'preloaderPop 0.7s cubic-bezier(0.22,1,0.36,1) both, preloaderPulse 2.4s ease-in-out 0.7s infinite' }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.svg" alt="Sinotri Global" className="h-9 sm:h-11 w-auto select-none" draggable={false} />
                    </div>
                </div>

                {/* Progress */}
                <div className="w-60 sm:w-72" style={{ animation: 'preloaderFadeUp 0.7s ease-out 0.25s both' }}>
                    <div className="relative h-[5px] w-full overflow-hidden rounded-full bg-[rgba(11,66,34,0.08)]">
                        <div
                            className="h-full rounded-full transition-all duration-300 ease-out"
                            style={{
                                width: `${Math.min(progress, 100)}%`,
                                background: 'linear-gradient(90deg, #0B4222, #18764a 55%, #22c55e)',
                                boxShadow: '0 0 10px rgba(34,197,94,0.45)',
                            }}
                        />
                        {/* Moving shimmer */}
                        <div
                            className="absolute top-0 left-0 h-full w-1/3"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                                animation: 'preloaderShimmer 1.4s ease-in-out infinite',
                            }}
                        />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#0B4222]/45">
                            Loading
                        </span>
                        <span className="text-[13px] font-bold tabular-nums text-[#18764a]">
                            {rounded}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
