"use client";

import React, { useState, useEffect, useRef } from 'react';

const Preloader: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [progress, setProgress] = useState(0);

    const pageLoadedRef = useRef(false);
    const finishedRef = useRef(false);
    const progressRef = useRef(0);

    useEffect(() => {
        const markLoaded = () => { pageLoadedRef.current = true; };
        if (document.readyState === 'complete') pageLoadedRef.current = true;
        else window.addEventListener('load', markLoaded);

        const finish = () => {
            if (finishedRef.current) return;
            finishedRef.current = true;
            setProgress(100);
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => setIsLoading(false), 700);
            }, 520);
        };

        // 0 → 100 plays at a constant, even pace (linear) over a fixed window,
        // while the homepage loads in the background during it.
        const MIN_DURATION = 3000;
        const start = performance.now();

        let raf = 0;
        const loop = (now: number) => {
            if (finishedRef.current) return;
            const elapsed = now - start;
            const t = Math.min(elapsed / MIN_DURATION, 1);
            let p = t * 100;
            if (!pageLoadedRef.current) p = Math.min(p, 92);
            else if (t < 1) p = Math.min(p, 99);

            progressRef.current = p;
            setProgress(p);

            if (pageLoadedRef.current && t >= 1) { finish(); return; }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        const safety = setTimeout(() => { pageLoadedRef.current = true; }, 8000);

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(safety);
            window.removeEventListener('load', markLoaded);
        };
    }, []);

    if (!isLoading) return null;

    const pct = Math.min(progress, 100);
    const rounded = Math.round(pct);
    const RING_C = 2 * Math.PI * 54; // progress-ring circumference (r=54)

    return (
        <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden transition-all duration-700 ease-out ${fadeOut ? 'opacity-0 scale-[1.04]' : 'opacity-100 scale-100'}`}
            style={{ pointerEvents: fadeOut ? 'none' : 'auto', background: 'var(--color-primary-dark)' }}
        >
            <style>{`
                @keyframes plAurora {
                    0%   { transform: translate(-12%, -8%) scale(1); }
                    33%  { transform: translate(10%, 6%) scale(1.15); }
                    66%  { transform: translate(-6%, 10%) scale(1.05); }
                    100% { transform: translate(-12%, -8%) scale(1); }
                }
                @keyframes plAurora2 {
                    0%   { transform: translate(8%, 10%) scale(1.1); }
                    50%  { transform: translate(-10%, -6%) scale(1); }
                    100% { transform: translate(8%, 10%) scale(1.1); }
                }
                @keyframes plSpin { to { transform: rotate(360deg); } }
                @keyframes plPop { 0% { opacity: 0; transform: scale(0.85); } 100% { opacity: 1; transform: scale(1); } }
                @keyframes plFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes plShimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(320%); } }
                @keyframes plDot { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }
                @media (prefers-reduced-motion: reduce) {
                    .pl-anim { animation: none !important; }
                }
            `}</style>

            {/* ── Animated aurora background ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="pl-anim absolute -top-1/3 -left-1/4 w-[80vw] h-[80vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 65%)', filter: 'blur(80px)', opacity: 0.9, animation: 'plAurora 14s ease-in-out infinite' }}
                />
                <div
                    className="pl-anim absolute -bottom-1/3 -right-1/4 w-[70vw] h-[70vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 65%)', filter: 'blur(90px)', opacity: 0.5, animation: 'plAurora2 16s ease-in-out infinite' }}
                />
                <div
                    className="pl-anim absolute top-1/4 right-1/3 w-[45vw] h-[45vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.25, animation: 'plAurora 20s ease-in-out infinite reverse' }}
                />
                {/* dotted texture + dark vignette for depth */}
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '46px 46px' }} />
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.35) 100%)' }} />
            </div>

            {/* ── Content ── */}
            <div className="relative z-10 flex flex-col items-center px-6 text-center">

                {/* Circular progress ring with orbiting glow dot + center counter */}
                <div
                    className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center"
                    style={{ animation: 'plPop 0.7s cubic-bezier(0.22,1,0.36,1) both' }}
                >
                    {/* glassy plate behind the ring */}
                    <div className="absolute inset-2 rounded-full" style={{ background: 'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.10), rgba(255,255,255,0.02))', backdropFilter: 'blur(2px)' }} />

                    {/* orbiting glow dot */}
                    <div className="pl-anim absolute inset-0" style={{ animation: 'plSpin 1.6s linear infinite' }}>
                        <span className="absolute left-1/2 -top-px -translate-x-1/2 w-2 h-2 rounded-full bg-white" style={{ boxShadow: '0 0 10px 2px rgba(255,255,255,0.85)' }} />
                    </div>

                    {/* progress ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="2.5" />
                        <circle
                            cx="60" cy="60" r="54" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
                            strokeDasharray={RING_C}
                            strokeDashoffset={RING_C * (1 - pct / 100)}
                            style={{ transition: 'stroke-dashoffset 0.12s linear', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.6))' }}
                        />
                    </svg>

                    {/* center counter */}
                    <span className="text-3xl sm:text-4xl font-extralight text-white tabular-nums tracking-tight select-none">
                        {rounded}<span className="text-sm align-super text-white/50 ml-0.5">%</span>
                    </span>
                </div>

                {/* Wordmark — light, airy with a soft shimmer sweep */}
                <div className="relative mt-8 overflow-hidden" style={{ animation: 'plFadeUp 0.7s ease-out 0.2s both' }}>
                    <h1 className="text-[18px] sm:text-[24px] font-light tracking-[0.4em] text-white select-none">
                        SINOTRI<span className="font-semibold">&nbsp;GLOBAL</span>
                    </h1>
                    <div className="pl-anim absolute top-0 left-0 h-full w-1/3" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', animation: 'plShimmer 2.6s ease-in-out infinite' }} />
                </div>

                {/* Tagline + animated dots */}
                <div
                    className="mt-3 flex items-center gap-2 text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.42em] text-white/55"
                    style={{ animation: 'plFadeUp 0.7s ease-out 0.32s both' }}
                >
                    Sourcing the world to you
                    <span className="flex gap-1 ml-1">
                        <span className="pl-anim w-1 h-1 rounded-full bg-white" style={{ animation: 'plDot 1.2s ease-in-out infinite' }} />
                        <span className="pl-anim w-1 h-1 rounded-full bg-white" style={{ animation: 'plDot 1.2s ease-in-out 0.2s infinite' }} />
                        <span className="pl-anim w-1 h-1 rounded-full bg-white" style={{ animation: 'plDot 1.2s ease-in-out 0.4s infinite' }} />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
