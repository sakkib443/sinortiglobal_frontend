"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

const Preloader: React.FC = () => {
    const { logoUrl } = useTheme();
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
            // Linear, constant-speed count — same pace start to finish.
            let p = t * 100;
            // Only pause near the end if the page genuinely isn't ready yet.
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

    return (
        <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center transition-all duration-700 ease-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
            style={{
                background: 'radial-gradient(135% 135% at 50% 0%, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                pointerEvents: fadeOut ? 'none' : 'auto',
            }}
        >
            {/* Subtle depth */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', filter: 'blur(140px)' }}
                />
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '44px 44px' }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center px-6">

                {/* Logo that fills from bottom to top as it loads */}
                <div
                    className="rounded-xl bg-white px-10 py-7 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.6)]"
                    style={{ animation: 'preloaderPop 0.7s cubic-bezier(0.22,1,0.36,1) both' }}
                >
                    <div className="relative inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={logoUrl}
                            alt="Sinotri Global"
                            className="block h-14 sm:h-16 w-auto max-w-[230px] object-contain opacity-[0.14] grayscale select-none"
                            draggable={false}
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={logoUrl}
                            alt=""
                            aria-hidden
                            className="absolute top-0 left-0 block h-14 sm:h-16 w-auto max-w-[230px] object-contain select-none"
                            style={{ clipPath: `inset(${100 - pct}% 0 0 0)` }}
                            draggable={false}
                        />
                    </div>
                </div>

                {/* Brand line */}
                <div
                    className="mt-7 text-[11px] sm:text-xs font-medium uppercase tracking-[0.42em] text-white/70"
                    style={{ animation: 'preloaderFadeUp 0.7s ease-out 0.25s both' }}
                >
                    Sinotri&nbsp;Global
                </div>

                {/* Thin progress line + counter */}
                <div className="mt-8 flex flex-col items-center gap-3" style={{ animation: 'preloaderFadeUp 0.7s ease-out 0.35s both' }}>
                    <div className="relative h-px w-56 sm:w-64 overflow-hidden bg-white/15">
                        <div
                            className="absolute inset-y-0 left-0 bg-white"
                            style={{ width: `${pct}%`, boxShadow: '0 0 10px rgba(255,255,255,0.7)' }}
                        />
                    </div>
                    <span className="text-[12px] font-light tabular-nums tracking-[0.25em] text-white/80">
                        {rounded.toString().padStart(2, '0')}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
