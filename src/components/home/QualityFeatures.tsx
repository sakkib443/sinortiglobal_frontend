"use client";

import React from 'react';
import { FiGlobe, FiShield, FiLock, FiTruck, FiRefreshCw, FiEye } from 'react-icons/fi';

const features = [
    {
        icon: FiGlobe,
        title: 'Worldwide Purchase',
        desc: 'You have no boundaries for purchasing products that you like!',
    },
    {
        icon: FiShield,
        title: 'Verified Sellers',
        desc: 'We provide you with our verified seller that helps get a quality product',
    },
    {
        icon: FiLock,
        title: 'Safe Payment',
        desc: 'We care about every penny of our customers & we ensure safety of that',
    },
    {
        icon: FiTruck,
        title: 'Fast Delivery',
        desc: 'Shipping for Select Items Thanks to Our Enhanced Logistics Network',
    },
    {
        icon: FiRefreshCw,
        title: 'Refund Policy',
        desc: 'Our refund policy ensures we facilitate a hassle-free refund process',
    },
    {
        icon: FiEye,
        title: 'Transparency',
        desc: 'With us, you can expect clarity, accountability, & a commitment to ethical business',
    },
];

const QualityFeatures: React.FC = () => {
    return (
        <section className="w-full bg-[var(--color-primary-lightest)] border-t border-[var(--color-primary)]/10">
            <div className="container mx-auto px-2 py-10">
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">Quality Choices, <span className="text-[var(--color-primary)]">Affordable Prices!</span></h3>
                    <p className="text-sm text-gray-400 mt-1">Why thousands of customers trust Sinotri Global for their sourcing needs</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                    {features.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group">
                            <div className="w-14 h-14 rounded-xl bg-white border border-[var(--color-primary)]/15 flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md group-hover:border-[var(--color-primary)]/30 transition-all duration-300">
                                <item.icon size={24} className="text-[var(--color-primary)]" />
                            </div>
                            <h4 className="text-[13px] font-semibold text-gray-800 mb-1">{item.title}</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default QualityFeatures;
