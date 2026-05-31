"use client";

import React from 'react';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';
import { BsWhatsapp } from 'react-icons/bs';

const FloatingContact: React.FC = () => {
    const { data: res } = useGetSiteContentQuery({});
    const floating = res?.data?.floating;
    const phoneRaw = floating?.whatsappNumber || floating?.phone || '8801961864327';

    // Build wa.me link — digits only
    const waNumber = String(phoneRaw).replace(/\D/g, '');
    const waMessage = encodeURIComponent(floating?.message || 'Hello! I have a question about your products.');

    if (floating?.enabled === false) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 w-14 h-14">
            <style>{`
                @keyframes fcRipple {
                    0%   { transform: scale(1);   opacity: 0.55; }
                    100% { transform: scale(2.4); opacity: 0; }
                }
                @keyframes fcBeat {
                    0%, 100%   { transform: scale(1); }
                    10%, 30%   { transform: scale(1.12); }
                    20%        { transform: scale(1.04); }
                    40%        { transform: scale(1); }
                }
                .fc-ring  { animation: fcRipple 2s ease-out infinite; }
                .fc-ring2 { animation: fcRipple 2s ease-out 1s infinite; }
                .fc-btn   { animation: fcBeat 2.2s ease-in-out infinite; }
                .fc-btn:hover { animation-play-state: paused; transform: scale(1.1); }
                @media (prefers-reduced-motion: reduce) {
                    .fc-ring, .fc-ring2, .fc-btn { animation: none; }
                }
            `}</style>

            {/* Pulsing ripple rings (radar effect) */}
            <span className="fc-ring absolute inset-0 rounded-full bg-[#25D366] pointer-events-none" />
            <span className="fc-ring2 absolute inset-0 rounded-full bg-[#25D366] pointer-events-none" />

            {/* Button */}
            <a
                href={`https://wa.me/${waNumber}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="fc-btn relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg transition-transform"
                style={{ boxShadow: '0 6px 20px rgba(37,211,102,0.5)' }}
                aria-label="Chat on WhatsApp"
            >
                <BsWhatsapp className="text-white" size={28} />
            </a>
        </div>
    );
};

export default FloatingContact;
