"use client";

import React, { useState, useEffect } from 'react';
import { getYouTubeEmbedUrl } from '@/utils/youtube';

export interface HeroSlide {
    mediaType?: 'image' | 'video';
    imageUrl?: string;
    videoUrl?: string;
    youtubeUrl?: string;
    active?: boolean;
}

/**
 * The actual hero banner carousel — shared between the public homepage
 * (HeroSection, fed from the API) and the admin live preview (fed from the
 * unsaved form state). Keeping a single renderer guarantees the preview looks
 * exactly like the real homepage.
 */
const HeroCarousel: React.FC<{ slides: HeroSlide[] }> = ({ slides }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [slides.length]);

    // Reset current if slides change
    useEffect(() => {
        if (current >= slides.length) setCurrent(0);
    }, [slides.length, current]);

    const renderSlide = (slide: HeroSlide, isActive: boolean) => {
        const isVideo = slide.mediaType === 'video';

        // YouTube video slide
        if (isVideo && slide.youtubeUrl) {
            const embed = getYouTubeEmbedUrl(slide.youtubeUrl);
            if (embed) {
                return (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* Container-relative cover: the 16:9 video fills the 16:5.5 banner.
                            height 163.64% = (9/16) ÷ (5.5/16), so it works at any pixel size — full-width homepage AND the small admin preview. */}
                        <iframe
                            src={isActive ? embed : 'about:blank'}
                            title="Sinotri Global"
                            allow="autoplay; encrypted-media"
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[163.64%] border-0"
                        />
                    </div>
                );
            }
        }

        // Uploaded video slide
        if (isVideo && slide.videoUrl) {
            return (
                <video
                    src={slide.videoUrl}
                    autoPlay={isActive}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                />
            );
        }

        // Image slide (default)
        return (
            <img
                src={slide.imageUrl || '/images/hero.jpg'}
                alt="Sinotri Global"
                className="w-full h-full object-cover"
            />
        );
    };

    return (
        <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: '16 / 5.5' }}>
            {slides.map((slide, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    {renderSlide(slide, idx === current)}
                </div>
            ))}

            {/* Dots */}
            {slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === current ? 'bg-white w-7' : 'bg-white/50'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HeroCarousel;
