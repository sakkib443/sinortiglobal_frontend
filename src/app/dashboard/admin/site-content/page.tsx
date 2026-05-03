"use client";

import React, { useState, useEffect } from 'react';
import { useGetSiteContentQuery, useUpdateSiteContentMutation } from '@/redux/api/siteContentApi';
import { toast } from 'react-hot-toast';
import {
    FiPhone, FiMessageCircle, FiLayout,
    FiSave, FiPlus, FiTrash2, FiCheckCircle,
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
    { key: 'contact', label: 'Contact Page', icon: FiPhone },
    { key: 'floating', label: 'Floating Widget', icon: FiMessageCircle },
    { key: 'footer', label: 'Footer', icon: FiLayout },
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
        try {
            const payload: any = {};
            payload[activeTab] = formData[activeTab];
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
            {activeTab === 'contact' && <ContactTab data={formData} setData={setFormData} />}
            {activeTab === 'floating' && <FloatingTab data={formData} setData={setFormData} />}
            {activeTab === 'footer' && <FooterTab data={formData} setData={setFormData} />}
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
            <div style={{ ...card, background: '#f0faf4', borderColor: '#bbf7d0' }}>
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
