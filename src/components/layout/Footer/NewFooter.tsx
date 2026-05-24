"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux';
import { logout } from '@/redux/slices/authSlice';
import { FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/components/shared/ThemeProvider';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';
import type { IconType } from 'react-icons';

/* ─── Map a social label to its icon (case-insensitive) ─── */
const SOCIAL_ICONS: { match: string; icon: IconType }[] = [
    { match: 'facebook', icon: FaFacebookF },
    { match: 'instagram', icon: FaInstagram },
    { match: 'youtube', icon: FaYoutube },
    { match: 'linkedin', icon: FaLinkedinIn },
    { match: 'twitter', icon: FaXTwitter },
    { match: 'tiktok', icon: FaTiktok },
    { match: 'whatsapp', icon: FaWhatsapp },
];

const getSocialIcon = (label: string): IconType => {
    const found = SOCIAL_ICONS.find((s) => label.toLowerCase().includes(s.match));
    return found?.icon || FaFacebookF;
};

const NewFooter: React.FC = () => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { logoUrl } = useTheme();
    const { data: siteRes } = useGetSiteContentQuery({});

    // Social links from DB (admin → site-content). Only show ones with a real URL.
    const socials: { label: string; url: string }[] = (siteRes?.data?.contact?.socials || [])
        .filter((s: any) => s?.url && s.url !== '#');

    // WhatsApp link for "Live Chat" — normalized to wa.me format (88 + local digits)
    const waDigits = (siteRes?.data?.contact?.whatsapp || siteRes?.data?.floating?.whatsapp || '8801961864327').replace(/\D/g, '');
    const waNumber = waDigits.startsWith('880') ? waDigits : waDigits.startsWith('0') ? '88' + waDigits : '880' + waDigits;
    const whatsappLink = `https://wa.me/${waNumber}`;

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        toast.success('Logged out successfully');
        router.push('/');
    };

    return (
        <footer className="bg-white border-t border-gray-200">
            {/* ── Top Footer ── */}
            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Column 1 - Customer Services */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Customer Services</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="/contact" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Contact Us</Link></li>
                            <li><Link href="mailto:support@sinotriglobal.com" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Email Us</Link></li>
                            <li><a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Live Chat (WhatsApp)</a></li>
                            {isAuthenticated ? (
                                <>
                                    <li><Link href={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'} className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">My Account</Link></li>
                                    <li><button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">Logout</button></li>
                                </>
                            ) : (
                                <li><Link href="/login" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Sign In / Register</Link></li>
                            )}
                        </ul>
                    </div>

                    {/* Column 2 - Our Expertise */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Our Expertise</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="/services#sourcing" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Product Sourcing</Link></li>
                            <li><Link href="/services#shipping" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Shipping & Logistics</Link></li>
                            <li><Link href="/services#freight" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Freight Forwarding</Link></li>
                            <li><Link href="/services#customs" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Customs Clearance</Link></li>
                            <li><Link href="/contact" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Request a Quote (RFQ)</Link></li>
                        </ul>
                    </div>

                    {/* Column 3 - Important Links */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Important Links</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="/" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Home</Link></li>
                            <li><Link href="/products" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">All Products</Link></li>
                            <li><Link href="/services" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Our Services</Link></li>
                            <li><Link href="/contact" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Talk to the Expert</Link></li>
                            <li><Link href="/cart" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">My Cart</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* ── Middle Footer ── */}
            <div className="border-t border-gray-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Logo + Address */}
                        <div>
                            <Link href="/" className="flex items-center gap-2 mb-4">
                                <img src={logoUrl} alt="Sinotri Global" className="h-8" />
                            </Link>
                            <div className="space-y-2.5">
                                <div className="flex items-start gap-2.5">
                                    <FiMapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                    <p className="text-sm text-gray-500">Plot 1020, Road 9, Avenue 9, Mirpur DOHS, Dhaka 1216</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <FiMail size={14} className="text-gray-400 shrink-0" />
                                    <a href="mailto:support@sinotriglobal.com" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">support@sinotriglobal.com</a>
                                </div>
                            </div>
                            {/* Social Icons — dynamic from admin / site-content */}
                            {socials.length > 0 && (
                                <div className="flex items-center gap-3 mt-4">
                                    {socials.map((s) => {
                                        const Icon = getSocialIcon(s.label);
                                        return (
                                            <a
                                                key={s.label}
                                                href={s.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={s.label}
                                                className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-[var(--color-primary)] transition-colors"
                                            >
                                                <Icon size={14} />
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 24/7 Support */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-4">24/7 Support</h4>
                            <p className="text-sm text-gray-500 mb-3">We're here for you 24/7, around the clock.</p>
                            <div className="flex items-center gap-2.5">
                                <FiPhone size={16} className="text-[var(--color-primary)]" />
                                <a href="tel:+8809666786000" className="text-base font-semibold text-[var(--color-primary)] hover:underline">+8809666786000</a>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-4">Payment Method We Accept</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center justify-center h-10">
                                    <span className="text-sm font-bold tracking-tight" style={{ color: '#1A1F71' }}>VISA</span>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center justify-center h-10">
                                    <div className="flex items-center gap-0.5">
                                        <div className="w-4 h-4 rounded-full bg-[#EB001B] opacity-80" />
                                        <div className="w-4 h-4 rounded-full bg-[#F79E1B] opacity-80 -ml-2" />
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center justify-center h-10">
                                    <span className="text-[10px] font-bold text-[#006FCF]">AMEX</span>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center justify-center h-10">
                                    <span className="text-[11px] font-bold" style={{ color: '#D12053' }}>bKash</span>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center justify-center h-10">
                                    <span className="text-[11px] font-bold" style={{ color: '#F6921E' }}>Nagad</span>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center justify-center h-10">
                                    <span className="text-[11px] font-bold" style={{ color: '#8B2F8B' }}>Rocket</span>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center justify-center h-10">
                                    <span className="text-[10px] font-bold" style={{ color: '#00529B' }}>DBBL</span>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center justify-center h-10">
                                    <span className="text-[9px] font-bold" style={{ color: '#003087' }}>City Bank</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom Footer ── */}
            <div className="border-t border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                        <p className="text-xs text-gray-400">
                            © 2019-{new Date().getFullYear()} Sinotri Global Technologies Ltd. All Rights Reserved.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/terms" className="text-xs text-gray-400 hover:text-[var(--color-primary)] transition-colors">Terms & Conditions</Link>
                            <span className="text-gray-300">•</span>
                            <Link href="/privacy" className="text-xs text-gray-400 hover:text-[var(--color-primary)] transition-colors">Privacy Policy</Link>
                            <span className="text-gray-300">•</span>
                            <Link href="/refund" className="text-xs text-gray-400 hover:text-[var(--color-primary)] transition-colors">Refund Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default NewFooter;
