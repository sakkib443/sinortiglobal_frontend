"use client";

import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';

const FloatingContact: React.FC = () => {
    const { data: res } = useGetSiteContentQuery({});
    const f = res?.data?.floating;

    // If floating widget data not loaded yet or WhatsApp is hidden, use fallback
    const whatsappNumber = f?.whatsapp || '8801XXXXXXXXX';
    const showWhatsapp = f?.showWhatsapp !== false; // default true

    if (!showWhatsapp) return null;

    const whatsappLink = `https://wa.me/${whatsappNumber}`;

    return (
        <div className="fixed bottom-6 right-4 z-[9999] flex flex-col items-center gap-2">
            {/* WhatsApp Button */}
            <div className="group relative flex items-center">
                {/* Tooltip on hover */}
                <div className="absolute right-full mr-2 bg-[#25D366] text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 pointer-events-none transition-all duration-200 shadow-lg">
                    Chat with us
                    <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-[#25D366]" />
                </div>
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 text-white shadow-lg"
                    style={{
                        background: 'linear-gradient(135deg, #25D366, #128C7E)',
                        boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
                    }}
                >
                    <FaWhatsapp size={24} />
                </a>
            </div>
        </div>
    );
};

export default FloatingContact;
