"use client";

import React from 'react';
import Link from 'next/link';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';

interface Category {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
    image?: string;
}

const CategoryExpertise: React.FC = () => {
    const { data: categoriesData } = useGetCategoriesQuery({});
    const categories: Category[] = categoriesData?.data || [];

    // Triple for seamless infinite loop
    const displayCategories = categories.length > 0 ? [...categories, ...categories, ...categories] : [];

    return (
        <section className="w-full bg-gradient-to-b from-white to-gray-50/50">
            <div className="container mx-auto px-2 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-[#0B4222] rounded-full"></div>
                            <h3 className="text-lg font-bold text-gray-800">Top Categories</h3>
                        </div>
                        <Link href="/products" className="text-sm text-[#0B4222] hover:underline font-medium">
                            View All →
                        </Link>
                    </div>

                    {/* Carousel */}
                    <div className="category-carousel-wrapper">
                        <div className="category-carousel-track">
                            {displayCategories.length > 0 ? displayCategories.map((cat, idx) => (
                                <Link
                                    key={`${cat._id}-${idx}`}
                                    href={`/products?category=${cat._id}`}
                                    className="category-carousel-item flex flex-col items-center gap-3 group"
                                >
                                    <div className="w-[80px] h-[80px] rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-[#0B4222]/30 group-hover:shadow-xl group-hover:scale-110 group-hover:from-[#0B4222]/5 group-hover:to-[#0B4222]/10">
                                        {cat.image ? (
                                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{cat.icon || '📦'}</span>
                                        )}
                                    </div>
                                    <span className="text-[13px] text-gray-600 text-center font-medium group-hover:text-[#0B4222] transition-colors whitespace-nowrap">{cat.name}</span>
                                </Link>
                            )) : (
                                [...Array(8)].map((_, i) => (
                                    <div key={i} className="category-carousel-item flex flex-col items-center gap-3">
                                        <div className="w-[80px] h-[80px] rounded-2xl bg-gray-100 animate-pulse" />
                                        <div className="w-14 h-3 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoryExpertise;
