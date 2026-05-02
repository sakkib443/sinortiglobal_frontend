"use client";

import React, { useState } from 'react';
import {
    FiSettings, FiGlobe, FiMail, FiDollarSign, FiTruck,
    FiImage, FiBell, FiShield, FiSave, FiRefreshCw,
    FiCheckCircle, FiAlertCircle, FiInfo,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

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
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                {...props}
            />
        ) : (
            <input
                type={type}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0B4222] focus:border-transparent outline-none font-medium text-sm"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                {...props}
            />
        )}
        {helper && <p className="text-[10px] text-gray-400 mt-1 italic">{helper}</p>}
    </div>
);

const ToggleSwitch = ({ label, description, checked, onChange }: any) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <p className="text-sm font-semibold text-gray-700">{label}</p>
            {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#0B4222]' : 'bg-gray-300'}`}
        >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`} />
        </button>
    </div>
);

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [saving, setSaving] = useState(false);

    // General Settings
    const [storeName, setStoreName] = useState('Sinotri Global');
    const [tagline, setTagline] = useState('Premium International E-Commerce');
    const [storeEmail, setStoreEmail] = useState('support@sinotriglobal.com');
    const [storePhone, setStorePhone] = useState('+880 1700-000000');
    const [storeAddress, setStoreAddress] = useState('Dhaka, Bangladesh');
    const [currency, setCurrency] = useState('BDT');
    const [language, setLanguage] = useState('en');

    // Notifications
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [orderNotifications, setOrderNotifications] = useState(true);
    const [reviewNotifications, setReviewNotifications] = useState(true);
    const [lowStockAlert, setLowStockAlert] = useState(true);
    const [lowStockThreshold, setLowStockThreshold] = useState('5');

    // Shipping Defaults
    const [defaultShippingCost, setDefaultShippingCost] = useState('60');
    const [freeShippingMin, setFreeShippingMin] = useState('2000');
    const [estimatedDelivery, setEstimatedDelivery] = useState('3-7');

    // SEO
    const [metaTitle, setMetaTitle] = useState('Sinotri Global - Premium E-Commerce');
    const [metaDescription, setMetaDescription] = useState('Shop premium international products at the best prices in Bangladesh.');
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
    const [facebookPixel, setFacebookPixel] = useState('');

    // Social
    const [facebook, setFacebook] = useState('');
    const [instagram, setInstagram] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [youtube, setYoutube] = useState('');

    // Maintenance
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [guestCheckout, setGuestCheckout] = useState(true);
    const [autoConfirmOrders, setAutoConfirmOrders] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: FiSettings },
        { id: 'notifications', label: 'Notifications', icon: FiBell },
        { id: 'shipping', label: 'Shipping', icon: FiTruck },
        { id: 'seo', label: 'SEO & Marketing', icon: FiGlobe },
        { id: 'security', label: 'Security', icon: FiShield },
    ];

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
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#0B4222] text-white rounded-lg text-sm font-bold hover:bg-[#093519] transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? <FiRefreshCw size={16} className="animate-spin" /> : <FiSave size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                <FiInfo size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-blue-800">Configuration Center</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                        Changes made here apply globally across your store. Some changes may require a page refresh to take effect.
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                            activeTab === tab.id
                                ? 'bg-white text-[#0B4222] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <tab.icon size={15} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'general' && (
                    <>
                        <SettingSection icon={FiSettings} title="Store Information" description="Basic store details visible to customers">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField label="Store Name" value={storeName} onChange={(e: any) => setStoreName(e.target.value)} placeholder="Your Store Name" />
                                <InputField label="Tagline" value={tagline} onChange={(e: any) => setTagline(e.target.value)} placeholder="Your Store Tagline" />
                                <InputField label="Contact Email" type="email" value={storeEmail} onChange={(e: any) => setStoreEmail(e.target.value)} placeholder="support@example.com" />
                                <InputField label="Contact Phone" value={storePhone} onChange={(e: any) => setStorePhone(e.target.value)} placeholder="+880 1700-000000" />
                            </div>
                            <InputField label="Store Address" type="textarea" value={storeAddress} onChange={(e: any) => setStoreAddress(e.target.value)} placeholder="Full address" />
                        </SettingSection>

                        <SettingSection icon={FiGlobe} title="Localization" description="Currency, language and regional settings">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Currency</label>
                                    <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0B4222] outline-none font-medium text-sm"
                                    >
                                        <option value="BDT">BDT - Bangladeshi Taka</option>
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - British Pound</option>
                                        <option value="CNY">CNY - Chinese Yuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Language</label>
                                    <select value={language} onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0B4222] outline-none font-medium text-sm"
                                    >
                                        <option value="en">English</option>
                                        <option value="bn">Bangla</option>
                                    </select>
                                </div>
                            </div>
                        </SettingSection>

                        <SettingSection icon={FiImage} title="Social Media Links" description="Connect your social media accounts">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField label="Facebook" value={facebook} onChange={(e: any) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." />
                                <InputField label="Instagram" value={instagram} onChange={(e: any) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
                                <InputField label="WhatsApp" value={whatsapp} onChange={(e: any) => setWhatsapp(e.target.value)} placeholder="+880 1700-000000" />
                                <InputField label="YouTube" value={youtube} onChange={(e: any) => setYoutube(e.target.value)} placeholder="https://youtube.com/..." />
                            </div>
                        </SettingSection>
                    </>
                )}

                {activeTab === 'notifications' && (
                    <SettingSection icon={FiBell} title="Notification Preferences" description="Control how and when you receive alerts">
                        <ToggleSwitch label="Email Notifications" description="Receive store updates via email" checked={emailNotifications} onChange={setEmailNotifications} />
                        <div className="border-t border-gray-100" />
                        <ToggleSwitch label="New Order Alerts" description="Get notified when a new order is placed" checked={orderNotifications} onChange={setOrderNotifications} />
                        <div className="border-t border-gray-100" />
                        <ToggleSwitch label="Review Notifications" description="Get notified about new product reviews" checked={reviewNotifications} onChange={setReviewNotifications} />
                        <div className="border-t border-gray-100" />
                        <ToggleSwitch label="Low Stock Alerts" description="Get warned when product stock is running low" checked={lowStockAlert} onChange={setLowStockAlert} />
                        {lowStockAlert && (
                            <div className="ml-6 mt-2">
                                <InputField label="Low Stock Threshold" type="number" value={lowStockThreshold} onChange={(e: any) => setLowStockThreshold(e.target.value)} helper="Alert when stock drops below this number" />
                            </div>
                        )}
                    </SettingSection>
                )}

                {activeTab === 'shipping' && (
                    <SettingSection icon={FiTruck} title="Shipping Defaults" description="Default shipping configuration for new orders">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Default Shipping Cost" type="number" value={defaultShippingCost} onChange={(e: any) => setDefaultShippingCost(e.target.value)} helper="Applied when no shipping zone matches" />
                            <InputField label="Free Shipping Minimum" type="number" value={freeShippingMin} onChange={(e: any) => setFreeShippingMin(e.target.value)} helper="Orders above this amount get free shipping" />
                        </div>
                        <InputField label="Estimated Delivery (days)" value={estimatedDelivery} onChange={(e: any) => setEstimatedDelivery(e.target.value)} placeholder="3-7" helper="Displayed to customers during checkout" />
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mt-2">
                            <p className="text-xs text-amber-700 flex items-center gap-2">
                                <FiAlertCircle size={14} className="flex-shrink-0" />
                                For advanced shipping rules, use the <a href="/dashboard/admin/shipping" className="font-bold underline">Shipping Management</a> page
                            </p>
                        </div>
                    </SettingSection>
                )}

                {activeTab === 'seo' && (
                    <>
                        <SettingSection icon={FiGlobe} title="SEO Configuration" description="Search engine optimization settings">
                            <InputField label="Meta Title" value={metaTitle} onChange={(e: any) => setMetaTitle(e.target.value)} placeholder="Your Store Name - Description" helper="Recommended: 50-60 characters" />
                            <InputField label="Meta Description" type="textarea" value={metaDescription} onChange={(e: any) => setMetaDescription(e.target.value)} placeholder="Brief description of your store" helper="Recommended: 150-160 characters" />
                        </SettingSection>
                        <SettingSection icon={FiDollarSign} title="Marketing & Tracking" description="Integration with analytics and marketing platforms">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField label="Google Analytics ID" value={googleAnalyticsId} onChange={(e: any) => setGoogleAnalyticsId(e.target.value)} placeholder="G-XXXXXXXXXX" helper="Your GA4 measurement ID" />
                                <InputField label="Facebook Pixel ID" value={facebookPixel} onChange={(e: any) => setFacebookPixel(e.target.value)} placeholder="123456789" helper="For Facebook Ads tracking" />
                            </div>
                        </SettingSection>
                    </>
                )}

                {activeTab === 'security' && (
                    <>
                        <SettingSection icon={FiShield} title="Store Access" description="Control access and operational modes">
                            <ToggleSwitch label="Maintenance Mode" description="Temporarily disable the storefront for visitors" checked={maintenanceMode} onChange={setMaintenanceMode} />
                            {maintenanceMode && (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-3 ml-6">
                                    <p className="text-xs text-red-700 flex items-center gap-2">
                                        <FiAlertCircle size={14} />
                                        <strong>Warning:</strong> Your store is currently offline for visitors!
                                    </p>
                                </div>
                            )}
                            <div className="border-t border-gray-100" />
                            <ToggleSwitch label="Guest Checkout" description="Allow customers to checkout without creating an account" checked={guestCheckout} onChange={setGuestCheckout} />
                            <div className="border-t border-gray-100" />
                            <ToggleSwitch label="Auto-Confirm Orders" description="Automatically confirm new orders (skip pending status)" checked={autoConfirmOrders} onChange={setAutoConfirmOrders} />
                        </SettingSection>
                        <SettingSection icon={FiShield} title="System Information" description="Current system status and version">
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
                    </>
                )}
            </div>
        </div>
    );
}
