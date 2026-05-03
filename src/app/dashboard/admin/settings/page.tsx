"use client";

import React, { useState, useEffect } from 'react';
import {
    FiSettings, FiGlobe, FiTruck, FiSave, FiRefreshCw,
    FiCheckCircle, FiAlertCircle, FiInfo, FiShield,
} from 'react-icons/fi';
import { useGetSiteContentQuery, useUpdateSiteContentMutation } from '@/redux/api/siteContentApi';
import toast from 'react-hot-toast';

/* ─── Reusable Components ─── */
const SettingSection = ({ icon: Icon, title, description, children }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0B4222]/10 flex items-center justify-center">
                    <Icon size={18} className="text-[#0B4222]" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
            </div>
        </div>
        <div className="p-6 space-y-5">
            {children}
        </div>
    </div>
);

const InputField = ({ label, type = 'text', value, onChange, placeholder, helper, ...props }: any) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label>
        {type === 'textarea' ? (
            <textarea
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0B4222] focus:border-transparent outline-none font-medium text-sm h-20 resize-none"
                value={value} onChange={onChange} placeholder={placeholder} {...props}
            />
        ) : (
            <input
                type={type}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0B4222] focus:border-transparent outline-none font-medium text-sm"
                value={value} onChange={onChange} placeholder={placeholder} {...props}
            />
        )}
        {helper && <p className="text-[10px] text-gray-400 mt-1 italic">{helper}</p>}
    </div>
);

export default function SettingsPage() {
    const { data: res, isLoading } = useGetSiteContentQuery({});
    const [updateContent, { isLoading: isSaving }] = useUpdateSiteContentMutation();

    const [formData, setFormData] = useState<any>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (res?.data) {
            setFormData({
                general: res.data.general || {
                    storeName: 'Sinotri Global',
                    tagline: 'Premium International E-Commerce',
                    currency: 'BDT',
                },
                shipping: res.data.shipping || {
                    defaultCost: 60,
                    freeShippingMin: 2000,
                    estimatedDelivery: '3-7',
                },
                seo: res.data.seo || {
                    title: '',
                    description: '',
                    googleAnalyticsId: '',
                    facebookPixel: '',
                },
            });
        }
    }, [res]);

    const updateGeneral = (field: string, value: any) => {
        setFormData((p: any) => ({ ...p, general: { ...p.general, [field]: value } }));
    };
    const updateShipping = (field: string, value: any) => {
        setFormData((p: any) => ({ ...p, shipping: { ...p.shipping, [field]: value } }));
    };
    const updateSeo = (field: string, value: any) => {
        setFormData((p: any) => ({ ...p, seo: { ...p.seo, [field]: value } }));
    };

    const handleSave = async () => {
        try {
            await updateContent(formData).unwrap();
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        }
    };

    if (isLoading || !formData) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-[#0B4222] rounded-full animate-spin" />
            </div>
        );
    }

    const g = formData.general || {};
    const sh = formData.shipping || {};
    const seo = formData.seo || {};

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your store preferences and configuration</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#0B4222] text-white rounded-lg text-sm font-bold hover:bg-[#093519] transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <FiRefreshCw size={16} className="animate-spin" /> : saveSuccess ? <FiCheckCircle size={16} /> : <FiSave size={16} />}
                    {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                <FiInfo size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-blue-800">Configuration Center</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                        Changes are saved to the database and apply globally. Contact details are managed in <a href="/dashboard/admin/site-content" className="font-bold underline">Site Content</a>.
                    </p>
                </div>
            </div>

            {/* All Settings */}
            <div className="space-y-6">

                {/* ── General ── */}
                <SettingSection icon={FiSettings} title="Store Information" description="Basic store identity">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Store Name" value={g.storeName || ''} onChange={(e: any) => updateGeneral('storeName', e.target.value)} placeholder="Your Store Name" />
                        <InputField label="Tagline" value={g.tagline || ''} onChange={(e: any) => updateGeneral('tagline', e.target.value)} placeholder="Your Store Tagline" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Currency</label>
                            <select value={g.currency || 'BDT'} onChange={(e) => updateGeneral('currency', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0B4222] outline-none font-medium text-sm"
                            >
                                <option value="BDT">৳ BDT - Bangladeshi Taka</option>
                                <option value="USD">$ USD - US Dollar</option>
                                <option value="EUR">€ EUR - Euro</option>
                                <option value="CNY">¥ CNY - Chinese Yuan</option>
                            </select>
                        </div>
                    </div>
                </SettingSection>




                {/* ── SEO & Marketing ── */}
                <SettingSection icon={FiGlobe} title="SEO & Marketing" description="Search engine and tracking settings">
                    <InputField label="Meta Title" value={seo.title || ''} onChange={(e: any) => updateSeo('title', e.target.value)} placeholder="Sinotri Global - Premium E-Commerce" helper="Recommended: 50-60 characters" />
                    <InputField label="Meta Description" type="textarea" value={seo.description || ''} onChange={(e: any) => updateSeo('description', e.target.value)} placeholder="Brief description of your store" helper="Recommended: 150-160 characters" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Google Analytics ID" value={seo.googleAnalyticsId || ''} onChange={(e: any) => updateSeo('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" helper="Your GA4 measurement ID" />
                        <InputField label="Facebook Pixel ID" value={seo.facebookPixel || ''} onChange={(e: any) => updateSeo('facebookPixel', e.target.value)} placeholder="123456789" helper="For Facebook Ads tracking" />
                    </div>
                </SettingSection>

                {/* ── System Info (read-only) ── */}
                <SettingSection icon={FiShield} title="System Information" description="Current system status">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'App Version', value: 'v1.0.0' },
                            { label: 'Framework', value: 'Next.js 16' },
                            { label: 'API Status', value: 'Connected', ok: true },
                            { label: 'Database', value: 'MongoDB Atlas', ok: true },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                                <span className={`text-xs font-bold flex items-center gap-1 ${(item as any).ok ? 'text-green-600' : 'text-gray-700'}`}>
                                    {(item as any).ok && <FiCheckCircle size={11} />}
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </SettingSection>

            </div>
        </div>
    );
}
