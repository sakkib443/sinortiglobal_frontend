"use client";

import React from 'react';
import { FiGlobe, FiShield, FiLock, FiTruck, FiRefreshCw, FiEye } from 'react-icons/fi';

const features = [
    {
        icon: FiGlobe,
        color: 'bg-blue-50 text-blue-500',
        title: 'Worldwide Purchase',
        desc: 'You have no boundaries for purchasing products that you like!',
    },
    {
        icon: FiShield,
        color: 'bg-green-50 text-green-500',
        title: 'Verified Sellers',
        desc: 'We provide you with our verified seller that helps get a quality product',
    },
    {
        icon: FiLock,
        color: 'bg-purple-50 text-purple-500',
        title: 'Safe Payment',
        desc: 'We care about every penny of our customers & we ensure safety of that',
    },
    {
        icon: FiTruck,
        color: 'bg-orange-50 text-orange-500',
        title: 'Fast Delivery',
        desc: 'Shipping for Select Items Thanks to Our Enhanced Logistics Network',
    },
    {
        icon: FiRefreshCw,
        color: 'bg-red-50 text-red-500',
        title: 'Refund Policy',
        desc: 'Our refund policy ensures we facilitate a hassle-free refund process',
    },
    {
        icon: FiEye,
        color: 'bg-teal-50 text-teal-500',
        title: 'Transparency',
        desc: 'With us, you can expect clarity, accountability, & a commitment to ethical business',
    },
];

const QualityFeatures: React.FC = () => {
    return (
        <section className="w-full bg-[var(--color-primary)] py-14 px-4">
            {/* Heading */}
            <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-primary-foreground)] mb-2">
                    Quality Choices, <span className="text-[var(--color-primary-foreground)]">Affordable Prices!</span>
                </h2>
                <p className="text-sm text-[var(--color-primary-foreground)] opacity-70 max-w-xl mx-auto">
                    Why thousands of customers trust Sinotri Global for their sourcing needs
                </p>
            </div>

            {/* Feature Cards */}
            <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {features.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col items-center text-center bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl py-6 px-3 transition-all duration-200 group cursor-default"
                    >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform duration-200`}>
                            <item.icon size={26} />
                        </div>
                        <h4 className="text-[13px] font-bold text-[var(--color-primary-foreground)] mb-1.5">{item.title}</h4>
                        <p className="text-[11px] text-[var(--color-primary-foreground)] opacity-65 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default QualityFeatures;
