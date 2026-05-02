"use client";

import React, { useState, useEffect } from 'react';
import { useGetSiteContentQuery, useUpdateSiteContentMutation } from '@/redux/api/siteContentApi';
import { toast } from 'react-hot-toast';
import {
    FiType, FiPhone, FiMessageCircle, FiLayout,
    FiGlobe, FiAlertCircle, FiTag, FiSave, FiPlus, FiTrash2,
    FiChevronDown, FiChevronUp
} from 'react-icons/fi';

/* ─── Styles ─── */
const card: React.CSSProperties = { background: '#fff', border: '1px solid #eee', borderRadius: '10px', padding: '20px', marginBottom: '16px' };
const label: React.CSSProperties = { fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '5px' };
const input: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const };
const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' };
const btnPrimary: React.CSSProperties = { ...btn, background: '#0B4222', color: '#fff' };
const btnDanger: React.CSSProperties = { ...btn, background: '#fef2f2', color: '#dc2626', padding: '6px 10px' };
const btnSmall: React.CSSProperties = { ...btn, background: '#f3f4f6', color: '#333', padding: '6px 12px', fontSize: '12px' };

/* ─── Tabs Config ─── */
const TABS = [
    { key: 'ticker', label: 'Header Ticker', icon: FiType },
    { key: 'contact', label: 'Contact Page', icon: FiPhone },
    { key: 'floating', label: 'Floating Widget', icon: FiMessageCircle },
    { key: 'footer', label: 'Footer', icon: FiLayout },
    { key: 'seo', label: 'SEO / Meta', icon: FiGlobe },
    { key: 'tagline', label: 'Default Tagline', icon: FiTag },
    { key: 'announcement', label: 'Announcement', icon: FiAlertCircle },
];

export default function SiteContentPage() {
    const { data: res, isLoading } = useGetSiteContentQuery({});
    const [updateContent, { isLoading: isSaving }] = useUpdateSiteContentMutation();
    const [activeTab, setActiveTab] = useState('ticker');
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (res?.data) {
            setFormData(JSON.parse(JSON.stringify(res.data)));
        }
    }, [res]);

    const handleSave = async () => {
        try {
            const payload: any = {};
            if (activeTab === 'tagline') {
                payload.defaultTagline = formData.defaultTagline;
            } else {
                payload[activeTab] = formData[activeTab];
            }
            await updateContent(payload).unwrap();
            toast.success('Saved successfully!');
        } catch {
            toast.error('Failed to save');
        }
    };

    if (isLoading || !formData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#0B4222', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
                    <FiSave size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
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
                            color: activeTab === tab.key ? '#0B4222' : '#888',
                            background: activeTab === tab.key ? '#f0faf4' : 'transparent',
                            borderRadius: '6px 6px 0 0',
                            borderBottom: activeTab === tab.key ? '2px solid #0B4222' : '2px solid transparent',
                            transition: 'all 0.15s',
                        }}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'ticker' && <TickerTab data={formData} setData={setFormData} />}
            {activeTab === 'contact' && <ContactTab data={formData} setData={setFormData} />}
            {activeTab === 'floating' && <FloatingTab data={formData} setData={setFormData} />}
            {activeTab === 'footer' && <FooterTab data={formData} setData={setFormData} />}
            {activeTab === 'seo' && <SEOTab data={formData} setData={setFormData} />}
            {activeTab === 'tagline' && <TaglineTab data={formData} setData={setFormData} />}
            {activeTab === 'announcement' && <AnnouncementTab data={formData} setData={setFormData} />}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── TICKER TAB ─── */
function TickerTab({ data, setData }: { data: any; setData: any }) {
    const ticker = data.ticker || [];

    const addItem = () => {
        setData((p: any) => ({ ...p, ticker: [...(p.ticker || []), { text: '', emoji: '', active: true, order: p.ticker?.length || 0 }] }));
    };

    const removeItem = (idx: number) => {
        setData((p: any) => ({ ...p, ticker: p.ticker.filter((_: any, i: number) => i !== idx) }));
    };

    const updateItem = (idx: number, field: string, value: any) => {
        setData((p: any) => {
            const t = [...p.ticker];
            t[idx] = { ...t[idx], [field]: value };
            return { ...p, ticker: t };
        });
    };

    const moveItem = (idx: number, dir: number) => {
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= ticker.length) return;
        setData((p: any) => {
            const t = [...p.ticker];
            [t[idx], t[newIdx]] = [t[newIdx], t[idx]];
            return { ...p, ticker: t };
        });
    };

    return (
        <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Ticker Messages</h3>
                <button onClick={addItem} style={btnSmall}><FiPlus size={13} /> Add Message</button>
            </div>

            {ticker.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', padding: '10px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button onClick={() => moveItem(idx, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: '2px' }}><FiChevronUp size={12} /></button>
                        <button onClick={() => moveItem(idx, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: '2px' }}><FiChevronDown size={12} /></button>
                    </div>
                    <input value={item.text} onChange={(e) => updateItem(idx, 'text', e.target.value)} placeholder="Ticker message text..." style={{ ...input, flex: 1 }} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#888', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <input type="checkbox" checked={item.active} onChange={(e) => updateItem(idx, 'active', e.target.checked)} />
                        Active
                    </label>
                    <button onClick={() => removeItem(idx)} style={btnDanger}><FiTrash2 size={13} /></button>
                </div>
            ))}
            {ticker.length === 0 && <p style={{ fontSize: '12px', color: '#bbb', textAlign: 'center', padding: '20px' }}>No ticker messages. Click "Add Message" to create one.</p>}
        </div>
    );
}

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
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 14px' }}>Floating Contact Widget</h3>
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

/* ─── FOOTER TAB ─── */
function FooterTab({ data, setData }: { data: any; setData: any }) {
    const f = data.footer || {};
    const update = (field: string, value: any) => setData((p: any) => ({ ...p, footer: { ...p.footer, [field]: value } }));

    return (
        <div style={card}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 14px' }}>Footer Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={label}>Company Name</label><input value={f.companyName || ''} onChange={e => update('companyName', e.target.value)} style={input} /></div>
                <div><label style={label}>Copyright Text (optional)</label><input value={f.copyright || ''} onChange={e => update('copyright', e.target.value)} placeholder="Leave empty for auto year" style={input} /></div>
            </div>
        </div>
    );
}

/* ─── SEO TAB ─── */
function SEOTab({ data, setData }: { data: any; setData: any }) {
    const s = data.seo || {};
    const update = (field: string, value: string) => setData((p: any) => ({ ...p, seo: { ...p.seo, [field]: value } }));

    return (
        <div style={card}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 14px' }}>SEO / Meta Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><label style={label}>Site Title</label><input value={s.title || ''} onChange={e => update('title', e.target.value)} style={input} /></div>
                <div><label style={label}>Meta Description</label><textarea value={s.description || ''} onChange={e => update('description', e.target.value)} rows={3} style={{ ...input, resize: 'vertical' }} /></div>
                <div><label style={label}>Meta Keywords (comma separated)</label><input value={s.keywords || ''} onChange={e => update('keywords', e.target.value)} style={input} /></div>
            </div>
        </div>
    );
}

/* ─── TAGLINE TAB ─── */
function TaglineTab({ data, setData }: { data: any; setData: any }) {
    return (
        <div style={card}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 14px' }}>Default Product Tagline</h3>
            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 12px' }}>This scrolling text appears on product cards that don&apos;t have a custom tagline.</p>
            <input
                value={data.defaultTagline || ''}
                onChange={e => setData((p: any) => ({ ...p, defaultTagline: e.target.value }))}
                placeholder="e.g. Lower price than others but quality higher"
                style={input}
            />
        </div>
    );
}

/* ─── ANNOUNCEMENT TAB ─── */
function AnnouncementTab({ data, setData }: { data: any; setData: any }) {
    const a = data.announcement || {};
    const update = (field: string, value: any) => setData((p: any) => ({ ...p, announcement: { ...p.announcement, [field]: value } }));

    return (
        <div style={card}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 14px' }}>Announcement Bar</h3>
            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 12px' }}>Displays a bar at the very top of the site for urgent messages.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                    <label style={label}>Message</label>
                    <input value={a.message || ''} onChange={e => update('message', e.target.value)} placeholder="e.g. 🚧 Site under maintenance..." style={input} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                        <label style={label}>Background Color</label>
                        <input type="color" value={a.bgColor || '#E4525C'} onChange={e => update('bgColor', e.target.value)} style={{ width: '100%', height: '36px', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
                    </div>
                    <div>
                        <label style={label}>Text Color</label>
                        <input type="color" value={a.textColor || '#FFFFFF'} onChange={e => update('textColor', e.target.value)} style={{ width: '100%', height: '36px', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
                    </div>
                    <div>
                        <label style={label}>Active</label>
                        <select value={a.active ? 'true' : 'false'} onChange={e => update('active', e.target.value === 'true')} style={input}>
                            <option value="true">Yes</option><option value="false">No</option>
                        </select>
                    </div>
                    <div>
                        <label style={label}>Dismissible</label>
                        <select value={a.dismissible !== false ? 'true' : 'false'} onChange={e => update('dismissible', e.target.value === 'true')} style={input}>
                            <option value="true">Yes</option><option value="false">No</option>
                        </select>
                    </div>
                </div>
                {/* Preview */}
                {a.message && (
                    <div style={{ marginTop: '8px' }}>
                        <label style={label}>Preview:</label>
                        <div style={{ padding: '10px 16px', background: a.bgColor || '#E4525C', color: a.textColor || '#fff', borderRadius: '6px', fontSize: '13px', fontWeight: 500, textAlign: 'center' }}>
                            {a.message}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
