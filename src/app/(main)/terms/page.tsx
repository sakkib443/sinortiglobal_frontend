"use client";

import React from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiFileText, FiMail, FiCalendar } from 'react-icons/fi';
import { useGetLegalPageQuery } from '@/redux/api/siteContentApi';

const TermsPage = () => {
    const { data: response, isLoading } = useGetLegalPageQuery('terms');
    const page = response?.data;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-[3px] border-gray-100 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-gray-400 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    const lastUpdated = page?.lastUpdated
        ? new Date(page.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    return (
        <div className="bg-white min-h-screen">
            {/* Clean Header */}
            <div className="border-b border-gray-100">
                <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-10 md:py-14">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[var(--color-primary)] transition-colors group mb-6 uppercase tracking-widest"
                    >
                        <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" size={13} />
                        Home
                    </Link>
                    <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FiFileText size={20} className="text-[var(--color-primary)]" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                                {page?.title || 'Terms & Conditions'}
                            </h1>
                            {lastUpdated && (
                                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 font-medium">
                                    <FiCalendar size={12} />
                                    Last updated: {lastUpdated}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-10 md:py-14">
                <div className="max-w-3xl">
                    <div
                        className="legal-content"
                        dangerouslySetInnerHTML={{ __html: page?.content || '<p>Content coming soon.</p>' }}
                    />

                    {/* Contact CTA */}
                    <div className="mt-14 pt-8 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-1">Have questions about these terms?</h3>
                                <p className="text-xs text-gray-400">Our team is happy to help clarify anything.</p>
                            </div>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-bold text-xs tracking-wide hover:scale-105 transition-all active:scale-95"
                            >
                                <FiMail size={13} />
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .legal-content h1 { font-size: 22px; font-weight: 800; color: #111; margin: 32px 0 12px; letter-spacing: -0.3px; }
                .legal-content h2 { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 28px 0 10px; letter-spacing: -0.2px; }
                .legal-content h3 { font-size: 15px; font-weight: 600; color: #333; margin: 20px 0 8px; }
                .legal-content p { font-size: 14px; line-height: 1.85; color: #555; margin-bottom: 14px; }
                .legal-content ul, .legal-content ol { padding-left: 20px; margin-bottom: 14px; }
                .legal-content li { font-size: 14px; line-height: 1.85; color: #555; margin-bottom: 6px; }
                .legal-content blockquote { border-left: 3px solid #0B4222; padding: 10px 16px; background: #f9fafb; margin: 16px 0; border-radius: 0 6px 6px 0; font-style: italic; }
                .legal-content a { color: #0B4222; font-weight: 600; }
                .legal-content strong { color: #222; font-weight: 700; }
                .legal-content hr { border: none; border-top: 1px solid #eee; margin: 24px 0; }
            `}</style>
        </div>
    );
};

export default TermsPage;
