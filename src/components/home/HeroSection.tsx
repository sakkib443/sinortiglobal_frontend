"use client";

import React from 'react';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';
import HeroCarousel, { HeroSlide } from './HeroCarousel';

const HeroSection: React.FC = () => {
    const { data: res } = useGetSiteContentQuery({});

    // Get slides from API or fallback
    const apiSlides: HeroSlide[] = res?.data?.heroSlides?.filter((s: HeroSlide) => s.active !== false) || [];
    const slides: HeroSlide[] = apiSlides.length > 0
        ? apiSlides
        : [{ mediaType: 'image', imageUrl: '/images/hero.jpg' }];

    return (
        <section className="w-full">
            <HeroCarousel slides={slides} />
        </section>
    );
};

export default HeroSection;
