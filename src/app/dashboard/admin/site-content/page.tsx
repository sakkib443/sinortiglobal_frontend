"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useGetSiteContentQuery, useUpdateSiteContentMutation, useGetAllLegalPagesQuery, useUpdateLegalPageMutation } from '@/redux/api/siteContentApi';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import {
    FiPhone, FiMessageCircle, FiLayout, FiFileText, FiImage,
    FiSave, FiPlus, FiTrash2, FiCheckCircle, FiArrowUp, FiArrowDown, FiCreditCard,
    FiVideo, FiYoutube, FiUploadCloud,
} from 'react-icons/fi';
import { SingleImageUploader, SingleVideoUploader } from '@/components/ui/ImageUploader';
import { isValidYouTube, getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/utils/youtube';
import HeroCarousel from '@/components/home/HeroCarousel';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false, loading: () => <div style={{ height: '350px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} /> });
import 'react-quill-new/dist/quill.snow.css';

/* ─── Styles ─── */
const card: React.CSSProperties = { background: '#fff', border: '1px solid #eee', borderRadius: '10px', padding: '20px', marginBottom: '16px' };
const label: React.CSSProperties = { fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '5px' };
const input: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const };
const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--color-primary)', color: '#fff' };
const btnDanger: React.CSSProperties = { ...btn, background: '#fef2f2', color: '#dc2626', padding: '6px 10px' };
const btnSmall: React.CSSProperties = { ...btn, background: '#f3f4f6', color: '#333', padding: '6px 12px', fontSize: '12px' };

/* ─── Tabs Config ─── */
const TABS = [
    { key: 'hero', label: '🖼️ Hero Slides', icon: FiImage },
    { key: 'contact', label: 'Contact Page', icon: FiPhone },
    { key: 'payment', label: 'Payment Numbers', icon: FiCreditCard },
    { key: 'floating', label: 'Floating Widget', icon: FiMessageCircle },
    { key: 'footer', label: 'Footer', icon: FiLayout },
    { key: 'legal', label: 'Legal Pages', icon: FiFileText },
];

export default function SiteContentPage() {
    const { data: res, isLoading } = useGetSiteContentQuery({});
    const [updateContent, { isLoading: isSaving }] = useUpdateSiteContentMutation();
    const [activeTab, setActiveTab] = useState('contact');
    const [formData, setFormData] = useState<any>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (res?.data) {
            setFormData(JSON.parse(JSON.stringify(res.data)));
        }
    }, [res]);

    const handleSave = async () => {
        if (activeTab === 'legal') return; // Legal pages have their own save
        try {
            const payload: any = {};
            if (activeTab === 'hero') {
                payload.heroSlides = formData.heroSlides;
            } else {
                payload[activeTab] = formData[activeTab];
            }
            await updateContent(payload).unwrap();
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
            toast.success('Saved successfully!');
        } catch {
            toast.error('Failed to save');
        }
    };

    if (isLoading || !formData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#111', margin: 0 }}>Site Content</h1>
                    <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0' }}>Manage dynamic content across your website</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} style={{ ...btnPrimary, opacity: isSaving ? 0.6 : 1 }}>
                    {saveSuccess ? <><FiCheckCircle size={14} /> Saved!</> : <><FiSave size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}</>}
                </button>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap', borderBottom: '1px solid #eee', paddingBottom: '1px' }}>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', border: 'none', cursor: 'pointer',
                            fontSize: '12.5px', fontWeight: activeTab === tab.key ? 700 : 500,
                            color: activeTab === tab.key ? 'var(--color-primary)' : '#888',
                            background: activeTab === tab.key ? 'var(--color-primary-lightest)' : 'transparent',
                            borderRadius: '6px 6px 0 0',
                            borderBottom: activeTab === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
                            transition: 'all 0.15s',
                        }}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'hero' && <HeroSlidesTab data={formData} setData={setFormData} onSave={handleSave} isSaving={isSaving} />}
            {activeTab === 'contact' && <ContactTab data={formData} setData={setFormData} />}
            {activeTab === 'payment' && <PaymentTab data={formData} setData={setFormData} />}
            {activeTab === 'floating' && <FloatingTab data={formData} setData={setFormData} />}
            {activeTab === 'footer' && <FooterTab data={formData} setData={setFormData} />}
            {activeTab === 'legal' && <LegalPagesTab />}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── CONTACT TAB ─── */
function ContactTab({ data, setData }: { data: any; setData: any }) {
    const c = data.contact || {};

    const updateField = (field: string, value: any) => {
        setData((p: any) => ({ ...p, contact: { ...p.contact, [field]: value } }));
    };

    const addHour = () => {
        setData((p: any) => ({ ...p, contact: { ...p.contact, hours: [...(p.contact.hours || []), { day: '', time: '' }] } }));
    };
    const removeHour = (idx: number) => {
        setData((p: any) => ({ ...p, contact: { ...p.contact, hours: p.contact.hours.filter((_: any, i: number) => i !== idx) } }));
    };
    const updateHour = (idx: number, field: string, value: string) => {
        setData((p: any) => {
            const h = [...p.contact.hours]; h[idx] = { ...h[idx], [field]: value };
            return { ...p, contact: { ...p.contact, hours: h } };
        });
    };

    const addTip = () => updateField('tips', [...(c.tips || []), '']);
    const removeTip = (idx: number) => updateField('tips', c.tips.filter((_: any, i: number) => i !== idx));
    const updateTip = (idx: number, value: string) => {
        const tips = [...c.tips]; tips[idx] = value;
        updateField('tips', tips);
    };

    const addSubject = () => updateField('subjects', [...(c.subjects || []), '']);
    const removeSubject = (idx: number) => updateField('subjects', c.subjects.filter((_: any, i: number) => i !== idx));
    const updateSubject = (idx: number, value: string) => {
        const subs = [...c.subjects]; subs[idx] = value;
        updateField('subjects', subs);
    };

    const addSocial = () => updateField('socials', [...(c.socials || []), { label: '', url: '', color: '#000000' }]);
    const removeSocial = (idx: number) => updateField('socials', c.socials.filter((_: any, i: number) => i !== idx));
    const updateSocial = (idx: number, field: string, value: string) => {
        const s = [...c.socials]; s[idx] = { ...s[idx], [field]: value };
        updateField('socials', s);
    };

    return (
        <div>
            {/* Status Badge */}
            <div style={{ ...card, background: 'var(--color-primary-lightest)', borderColor: '#bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCheckCircle size={16} color="#16a34a" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>Active — This data is used on the <strong>Contact Us</strong> page</span>
                </div>
            </div>

            {/* Basic Info */}
            <div style={card}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 14px' }}>Contact Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div><label style={label}>Phone Number</label><input value={c.phone || ''} onChange={e => updateField('phone', e.target.value)} style={input} /></div>
                    <div><label style={label}>WhatsApp Number</label><input value={c.whatsapp || ''} onChange={e => updateField('whatsapp', e.target.value)} style={input} /></div>
                    <div><label style={label}>Email</label><input value={c.email || ''} onChange={e => updateField('email', e.target.value)} style={input} /></div>
                    <div><label style={label}>Address</label><input value={c.address || ''} onChange={e => updateField('address', e.target.value)} style={input} /></div>
                </div>
            </div>

            {/* Business Hours */}
            <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Business Hours</h3>
                    <button onClick={addHour} style={btnSmall}><FiPlus size={13} /> Add</button>
                </div>
                {(c.hours || []).map((h: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                        <input value={h.day} onChange={e => updateHour(idx, 'day', e.target.value)} placeholder="Day (e.g. Sunday – Thursday)" style={{ ...input, flex: 1 }} />
                        <input value={h.time} onChange={e => updateHour(idx, 'time', e.target.value)} placeholder="Time (e.g. 9 AM – 6 PM)" style={{ ...input, flex: 1 }} />
                        <button onClick={() => removeHour(idx)} style={btnDanger}><FiTrash2 size={13} /></button>
                    </div>
                ))}
                {(c.hours || []).length === 0 && <p style={{ fontSize: '12px', color: '#bbb', textAlign: 'center', padding: '12px' }}>No hours added yet.</p>}
            </div>

            {/* Subjects */}
            <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Form Subjects</h3>
                    <button onClick={addSubject} style={btnSmall}><FiPlus size={13} /> Add</button>
                </div>
                {(c.subjects || []).map((s: string, idx: number) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                        <input value={s} onChange={e => updateSubject(idx, e.target.value)} placeholder="Subject option..." style={{ ...input, flex: 1 }} />
                        <button onClick={() => removeSubject(idx)} style={btnDanger}><FiTrash2 size={13} /></button>
                    </div>
                ))}
                {(c.subjects || []).length === 0 && <p style={{ fontSize: '12px', color: '#bbb', textAlign: 'center', padding: '12px' }}>No subjects added yet.</p>}
            </div>

            {/* Tips */}
            <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Quick Tips</h3>
                    <button onClick={addTip} style={btnSmall}><FiPlus size={13} /> Add</button>
                </div>
                {(c.tips || []).map((t: string, idx: number) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                        <input value={t} onChange={e => updateTip(idx, e.target.value)} placeholder="Tip text..." style={{ ...input, flex: 1 }} />
                        <button onClick={() => removeTip(idx)} style={btnDanger}><FiTrash2 size={13} /></button>
                    </div>
                ))}
                {(c.tips || []).length === 0 && <p style={{ fontSize: '12px', color: '#bbb', textAlign: 'center', padding: '12px' }}>No tips added yet.</p>}
            </div>

            {/* Social Links */}
            <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Social Links</h3>
                    <button onClick={addSocial} style={btnSmall}><FiPlus size={13} /> Add</button>
                </div>
                {(c.socials || []).map((s: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                        <input value={s.label} onChange={e => updateSocial(idx, 'label', e.target.value)} placeholder="Label" style={{ ...input, width: '120px' }} />
                        <input value={s.url} onChange={e => updateSocial(idx, 'url', e.target.value)} placeholder="URL" style={{ ...input, flex: 1 }} />
                        <input type="color" value={s.color} onChange={e => updateSocial(idx, 'color', e.target.value)} style={{ width: '36px', height: '32px', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
                        <button onClick={() => removeSocial(idx)} style={btnDanger}><FiTrash2 size={13} /></button>
                    </div>
                ))}
                {(c.socials || []).length === 0 && <p style={{ fontSize: '12px', color: '#bbb', textAlign: 'center', padding: '12px' }}>No socials added yet.</p>}
            </div>
        </div>
    );
}

/* ─── FLOATING TAB ─── */
function FloatingTab({ data, setData }: { data: any; setData: any }) {
    const f = data.floating || {};
    const update = (field: string, value: any) => setData((p: any) => ({ ...p, floating: { ...p.floating, [field]: value } }));

    return (
        <div style={card}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px' }}>Floating Contact Widget</h3>
            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 16px' }}>Manage the floating WhatsApp/Messenger/Phone button that appears on every page.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                    <label style={label}>Phone Number</label>
                    <input value={f.phone || ''} onChange={e => update('phone', e.target.value)} style={input} />
                </div>
                <div>
                    <label style={label}>Show Phone</label>
                    <select value={f.showPhone ? 'true' : 'false'} onChange={e => update('showPhone', e.target.value === 'true')} style={input}>
                        <option value="true">Yes</option><option value="false">No</option>
                    </select>
                </div>
                <div>
                    <label style={label}>WhatsApp Number (with country code)</label>
                    <input value={f.whatsapp || ''} onChange={e => update('whatsapp', e.target.value)} placeholder="8801XXXXXXXXX" style={input} />
                </div>
                <div>
                    <label style={label}>Show WhatsApp</label>
                    <select value={f.showWhatsapp ? 'true' : 'false'} onChange={e => update('showWhatsapp', e.target.value === 'true')} style={input}>
                        <option value="true">Yes</option><option value="false">No</option>
                    </select>
                </div>
                <div>
                    <label style={label}>Messenger Page Username</label>
                    <input value={f.messenger || ''} onChange={e => update('messenger', e.target.value)} placeholder="YOUR_PAGE_USERNAME" style={input} />
                </div>
                <div>
                    <label style={label}>Show Messenger</label>
                    <select value={f.showMessenger ? 'true' : 'false'} onChange={e => update('showMessenger', e.target.value === 'true')} style={input}>
                        <option value="true">Yes</option><option value="false">No</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

/* ─── PAYMENT TAB ─── */
function PaymentTab({ data, setData }: { data: any; setData: any }) {
    const methods = [
        { key: 'bkash', label: 'bKash', color: '#E2136E' },
        { key: 'rocket', label: 'Rocket', color: '#8332AC' },
        { key: 'nagad', label: 'Nagad', color: '#F47920' },
        { key: 'cod', label: 'Cash on Delivery', color: '#16a34a' },
    ];

    const p = data.payment || {};
    const updateMethod = (method: string, field: string, value: any) => {
        setData((prev: any) => ({
            ...prev,
            payment: {
                ...prev.payment,
                [method]: { ...(prev.payment?.[method] || {}), [field]: value },
            },
        }));
    };
    const updateInstructions = (value: string) => {
        setData((prev: any) => ({ ...prev, payment: { ...prev.payment, instructions: value } }));
    };

    return (
        <div>
            {/* Info */}
            <div style={{ ...card, background: 'var(--color-primary-lightest)', borderColor: '#bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCheckCircle size={16} color="#16a34a" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>
                        These numbers appear on the <strong>Checkout</strong> page. Customers send money to the active number.
                    </span>
                </div>
            </div>

            {/* Method cards */}
            {methods.map(m => {
                const md = p[m.key] || {};
                const isCOD = m.key === 'cod';
                return (
                    <div key={m.key} style={{ ...card, borderLeft: `3px solid ${m.color}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isCOD ? 0 : '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: m.color }} />
                                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: m.color }}>{m.label}</h3>
                                {isCOD && <span style={{ fontSize: '11px', color: '#888', fontWeight: 400 }}>— no payment number needed</span>}
                            </div>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#555', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={md.active !== false}
                                    onChange={e => updateMethod(m.key, 'active', e.target.checked)}
                                    style={{ width: '15px', height: '15px', accentColor: m.color, cursor: 'pointer' }}
                                />
                                {md.active !== false ? 'Active' : 'Hidden'}
                            </label>
                        </div>
                        {!isCOD && (
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={label}>{m.label} Number</label>
                                    <input
                                        value={md.number || ''}
                                        onChange={e => updateMethod(m.key, 'number', e.target.value)}
                                        placeholder="01XXXXXXXXX"
                                        style={input}
                                    />
                                </div>
                                <div>
                                    <label style={label}>Account Type</label>
                                    <select
                                        value={md.accountType || 'Personal'}
                                        onChange={e => updateMethod(m.key, 'accountType', e.target.value)}
                                        style={input}
                                    >
                                        <option value="Personal">Personal</option>
                                        <option value="Agent">Agent</option>
                                        <option value="Merchant">Merchant</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Instructions */}
            <div style={card}>
                <label style={label}>Payment Instructions (shown to customer)</label>
                <textarea
                    value={p.instructions || ''}
                    onChange={e => updateInstructions(e.target.value)}
                    placeholder="e.g. Send Money to the number above, then submit your number, transaction ID and time."
                    rows={2}
                    style={{ ...input, resize: 'vertical' as const, fontFamily: 'inherit' }}
                />
            </div>
        </div>
    );
}

/* ─── FOOTER TAB ─── */
function FooterTab({ data, setData }: { data: any; setData: any }) {
    const f = data.footer || {};
    const update = (field: string, value: any) => setData((p: any) => ({ ...p, footer: { ...p.footer, [field]: value } }));

    return (
        <div style={card}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px' }}>Footer Settings</h3>
            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 16px' }}>Manage footer text displayed at the bottom of every page.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={label}>Company Name</label><input value={f.companyName || ''} onChange={e => update('companyName', e.target.value)} style={input} /></div>
                <div><label style={label}>Copyright Text (optional)</label><input value={f.copyright || ''} onChange={e => update('copyright', e.target.value)} placeholder="Leave empty for auto year" style={input} /></div>
            </div>
        </div>
    );
}

/* ─── LEGAL PAGES TAB ─── */
function LegalPagesTab() {
    const { data: legalRes, isLoading } = useGetAllLegalPagesQuery({});
    const [updateLegalPage, { isLoading: isSavingLegal }] = useUpdateLegalPageMutation();
    const [editingSlug, setEditingSlug] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    const pages = legalRes?.data || [];

    const LEGAL_PAGES = [
        { slug: 'terms', label: 'Terms & Conditions', icon: '📜', color: 'var(--color-primary)' },
        { slug: 'privacy', label: 'Privacy Policy', icon: '🛡️', color: '#2563eb' },
        { slug: 'refund', label: 'Refund Policy', icon: '🔄', color: '#d97706' },
    ];

    const startEdit = (slug: string) => {
        const page = pages.find((p: any) => p.slug === slug);
        setEditingSlug(slug);
        setEditTitle(page?.title || LEGAL_PAGES.find(l => l.slug === slug)?.label || '');
        setEditContent(page?.content || '');
    };

    const handleSaveLegal = async () => {
        if (!editingSlug) return;
        try {
            await updateLegalPage({ slug: editingSlug, data: { title: editTitle, content: editContent } }).unwrap();
            toast.success(`${editTitle} saved!`);
            setEditingSlug(null);
        } catch {
            toast.error('Failed to save');
        }
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ width: '28px', height: '28px', border: '3px solid #e5e7eb', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
        );
    }

    // Editing Mode
    if (editingSlug) {
        const meta = LEGAL_PAGES.find(l => l.slug === editingSlug);
        return (
            <div>
                <div style={{ ...card, borderColor: meta?.color + '40' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>{meta?.icon}</span>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Editing: {meta?.label}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setEditingSlug(null)} style={{ ...btn, background: '#f3f4f6', color: '#555' }}>Cancel</button>
                            <button onClick={handleSaveLegal} disabled={isSavingLegal} style={{ ...btnPrimary, opacity: isSavingLegal ? 0.6 : 1 }}>
                                <FiSave size={13} /> {isSavingLegal ? 'Saving...' : 'Save Page'}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={label}>Page Title</label>
                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={input} placeholder="Page title..." />
                    </div>

                    <div>
                        <label style={label}>Page Content</label>
                        <div className="legal-editor-wrapper" style={{ background: '#fff', borderRadius: '8px', border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
                            <ReactQuill
                                theme="snow"
                                value={editContent}
                                onChange={(value: string) => setEditContent(value)}
                                placeholder="Write your page content here..."
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                        [{ 'font': [] }],
                                        [{ 'size': ['small', false, 'large', 'huge'] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ 'color': [] }, { 'background': [] }],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        [{ 'indent': '-1' }, { 'indent': '+1' }],
                                        [{ 'align': [] }],
                                        ['link', 'image', 'video'],
                                        ['blockquote', 'code-block'],
                                        ['clean'],
                                    ],
                                }}
                                style={{ minHeight: '400px' }}
                            />
                        </div>
                        <style>{`
                            .legal-editor-wrapper .ql-toolbar { border: none !important; border-bottom: 1px solid #e5e7eb !important; background: #f9fafb; padding: 10px 12px !important; }
                            .legal-editor-wrapper .ql-container { border: none !important; font-size: 14px; font-family: inherit; }
                            .legal-editor-wrapper .ql-editor { min-height: 400px; padding: 20px 24px; line-height: 1.8; }
                            .legal-editor-wrapper .ql-editor h1 { font-size: 22px; font-weight: 800; margin: 20px 0 10px; }
                            .legal-editor-wrapper .ql-editor h2 { font-size: 18px; font-weight: 700; margin: 18px 0 8px; }
                            .legal-editor-wrapper .ql-editor h3 { font-size: 15px; font-weight: 600; margin: 14px 0 6px; }
                            .legal-editor-wrapper .ql-editor p { margin-bottom: 10px; }
                            .legal-editor-wrapper .ql-editor img { max-width: 100%; border-radius: 8px; margin: 12px 0; }
                        `}</style>
                    </div>
                </div>
            </div>
        );
    }

    // List Mode
    return (
        <div>
            <div style={{ ...card, background: 'var(--color-primary-surface)', borderColor: '#bbf7d0' }}>
                <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, margin: 0 }}>
                    ✅ These pages are live at: <strong>/terms</strong>, <strong>/privacy</strong>, <strong>/refund</strong>
                </p>
            </div>
            {LEGAL_PAGES.map(lp => {
                const page = pages.find((p: any) => p.slug === lp.slug);
                const hasContent = page?.content && page.content.length > 10;
                return (
                    <div key={lp.slug} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '24px' }}>{lp.icon}</span>
                            <div>
                                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 2px', color: '#111' }}>{lp.label}</h4>
                                <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>
                                    {hasContent ? `${page.content.replace(/<[^>]+>/g, '').substring(0, 80)}...` : 'No content yet'}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
                                background: hasContent ? 'var(--color-primary-lightest)' : '#fef2f2',
                                color: hasContent ? '#16a34a' : '#dc2626',
                                textTransform: 'uppercase',
                            }}>
                                {hasContent ? 'Published' : 'Empty'}
                            </span>
                            <button onClick={() => startEdit(lp.slug)} style={{ ...btnSmall, fontWeight: 700 }}>
                                ✏️ Edit
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── HERO SLIDES TAB ─── */
function HeroSlidesTab({ data, setData, onSave, isSaving }: { data: any; setData: any; onSave: () => void; isSaving: boolean }) {
    const slides = data.heroSlides || [];

    // Live homepage preview — mirrors exactly what HeroSection shows (active slides, with image fallback)
    const activeSlides = slides.filter((s: any) => s.active !== false);
    const previewSlides = activeSlides.length > 0 ? activeSlides : [{ mediaType: 'image', imageUrl: '/images/hero.jpg' }];

    // ── Add-slide form state ──
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [videoSource, setVideoSource] = useState<'upload' | 'youtube'>('youtube');
    const [youtubeInput, setYoutubeInput] = useState('');

    const pushSlide = (slide: any) => {
        const newSlides = [...slides, { ...slide, active: true, order: slides.length }];
        setData((p: any) => ({ ...p, heroSlides: newSlides }));
    };

    const addImageSlide = (imageUrl: string) => {
        if (!imageUrl) return;
        pushSlide({ mediaType: 'image', imageUrl });
    };

    const addUploadedVideoSlide = (videoUrl: string) => {
        if (!videoUrl) return;
        pushSlide({ mediaType: 'video', videoUrl });
    };

    const addYoutubeSlide = () => {
        if (!isValidYouTube(youtubeInput)) {
            toast.error('Please enter a valid YouTube link');
            return;
        }
        pushSlide({ mediaType: 'video', youtubeUrl: youtubeInput.trim() });
        setYoutubeInput('');
        toast.success('YouTube slide added');
    };

    const removeSlide = (idx: number) => {
        const newSlides = slides.filter((_: any, i: number) => i !== idx);
        setData((p: any) => ({ ...p, heroSlides: newSlides }));
    };

    const moveSlide = (idx: number, direction: 'up' | 'down') => {
        const newSlides = [...slides];
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= newSlides.length) return;
        [newSlides[idx], newSlides[swapIdx]] = [newSlides[swapIdx], newSlides[idx]];
        setData((p: any) => ({ ...p, heroSlides: newSlides }));
    };

    // ── Toggle button helper ──
    const toggleBtn = (active: boolean): React.CSSProperties => ({
        ...btn, padding: '7px 16px', fontSize: '12.5px',
        background: active ? 'var(--color-primary)' : '#f3f4f6',
        color: active ? '#fff' : '#555',
    });

    // ── Renders the right preview for a slide in the grid ──
    const renderSlidePreview = (slide: any) => {
        if (slide.mediaType === 'video' && slide.youtubeUrl) {
            const thumb = getYouTubeThumbnail(slide.youtubeUrl);
            return (
                <div style={{ position: 'relative', width: '100%', height: '120px', background: '#000' }}>
                    {thumb && <img src={thumb} alt="yt" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiYoutube size={34} color="#fff" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))' }} />
                    </div>
                </div>
            );
        }
        if (slide.mediaType === 'video' && slide.videoUrl) {
            return <video src={slide.videoUrl} muted style={{ width: '100%', height: '120px', objectFit: 'cover', background: '#000' }} />;
        }
        return <img src={slide.imageUrl} alt="slide" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />;
    };

    const slideBadge = (slide: any) => {
        if (slide.mediaType === 'video' && slide.youtubeUrl) return { icon: <FiYoutube size={11} />, text: 'YouTube', bg: '#fef2f2', color: '#dc2626' };
        if (slide.mediaType === 'video') return { icon: <FiVideo size={11} />, text: 'Video', bg: '#eff6ff', color: '#2563eb' };
        return { icon: <FiImage size={11} />, text: 'Image', bg: '#f0fdf4', color: '#16a34a' };
    };

    return (
        <div>
            {/* Info */}
            <div style={{ ...card, background: '#fffbeb', borderColor: '#fde68a' }}>
                <p style={{ fontSize: '12px', color: '#b45309', fontWeight: 600, margin: 0 }}>
                    🖼️ Hero slides appear at the top of your homepage as a banner carousel. You can add <b>images</b>, <b>uploaded videos</b>, or <b>YouTube links</b> — they auto-rotate.
                </p>
            </div>

            {/* Live Homepage Preview */}
            <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🖥️ Homepage Preview
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', background: 'var(--color-primary-lightest)', color: '#16a34a' }}>LIVE</span>
                    </h3>
                    <span style={{ fontSize: '11px', color: '#888' }}>Exactly how the banner will look on the homepage</span>
                </div>
                {/* Constrained to the same 16:4.5 ratio the homepage uses */}
                <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e7eb', background: '#000' }}>
                    <HeroCarousel slides={previewSlides} />
                </div>
                {activeSlides.length === 0 && (
                    <p style={{ fontSize: '11.5px', color: '#b45309', margin: '8px 0 0', fontWeight: 500 }}>
                        ⚠️ No active slides yet — the homepage is showing the default fallback image above. Add a slide below, then click <b>Save Hero Slides</b>.
                    </p>
                )}
                {activeSlides.length > 0 && (
                    <p style={{ fontSize: '11.5px', color: '#888', margin: '8px 0 0' }}>
                        💡 This preview updates instantly as you add slides — but remember to click <b>Save Hero Slides</b> to make it live on the real homepage.
                    </p>
                )}
            </div>

            {/* Current Slides */}
            {slides.length > 0 && (
                <div style={{ ...card }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Current Slides ({slides.length})</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                        {slides.map((slide: any, idx: number) => {
                            const badge = slideBadge(slide);
                            return (
                                <div key={idx} style={{
                                    position: 'relative', borderRadius: '10px', overflow: 'hidden',
                                    border: '1px solid #e5e7eb', background: '#f9fafb',
                                }}>
                                    {renderSlidePreview(slide)}
                                    {/* Type badge */}
                                    <span style={{
                                        position: 'absolute', top: '8px', left: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        padding: '3px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700,
                                        background: badge.bg, color: badge.color,
                                    }}>
                                        {badge.icon} {badge.text}
                                    </span>
                                    <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>Slide {idx + 1}</span>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={() => moveSlide(idx, 'up')}
                                                disabled={idx === 0}
                                                style={{ ...btnSmall, padding: '4px 6px', opacity: idx === 0 ? 0.3 : 1 }}
                                                title="Move Up"
                                            >
                                                <FiArrowUp size={12} />
                                            </button>
                                            <button
                                                onClick={() => moveSlide(idx, 'down')}
                                                disabled={idx === slides.length - 1}
                                                style={{ ...btnSmall, padding: '4px 6px', opacity: idx === slides.length - 1 ? 0.3 : 1 }}
                                                title="Move Down"
                                            >
                                                <FiArrowDown size={12} />
                                            </button>
                                            <button
                                                onClick={() => removeSlide(idx)}
                                                style={{ ...btnSmall, padding: '4px 6px', background: '#fef2f2', color: '#dc2626' }}
                                                title="Delete"
                                            >
                                                <FiTrash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Add New Slide */}
            <div style={card}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Add New Slide</h3>

                {/* Media type toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button type="button" onClick={() => setMediaType('image')} style={toggleBtn(mediaType === 'image')}>
                        <FiImage size={14} /> Image
                    </button>
                    <button type="button" onClick={() => setMediaType('video')} style={toggleBtn(mediaType === 'video')}>
                        <FiVideo size={14} /> Video
                    </button>
                </div>

                {/* IMAGE */}
                {mediaType === 'image' && (
                    <>
                        <p style={{ fontSize: '11px', color: '#888', margin: '0 0 12px' }}>
                            Upload a high-quality banner image (recommended: 1920×540px or 16:4.5 ratio)
                        </p>
                        <SingleImageUploader
                            label="Slide Image"
                            value=""
                            onChange={(url) => addImageSlide(url)}
                        />
                    </>
                )}

                {/* VIDEO */}
                {mediaType === 'video' && (
                    <>
                        {/* Video source sub-toggle */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                            <button type="button" onClick={() => setVideoSource('youtube')} style={{ ...toggleBtn(videoSource === 'youtube'), padding: '6px 13px', fontSize: '12px' }}>
                                <FiYoutube size={13} /> YouTube Link
                            </button>
                            <button type="button" onClick={() => setVideoSource('upload')} style={{ ...toggleBtn(videoSource === 'upload'), padding: '6px 13px', fontSize: '12px' }}>
                                <FiUploadCloud size={13} /> Upload Video
                            </button>
                        </div>

                        {/* YouTube link */}
                        {videoSource === 'youtube' && (
                            <div>
                                <label style={label}>YouTube Video Link</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        style={input}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={youtubeInput}
                                        onChange={(e) => setYoutubeInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addYoutubeSlide(); } }}
                                    />
                                    <button type="button" onClick={addYoutubeSlide} style={{ ...btnPrimary, whiteSpace: 'nowrap' }}>
                                        <FiPlus size={13} /> Add
                                    </button>
                                </div>
                                {/* Live preview */}
                                {youtubeInput && isValidYouTube(youtubeInput) && (
                                    <div style={{ marginTop: '12px', maxWidth: '320px', aspectRatio: '16 / 9', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                        <iframe src={getYouTubeEmbedUrl(youtubeInput) || ''} title="preview" allow="autoplay; encrypted-media" style={{ width: '100%', height: '100%', border: 0 }} />
                                    </div>
                                )}
                                {youtubeInput && !isValidYouTube(youtubeInput) && (
                                    <p style={{ fontSize: '11.5px', color: '#ef4444', margin: '6px 0 0', fontWeight: 500 }}>Not a valid YouTube link</p>
                                )}
                            </div>
                        )}

                        {/* Upload video */}
                        {videoSource === 'upload' && (
                            <>
                                <p style={{ fontSize: '11px', color: '#888', margin: '0 0 12px' }}>
                                    Upload a short banner video (MP4/WebM/MOV, max 100MB). It will play muted and looped.
                                </p>
                                <SingleVideoUploader
                                    label="Slide Video"
                                    value=""
                                    onChange={(url) => addUploadedVideoSlide(url)}
                                />
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={onSave} disabled={isSaving} style={{ ...btnPrimary, opacity: isSaving ? 0.6 : 1 }}>
                    <FiSave size={13} /> {isSaving ? 'Saving...' : 'Save Hero Slides'}
                </button>
            </div>
        </div>
    );
}
