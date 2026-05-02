"use client";

import React from 'react';
import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp, FaFacebookMessenger } from 'react-icons/fa';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';

const FloatingContact: React.FC = () => {
    const { data: res } = useGetSiteContentQuery({});
    const f = res?.data?.floating;

    // Don't render until data is loaded
    if (!f) return null;

    const phoneNumber = f.phone || "+880 1XXX-XXXXXX";
    const whatsappLink = `https://wa.me/${f.whatsapp || '880XXXXXXXXXX'}`;
    const messengerLink = `https://m.me/${f.messenger || 'YOUR_PAGE_USERNAME'}`;

    return (
        <div className="fixed bottom-6 right-4 z-[9999] flex flex-col items-center gap-2">
            {/* Phone */}
            {f.showPhone && (
                <div className="group relative flex items-center">
                    {/* Tooltip — number on hover */}
                    <div className="absolute right-full mr-2 bg-[#0B4222] text-white text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 pointer-events-none transition-all duration-200 shadow-lg">
                        {phoneNumber}
                        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-[#0B4222]" />
                    </div>
                    <a
                        href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 text-[#0B4222]"
                    >
                        <FiPhone size={20} />
                    </a>
                </div>
            )}

            {/* WhatsApp */}
            {f.showWhatsapp && (
                <div className="group relative flex items-center">
                    <div className="absolute right-full mr-2 bg-[#25D366] text-white text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 pointer-events-none transition-all duration-200 shadow-lg">
                        {phoneNumber}
                        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-[#25D366]" />
                    </div>
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 text-[#25D366]"
                    >
                        <FaWhatsapp size={20} />
                    </a>
                </div>
            )}

            {/* Messenger */}
            {f.showMessenger && (
                <div className="group relative flex items-center">
                    <div className="absolute right-full mr-2 bg-[#006AFF] text-white text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 pointer-events-none transition-all duration-200 shadow-lg">
                        Messenger
                        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-[#006AFF]" />
                    </div>
                    <a
                        href={messengerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 text-[#006AFF]"
                    >
                        <FaFacebookMessenger size={20} />
                    </a>
                </div>
            )}
        </div>
    );
};

export default FloatingContact;
