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

    // Support phone — dynamic from admin / site-content (same source as header)
    const contactPhone: string = siteRes?.data?.contact?.phone || '+8809666786000';

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        toast.success('Logged out successfully');
        router.push('/');
    };

    return (
        <footer className="bg-white border-t border-gray-200">
            {/* ── Main Footer (single section) ── */}
            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Brand + Address + Social */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="inline-flex items-center mb-4">
                            <img src={logoUrl} alt="Sinotri Global" className="h-9" />
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

                    {/* Menu 1 - Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Quick Links</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="/" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Home</Link></li>
                            <li><Link href="/products" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">All Products</Link></li>
                            <li><Link href="/services" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Our Services</Link></li>
                            <li><Link href="/contact" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Menu 2 - Support */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Support</h4>
                        <ul className="space-y-2.5">
                            <li>
                                <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline">
                                    <FiPhone size={14} /> {contactPhone}
                                </a>
                            </li>
                            <li><a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Live Chat (WhatsApp)</a></li>
                            {isAuthenticated ? (
                                <li><Link href={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'} className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">My Account</Link></li>
                            ) : (
                                <li><Link href="/login" className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors">Sign In / Register</Link></li>
                            )}
                        </ul>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">We Accept</h4>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="bg-white border border-gray-200 rounded-md px-2 py-2 flex items-center justify-center h-9">
                                <span className="text-xs font-bold tracking-tight" style={{ color: '#1A1F71' }}>VISA</span>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-md px-2 py-2 flex items-center justify-center h-9">
                                <div className="flex items-center gap-0.5">
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-80" />
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-80 -ml-2" />
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-md px-2 py-2 flex items-center justify-center h-9">
                                <span className="text-[10px] font-bold" style={{ color: '#D12053' }}>bKash</span>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-md px-2 py-2 flex items-center justify-center h-9">
                                <span className="text-[10px] font-bold" style={{ color: '#F6921E' }}>Nagad</span>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-md px-2 py-2 flex items-center justify-center h-9">
                                <span className="text-[10px] font-bold" style={{ color: '#8B2F8B' }}>Rocket</span>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-md px-2 py-2 flex items-center justify-center h-9">
                                <span className="text-[9px] font-bold" style={{ color: '#00529B' }}>DBBL</span>
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
