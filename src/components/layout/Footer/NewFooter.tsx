"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux';
import { logout } from '@/redux/slices/authSlice';
import { FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaInstagram } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const NewFooter: React.FC = () => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();

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
                            <li><Link href="/contact" className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">Contact Us</Link></li>
                            <li><Link href="mailto:support@sinotriglobal.com" className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">Email Us</Link></li>
                            <li><Link href="/contact" className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">Live Chat</Link></li>
                            {isAuthenticated ? (
                                <>
                                    <li><Link href={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'} className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">My Account</Link></li>
                                    <li><button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">Logout</button></li>
                                </>
                            ) : (
                                <li><Link href="/login" className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">Sign In / Register</Link></li>
                            )}
                        </ul>
                    </div>

                    {/* Column 2 - Our Expertise */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Our Expertise</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="/services/shipping" className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">Buy and Ship for Me</Link></li>
                            <li><Link href="/services/shipping" className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">Ship for Me</Link></li>
                            <li><Link href="/services/quotation" className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">Request for Quotation (RFQ)</Link></li>
                            <li><Link href="/services/calculator" className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">Cost Calculator</Link></li>
                        </ul>
                    </div>

                    {/* Column 3 - Important Links */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Important Links</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="/" className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">Sinotri Live</Link></li>
                            <li><Link href="/contact" className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">Talk to the Expert</Link></li>
                            <li><Link href="/blogs" className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">Blog</Link></li>
                            <li><Link href="/cart" className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">My Cart</Link></li>
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
                                <img src="/logo.svg" alt="Sinotri Global" className="h-8" />
                            </Link>
                            <div className="space-y-2.5">
                                <div className="flex items-start gap-2.5">
                                    <FiMapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                    <p className="text-sm text-gray-500">Plot 1020, Road 9, Avenue 9, Mirpur DOHS, Dhaka 1216</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <FiMail size={14} className="text-gray-400 shrink-0" />
                                    <a href="mailto:support@sinotriglobal.com" className="text-sm text-gray-500 hover:text-[#0B4222] transition-colors">support@sinotriglobal.com</a>
                                </div>
                            </div>
                            {/* Social Icons */}
                            <div className="flex items-center gap-3 mt-4">
                                {[
                                    { icon: FaFacebookF, url: '#', label: 'Facebook' },
                                    { icon: FaLinkedinIn, url: '#', label: 'LinkedIn' },
                                    { icon: FaYoutube, url: '#', label: 'YouTube' },
                                    { icon: FaInstagram, url: '#', label: 'Instagram' },
                                ].map((s) => (
                                    <a key={s.label} href={s.url} aria-label={s.label} className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-[#0B4222] transition-colors">
                                        <s.icon size={14} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* 24/7 Support */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-4">24/7 Support</h4>
                            <p className="text-sm text-gray-500 mb-3">We're here for you 24/7, around the clock.</p>
                            <div className="flex items-center gap-2.5">
                                <FiPhone size={16} className="text-[#0B4222]" />
                                <a href="tel:+8809666786000" className="text-base font-semibold text-[#0B4222] hover:underline">+8809666786000</a>
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
                            <Link href="/terms" className="text-xs text-gray-400 hover:text-[#0B4222] transition-colors">Terms & Conditions</Link>
                            <span className="text-gray-300">•</span>
                            <Link href="/privacy" className="text-xs text-gray-400 hover:text-[#0B4222] transition-colors">Privacy Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default NewFooter;
