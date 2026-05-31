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
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Container-relative cover: a 16:9 video fills the banner at every
                            breakpoint. The cover height = (9/16) ÷ (banner aspect):
                            mobile 16/9 → 100%, sm 16/7 → 128.57%, lg 16/5.5 → 163.64%. */}
                        <iframe
                            src={isActive ? embed : 'about:blank'}
                            title="Sinotri Global"
                            allow="autoplay; encrypted-media"
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full sm:h-[128.571%] lg:h-[163.636%] border-0"
                        />
                        {/* Transparent overlay captures every hover/tap so YouTube never
                            reveals its player controls (play/pause/prev/next). */}
                        <div className="absolute inset-0 z-[1]" />
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
                    controls={false}
                    disablePictureInPicture
                    controlsList="nodownload noplaybackrate nofullscreen noremoteplayback"
                    className="hero-video w-full h-full object-cover pointer-events-none"
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
        <div className="relative w-full overflow-hidden bg-black aspect-[16/9] sm:aspect-[16/7] lg:aspect-[16/5.5]">
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
