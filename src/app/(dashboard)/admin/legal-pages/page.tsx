"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiFileText, FiEdit3, FiChevronLeft, FiSave, FiEye, FiEyeOff, FiCheck, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';
import { useGetAllLegalPagesQuery, useUpdateLegalPageMutation } from '@/redux/api/siteContentApi';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const slugLabels: Record<string, { title: string; icon: string; color: string; bgColor: string }> = {
    terms: { title: 'Terms & Conditions', icon: '📜', color: '#0B4222', bgColor: '#f0faf4' },
    privacy: { title: 'Privacy Policy', icon: '🔒', color: '#1d4ed8', bgColor: '#eff6ff' },
    refund: { title: 'Refund Policy', icon: '💰', color: '#b45309', bgColor: '#fffbeb' },
};

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote'],
        [{ align: [] }],
        ['link'],
        ['clean'],
    ],
};

const LegalPagesAdmin = () => {
    const { data: response, isLoading, refetch } = useGetAllLegalPagesQuery(undefined);
    const [updateLegalPage, { isLoading: isUpdating }] = useUpdateLegalPageMutation();

    const [editingSlug, setEditingSlug] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editActive, setEditActive] = useState(true);
    const [quillReady, setQuillReady] = useState(false);

    const pages = response?.data || [];

    useEffect(() => {
        setQuillReady(true);
    }, []);

    const handleEdit = (page: any) => {
        setEditingSlug(page.slug);
        setEditTitle(page.title);
        setEditContent(page.content || '');
        setEditActive(page.active !== false);
    };

    const handleSave = async () => {
        if (!editingSlug) return;
        try {
            await updateLegalPage({
                slug: editingSlug,
                data: { title: editTitle, content: editContent, active: editActive },
            }).unwrap();
            toast.success('Legal page updated successfully! ✅');
            setEditingSlug(null);
            refetch();
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to update page');
        }
    };

    const handleCancel = () => {
        setEditingSlug(null);
        setEditTitle('');
        setEditContent('');
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px', height: '40px', border: '3px solid #e5e7eb',
                        borderTopColor: '#0B4222', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
                    }} />
                    <p style={{ fontSize: '13px', color: '#888' }}>Loading legal pages...</p>
                </div>
            </div>
        );
    }

    // ── EDITING VIEW ──
    if (editingSlug) {
        const meta = slugLabels[editingSlug] || { title: editingSlug, icon: '📄', color: '#555', bgColor: '#f5f5f5' };
        return (
            <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={handleCancel}
                            style={{
                                width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e5e7eb',
                                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#888',
                            }}
                        >
                            <FiChevronLeft size={18} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: 0 }}>
                                {meta.icon} Edit {meta.title}
                            </h1>
                            <p style={{ fontSize: '12px', color: '#999', margin: '2px 0 0' }}>
                                Use the rich text editor below to update content
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleCancel}
                            style={{
                                padding: '9px 20px', borderRadius: '8px', border: '1px solid #e5e7eb',
                                background: '#fff', fontSize: '13px', fontWeight: 600, color: '#666',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isUpdating}
                            style={{
                                padding: '9px 24px', borderRadius: '8px', border: 'none',
                                background: isUpdating ? '#999' : '#0B4222', fontSize: '13px', fontWeight: 700,
                                color: '#fff', cursor: isUpdating ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}
                        >
                            <FiSave size={14} />
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Title Input */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#555', display: 'block', marginBottom: '6px' }}>
                        Page Title
                    </label>
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 16px', fontSize: '14px', fontWeight: 600,
                            border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none',
                            boxSizing: 'border-box',
                        }}
                        placeholder="Enter page title..."
                    />
                </div>

                {/* Active Toggle */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={() => setEditActive(!editActive)}
                        style={{
                            width: '44px', height: '24px', borderRadius: '12px',
                            background: editActive ? '#0B4222' : '#ddd',
                            border: 'none', cursor: 'pointer', position: 'relative',
                            transition: 'background 0.2s',
                        }}
                    >
                        <div style={{
                            width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                            position: 'absolute', top: '3px',
                            left: editActive ? '23px' : '3px',
                            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: editActive ? '#0B4222' : '#999' }}>
                        {editActive ? 'Published' : 'Unpublished'}
                    </span>
                </div>

                {/* Rich Text Editor */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#555', display: 'block', marginBottom: '6px' }}>
                        Page Content
                    </label>
                    <div className="product-editor-wrapper">
                        {quillReady && (
                            <ReactQuill
                                value={editContent}
                                onChange={setEditContent}
                                modules={quillModules}
                                theme="snow"
                                placeholder="Write your page content here..."
                                style={{ minHeight: '400px' }}
                            />
                        )}
                    </div>
                </div>

                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // ── LIST VIEW ──
    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111', margin: '0 0 4px' }}>
                    📋 Legal Pages
                </h1>
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                    Manage your Terms & Conditions, Privacy Policy, and Refund Policy pages
                </p>
            </div>

            {/* Page Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {['terms', 'privacy', 'refund'].map((slug) => {
                    const page = pages.find((p: any) => p.slug === slug);
                    const meta = slugLabels[slug];
                    const hasContent = page?.content && page.content.replace(/<[^>]*>/g, '').trim().length > 50;
                    const lastUpdated = page?.lastUpdated ? new Date(page.lastUpdated).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                    }) : 'Not set';

                    return (
                        <div
                            key={slug}
                            style={{
                                background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
                                padding: '24px', transition: 'all 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                        >
                            {/* Card Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: meta.bgColor, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: '20px',
                                    }}>
                                        {meta.icon}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111', margin: 0 }}>
                                            {meta.title}
                                        </h3>
                                        <p style={{ fontSize: '11px', color: '#999', margin: '2px 0 0' }}>
                                            /{slug}
                                        </p>
                                    </div>
                                </div>
                                {/* Status Badge */}
                                <span style={{
                                    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                                    letterSpacing: '0.5px', padding: '4px 10px', borderRadius: '20px',
                                    background: (page?.active !== false) ? '#f0faf4' : '#fef2f2',
                                    color: (page?.active !== false) ? '#0B4222' : '#dc2626',
                                }}>
                                    {(page?.active !== false) ? 'Published' : 'Draft'}
                                </span>
                            </div>

                            {/* Content Preview */}
                            <div style={{
                                padding: '12px', background: '#f9fafb', borderRadius: '8px',
                                marginBottom: '16px', minHeight: '60px',
                            }}>
                                {hasContent ? (
                                    <p style={{
                                        fontSize: '12px', color: '#666', lineHeight: 1.6, margin: 0,
                                        display: '-webkit-box', WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                    }}>
                                        {page.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                                    </p>
                                ) : (
                                    <p style={{ fontSize: '12px', color: '#ccc', fontStyle: 'italic', margin: 0 }}>
                                        No content added yet. Click Edit to add content.
                                    </p>
                                )}
                            </div>

                            {/* Meta Info */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: '16px',
                            }}>
                                <span style={{ fontSize: '11px', color: '#aaa' }}>
                                    Last updated: {lastUpdated}
                                </span>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => page && handleEdit(page)}
                                    style={{
                                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                        background: meta.color, color: '#fff', fontSize: '12px',
                                        fontWeight: 700, cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        transition: 'opacity 0.2s',
                                    }}
                                >
                                    <FiEdit3 size={13} /> Edit Content
                                </button>
                                <Link
                                    href={`/${slug}`}
                                    target="_blank"
                                    style={{
                                        padding: '10px 14px', borderRadius: '8px',
                                        border: '1px solid #e5e7eb', background: '#fff',
                                        color: '#666', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', textDecoration: 'none',
                                    }}
                                >
                                    <FiExternalLink size={14} />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default LegalPagesAdmin;
