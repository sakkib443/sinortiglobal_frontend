"use client";

import React, { useState, useEffect } from 'react';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave, FiGrid,
} from 'react-icons/fi';
import {
    useGetCategoriesQuery,
    useDeleteCategoryMutation,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
} from '@/redux/api/categoryApi';
import { toast } from 'react-hot-toast';

/* ─── Styles ─── */
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const lbl: React.CSSProperties = { fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '5px' };

const CategoriesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: categoriesData, isLoading, refetch } = useGetCategoriesQuery({});
    const [deleteCategory] = useDeleteCategoryMutation();
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

    /* ─── Modal State ─── */
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', description: '', isActive: true, showInMenu: true, showInHome: true });

    const categories = categoriesData?.data || [];
    const isSaving = isCreating || isUpdating;

    const openCreate = () => {
        setEditingId(null);
        setForm({ name: '', description: '', isActive: true, showInMenu: true, showInHome: true });
        setModalOpen(true);
    };

    const openEdit = (cat: any) => {
        setEditingId(cat._id);
        setForm({
            name: cat.name || '',
            description: cat.description || '',
            isActive: cat.isActive !== false,
            showInMenu: cat.showInMenu !== false,
            showInHome: cat.showInHome !== false,
        });
        setModalOpen(true);
    };

    const closeModal = () => { setModalOpen(false); setEditingId(null); };

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error('Category name is required'); return; }
        try {
            if (editingId) {
                await updateCategory({ id: editingId, data: form }).unwrap();
                toast.success('Category updated');
            } else {
                await createCategory(form).unwrap();
                toast.success('Category created');
            }
            closeModal();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(id).unwrap();
                toast.success('Category deleted');
            } catch (error: any) {
                toast.error(error?.data?.message || 'Failed to delete');
            }
        }
    };

    const filtered = categories.filter((cat: any) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#111', margin: 0 }}>Categories</h1>
                    <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0' }}>Manage product categories</p>
                </div>
                <button onClick={openCreate} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', background: 'var(--color-primary)', color: '#fff',
                    border: 'none', borderRadius: '7px', fontSize: '12.5px', fontWeight: 700,
                    cursor: 'pointer',
                }}>
                    <FiPlus size={14} /> Add Category
                </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
                <FiSearch size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ ...inp, paddingLeft: '34px' }}
                />
            </div>

            {/* Categories List */}
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
                {isLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ width: '28px', height: '28px', border: '3px solid #e5e7eb', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                    </div>
                ) : filtered.length > 0 ? (
                    <div>
                        {filtered.map((cat: any, i: number) => (
                            <div key={cat._id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 16px',
                                borderBottom: i < filtered.length - 1 ? '1px solid #f5f5f5' : 'none',
                                transition: 'background 0.15s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '8px',
                                        background: '#f5f5f5', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <FiGrid size={16} color="#bbb" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: 0 }}>{cat.name}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                            <span style={{ fontSize: '10.5px', color: '#aaa', fontFamily: 'monospace' }}>{cat.slug}</span>
                                            <span style={{
                                                fontSize: '9px', fontWeight: 700,
                                                padding: '1px 6px', borderRadius: '999px',
                                                background: cat.isActive ? 'var(--color-primary-lightest)' : '#fef2f2',
                                                color: cat.isActive ? '#16a34a' : '#dc2626',
                                            }}>
                                                {cat.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <span style={{ fontSize: '10px', color: '#ccc' }}>{cat.productCount || 0} products</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => openEdit(cat)} style={{
                                        width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'transparent', border: '1px solid transparent', borderRadius: '6px',
                                        cursor: 'pointer', color: 'var(--color-primary)', transition: 'all 0.15s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-lightest)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                                    >
                                        <FiEdit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(cat._id)} style={{
                                        width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'transparent', border: '1px solid transparent', borderRadius: '6px',
                                        cursor: 'pointer', color: '#dc2626', transition: 'all 0.15s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <FiGrid size={28} color="#ddd" style={{ margin: '0 auto 10px' }} />
                        <p style={{ fontSize: '13px', color: '#aaa', margin: '0 0 12px' }}>No categories found</p>
                        <button onClick={openCreate} style={{
                            padding: '7px 16px', background: 'var(--color-primary)', color: '#fff',
                            border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                        }}>
                            <FiPlus size={12} style={{ marginRight: '4px', verticalAlign: '-2px' }} /> Create Category
                        </button>
                    </div>
                )}
            </div>

            {/* ═══ POPUP MODAL ═══ */}
            {modalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {/* Backdrop */}
                    <div onClick={closeModal} style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                    }} />

                    {/* Modal */}
                    <div style={{
                        position: 'relative', background: '#fff',
                        borderRadius: '12px', width: '420px', maxWidth: '90vw',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        animation: 'fadeIn 0.2s ease-out',
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
                        }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111', margin: 0 }}>
                                {editingId ? 'Edit Category' : 'Add Category'}
                            </h3>
                            <button onClick={closeModal} style={{
                                width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#f5f5f5', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#888',
                            }}>
                                <FiX size={14} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {/* Name */}
                            <div>
                                <label style={lbl}>Category Name <span style={{ color: 'var(--color-secondary)' }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Electronics, Fashion"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    style={inp}
                                    autoFocus
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label style={lbl}>Description <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
                                <textarea
                                    placeholder="Short description..."
                                    rows={2}
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    style={{ ...inp, resize: 'vertical' }}
                                />
                            </div>

                            {/* Toggles */}
                            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { key: 'isActive', label: 'Active' },
                                    { key: 'showInMenu', label: 'Show in Menu' },
                                    { key: 'showInHome', label: 'Show on Homepage' },
                                ].map((toggle) => (
                                    <label key={toggle.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                        <span style={{ fontSize: '12.5px', color: '#555', fontWeight: 500 }}>{toggle.label}</span>
                                        <div
                                            onClick={() => setForm(p => ({ ...p, [toggle.key]: !(p as any)[toggle.key] }))}
                                            style={{
                                                position: 'relative', width: '36px', height: '20px',
                                                borderRadius: '999px', cursor: 'pointer',
                                                background: (form as any)[toggle.key] ? 'var(--color-primary)' : '#ddd',
                                                transition: 'background 0.2s',
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute', top: '3px',
                                                left: (form as any)[toggle.key] ? '19px' : '3px',
                                                width: '14px', height: '14px', borderRadius: '50%',
                                                background: '#fff', transition: 'left 0.2s',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                            }} />
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            display: 'flex', gap: '8px', padding: '14px 20px',
                            borderTop: '1px solid #f0f0f0',
                        }}>
                            <button onClick={closeModal} style={{
                                flex: 1, padding: '9px', background: '#f5f5f5', color: '#666',
                                border: 'none', borderRadius: '7px', fontSize: '12.5px', fontWeight: 600,
                                cursor: 'pointer',
                            }}>
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isSaving} style={{
                                flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                background: isSaving ? '#888' : 'var(--color-primary)', color: '#fff',
                                border: 'none', borderRadius: '7px', fontSize: '12.5px', fontWeight: 700,
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                            }}>
                                <FiSave size={13} />
                                {isSaving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
