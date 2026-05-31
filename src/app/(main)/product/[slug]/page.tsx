"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    FiHeart, FiShoppingCart, FiMinus, FiPlus, FiCheckCircle,
    FiStar, FiX, FiZoomIn, FiCopy, FiShare2, FiDownload,
    FiThumbsUp, FiChevronUp, FiChevronDown, FiMessageSquare,
    FiEye, FiChevronRight, FiChevronLeft, FiSend
} from 'react-icons/fi';
import { useGetProductBySlugQuery, useGetRelatedProductsQuery, useIncrementProductStatMutation } from '@/redux/api/productApi';
import { useGetProductReviewsQuery, usePublicCreateReviewMutation, useCreateReviewMutation } from '@/redux/api/reviewApi';
import { useAppDispatch, useAppSelector } from '@/redux';
import { addToCart } from '@/redux/slices/cartSlice';
import { useCreateInquiryMutation } from '@/redux/api/inquiryApi';
import { toast } from 'react-hot-toast';
import NewProductCard, { CommentsPopup } from '@/components/shared/NewProductCard';
import {
    FaFacebookF, FaFacebookMessenger, FaWhatsapp, FaTelegramPlane,
    FaLinkedinIn, FaPinterestP, FaEnvelope, FaInstagram
} from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';

export default function ProductDetailsPage() {
    const { slug } = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state: any) => state.auth);
    const [createInquiry] = useCreateInquiryMutation();
    const [incrementStat] = useIncrementProductStatMutation();
    const viewCountedRef = useRef<string | null>(null);
    const [viewBump, setViewBump] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [activeInfoPanel, setActiveInfoPanel] = useState<'description' | 'reviews' | 'others' | null>('description');
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [shareLinkCopied, setShareLinkCopied] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [cmtText, setCmtText] = useState('');
    const [cmtRating, setCmtRating] = useState(5);
    const [cmtHoverRating, setCmtHoverRating] = useState(0);
    const [cmtSubmitting, setCmtSubmitting] = useState(false);
    const [cmtSuccess, setCmtSuccess] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    // Refs for drag — avoids stale closure in mouse event handlers
    const isDraggingRef = useRef(false);
    const hasDraggedRef = useRef(false);  // true if mouse actually moved during drag
    const dragStartRef = useRef({ x: 0, y: 0 });
    const panOffsetRef = useRef({ x: 0, y: 0 });
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showInquiryModal, setShowInquiryModal] = useState(false);
    const [inquiryName, setInquiryName] = useState('');
    const [inquiryContact, setInquiryContact] = useState('');
    const [inquiryPhone, setInquiryPhone] = useState('');
    const [inquiryMessage, setInquiryMessage] = useState('');
    const [inquirySubmitting, setInquirySubmitting] = useState(false);
    const [inquirySuccess, setInquirySuccess] = useState(false);
    const colorSwatchRef = useRef<HTMLDivElement>(null);
    const sizeSwatchRef = useRef<HTMLDivElement>(null);
    const colorSwatchRef2 = useRef<HTMLDivElement>(null);
    const detailsRef = useRef<HTMLDivElement>(null);

    // Scroll to top whenever the slug changes (page navigation)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [slug]);

    // Lock body scroll when any modal is open
    const anyModalOpen = showSharePopup || showCommentsModal || showRatingModal || isFullscreen || showDownloadModal || showInquiryModal;
    useEffect(() => {
        if (anyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [anyModalOpen]);
    const scrollList = (ref: React.RefObject<HTMLDivElement | null>, dir: 'up' | 'down') => {
        if (ref.current) {
            ref.current.scrollBy({ top: dir === 'down' ? 96 : -96, behavior: 'smooth' });
        }
    };

    const { data: productData, isLoading, isError } = useGetProductBySlugQuery(slug as string, { skip: !slug });
    const product = productData?.data;

    // Count a view once per product visit, and bump the displayed count immediately
    useEffect(() => {
        const pid = product?._id;
        if (!pid || viewCountedRef.current === pid) return;
        viewCountedRef.current = pid;
        setViewBump(1);
        incrementStat({ id: pid, field: 'viewCount' }).catch(() => {});
    }, [product?._id, incrementStat]);

    const { data: relatedData } = useGetRelatedProductsQuery(
        { id: product?._id, categoryId: product?.category?._id },
        { skip: !product?._id || !product?.category?._id }
    );
    const relatedProducts = relatedData?.data || [];

    const { data: reviewsData } = useGetProductReviewsQuery({ productId: product?._id }, { skip: !product?._id });
    const reviews = reviewsData?.data || [];
    const [publicCreateReview] = usePublicCreateReviewMutation();
    const [createReviewMutation] = useCreateReviewMutation();

    const handleCommentSubmit = async () => {
        if (!cmtText.trim() || !product?._id) return;
        setCmtSubmitting(true);
        try {
            await publicCreateReview({
                product: product._id,
                rating: cmtRating,
                comment: cmtText.trim(),
                userName: 'Anonymous'
            }).unwrap();
            setCmtText('');
            setCmtRating(5);
            setCmtSuccess(true);
            setTimeout(() => setCmtSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to submit review:', err);
        } finally {
            setCmtSubmitting(false);
        }
    };

    const cartItems = useAppSelector((state: any) => state.cart.items);

    // Build unique cart ID that includes variant info
    const getCartId = () => {
        const parts = [product?._id];
        if (selectedColor) parts.push(selectedColor);
        if (selectedSize) parts.push(selectedSize);
        return parts.join('_');
    };

    const isInCart = product ? cartItems.some((item: any) => item.id === getCartId()) : false;

    // Customer must pick the required variant options before buying.
    const validateVariantSelection = () => {
        if (colorSwatches.length > 0 && !selectedColor) {
            toast.error('Please select a color first.');
            return false;
        }
        if (sizeList.length > 0 && !selectedSize) {
            toast.error('Please select a size first.');
            return false;
        }
        return true;
    };

    const handleAddToCart = () => {
        if (!product) return;
        if (!validateVariantSelection()) return;
        const cartId = getCartId();

        if (isInCart) {
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
            return;
        }

        // Use variant's first image if available, else product thumbnail
        const variantImage = activeVariant?.images?.[0] || allImages[selectedImage] || product.thumbnail;

        dispatch(addToCart({
            id: cartId,
            productId: product._id,
            name: product.name,
            price: discountedPrice,
            mrp: activeVariant?.originalPrice || product.originalPrice || product.price,
            image: variantImage,
            category: product.category?.name || 'General',
            quantity: quantity,
            color: selectedColor || undefined,
            colorHex: activeVariant?.colorHex || undefined,
            size: selectedSize || undefined,
        }));
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    // Buy Now → add to cart (if not already) then go straight to checkout
    const handleBuyNow = () => {
        if (!product) return;
        if (!validateVariantSelection()) return;
        const cartId = getCartId();
        if (!isInCart) {
            const variantImage = activeVariant?.images?.[0] || allImages[selectedImage] || product.thumbnail;
            dispatch(addToCart({
                id: cartId,
                productId: product._id,
                name: product.name,
                price: discountedPrice,
                mrp: activeVariant?.originalPrice || product.originalPrice || product.price,
                image: variantImage,
                category: product.category?.name || 'General',
                quantity: quantity,
                color: selectedColor || undefined,
                colorHex: activeVariant?.colorHex || undefined,
                size: selectedSize || undefined,
            }));
        }
        router.push('/checkout');
    };

    const scrollColors = (direction: 'up' | 'down') => {
        if (colorSwatchRef.current) {
            const amount = direction === 'up' ? -80 : 80;
            colorSwatchRef.current.scrollBy({ top: amount, behavior: 'smooth' });
        }
    };

    const scrollDetails = (direction: 'up' | 'down') => {
        if (detailsRef.current) {
            const amount = direction === 'up' ? -150 : 150;
            detailsRef.current.scrollBy({ top: amount, behavior: 'smooth' });
        }
    };

    // Loading
    if (isLoading) {
        return (
            <div className="bg-gray-50" style={{ minHeight: '100vh' }}>
                <div className="container mx-auto px-4" style={{ padding: '2rem 1rem' }}>
                    {/* Breadcrumb skeleton */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ height: '14px', width: '50px', background: '#e5e7eb', borderRadius: '4px' }} className="animate-pulse" />
                        <div style={{ height: '14px', width: '80px', background: '#e5e7eb', borderRadius: '4px' }} className="animate-pulse" />
                        <div style={{ height: '14px', width: '120px', background: '#e5e7eb', borderRadius: '4px' }} className="animate-pulse" />
                    </div>
                    {/* Title skeleton */}
                    <div style={{ height: '28px', background: '#e5e7eb', borderRadius: '8px', width: '60%', marginBottom: '12px' }} className="animate-pulse" />
                    <div style={{ height: '16px', background: '#e5e7eb', borderRadius: '6px', width: '30%', marginBottom: '24px' }} className="animate-pulse" />
                    {/* Main content skeleton */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #eee' }}>
                        <div style={{ flex: '1 1 55%', aspectRatio: '1', background: '#f3f4f6', borderRadius: '12px' }} className="animate-pulse" />
                        <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px' }}>
                            <div style={{ height: '60px', background: '#fef3f2', borderRadius: '8px' }} className="animate-pulse" />
                            <div style={{ height: '20px', background: '#f3f4f6', borderRadius: '6px', width: '50%' }} className="animate-pulse" />
                            <div style={{ height: '80px', background: '#f3f4f6', borderRadius: '8px' }} className="animate-pulse" />
                            <div style={{ height: '80px', background: '#f3f4f6', borderRadius: '8px' }} className="animate-pulse" />
                            <div style={{ height: '40px', background: '#f3f4f6', borderRadius: '8px', marginTop: 'auto' }} className="animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error
    if (isError || !product) {
        return (
            <div className="bg-gray-50" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: '5rem 1rem', background: '#fff', borderRadius: '16px', maxWidth: '400px', margin: '0 auto', border: '1px solid #eee' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>😕</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>Product Not Found</h2>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '14px' }}>This product may have been removed or is no longer available.</p>
                    <Link href="/products" style={{ padding: '0.75rem 2rem', background: 'var(--color-primary)', color: '#fff', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>Browse Products</Link>
                </div>
            </div>
        );
    }

    // ── Variant-Aware Logic with Bi-directional Color ↔ Image Sync ──
    const baseImages = [product.thumbnail, ...(product.images || [])].filter(Boolean);
    const variants = product.variants || [];
    const hasVariants = variants.length > 0;

    // Color swatches — from variants first, then product.colors, then empty
    const colorSwatches = (() => {
        if (hasVariants) {
            const map = new Map<string, string>();
            variants.forEach((v: any) => { if (v.color) map.set(v.color, v.colorHex || v.color); });
            return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
        }
        if (product.colors?.length > 0) {
            return product.colors.map((c: string, i: number) => ({ name: c, hex: product.colorHex?.[i] || c }));
        }
        return [];
    })();

    // Size list — from variants first, then product.sizes
    const sizeList: string[] = (() => {
        if (hasVariants) {
            return [...new Set(variants.filter((v: any) => v.size).map((v: any) => v.size))];
        }
        return product.sizes?.length > 0 ? product.sizes : [];
    })();

    // ── Build Color → Images Map (key piece for bi-directional sync) ──
    const colorImageMap = (() => {
        const map: Record<string, string[]> = {};
        if (hasVariants) {
            // Collect all images from variants of same color
            variants.forEach((v: any) => {
                if (v.color && v.images?.length > 0) {
                    if (!map[v.color]) map[v.color] = [];
                    v.images.forEach((img: string) => {
                        if (!map[v.color].includes(img)) map[v.color].push(img);
                    });
                }
            });
        } else if (colorSwatches.length > 0 && baseImages.length > 0) {
            // No variants — map each color to corresponding image by index
            colorSwatches.forEach((c: any, i: number) => {
                if (i < baseImages.length) {
                    map[c.name] = [baseImages[i]];
                }
            });
        }
        return map;
    })();

    // ── Build Image → Color reverse map (for thumbnail click → color select) ──
    const imageToColorMap = (() => {
        const map: Record<string, string> = {};
        Object.entries(colorImageMap).forEach(([colorName, imgs]) => {
            imgs.forEach(img => { map[img] = colorName; });
        });
        return map;
    })();

    // Active variant — matched by selected color + size
    const activeVariant = hasVariants ? variants.find((v: any) =>
        (!selectedColor || v.color === selectedColor) &&
        (!selectedSize || v.size === selectedSize)
    ) : null;

    // Available sizes for selected color — show ALL sizes that exist for this color (regardless of stock)
    const availableSizesForColor = hasVariants && selectedColor
        ? variants.filter((v: any) => v.color === selectedColor).map((v: any) => v.size).filter(Boolean)
        : sizeList;

    // Available colors for selected size — show ALL colors that exist for this size (regardless of stock)
    const availableColorsForSize = hasVariants && selectedSize
        ? variants.filter((v: any) => v.size === selectedSize).map((v: any) => v.color).filter(Boolean)
        : colorSwatches.map((c: any) => c.name);

    // ── Display images — ALWAYS show ALL variant images + base images ──
    // Collect per-COLOR (not per-variant) to avoid duplicates from same color's different sizes
    const allImages = (() => {
        if (hasVariants) {
            const seen = new Set<string>();
            const imgs: string[] = [];
            // First add base/thumbnail
            baseImages.forEach(img => {
                if (!seen.has(img)) { seen.add(img); imgs.push(img); }
            });
            // Then add images per unique COLOR (only first variant of each color)
            const processedColors = new Set<string>();
            variants.forEach((v: any) => {
                const colorKey = v.color || `__no_color_${v.size}`;
                if (processedColors.has(colorKey)) return; // skip same color
                processedColors.add(colorKey);
                (v.images || []).forEach((img: string) => {
                    if (!seen.has(img)) { seen.add(img); imgs.push(img); }
                });
            });
            return imgs;
        }
        return baseImages;
    })();

    // Display price — variant price > product discounted price
    const discountedPrice = (() => {
        if (activeVariant) {
            const vDiscount = activeVariant.discount || 0;
            return vDiscount > 0 ? activeVariant.price - (activeVariant.price * vDiscount) / 100 : activeVariant.price;
        }
        return product.discount > 0 ? product.price - (product.price * product.discount) / 100 : product.price;
    })();

    // Display stock
    const displayStock = activeVariant ? activeVariant.stock : product.stock;

    // Build product details key-value pairs from product data
    const productDetails: { key: string; value: string }[] = [];

    if (product.sku) productDetails.push({ key: 'Model', value: product.sku });
    if (product.brand) productDetails.push({ key: 'Brand', value: product.brand.toUpperCase() });
    if (product.specifications?.length > 0) {
        product.specifications.forEach((spec: any) => {
            productDetails.push({ key: spec.key, value: spec.value });
        });
    }
    if (product.material?.length > 0) productDetails.push({ key: 'Material', value: product.material.join(', ') });
    if (product.weight > 0) productDetails.push({ key: 'Weight', value: `${product.weight}g` });
    if (product.colors?.length > 0) productDetails.push({ key: product.productType === 'multi-color' ? 'Multi Color' : 'Color', value: product.colors.join(', ') });
    if (product.sizes?.length > 0) productDetails.push({ key: 'Size', value: product.sizes.join(', ') });
    if (product.weights?.length > 0) productDetails.push({ key: 'Weight Options', value: product.weights.join(', ') });

    // Fallback: if no details exist, add basic ones
    if (productDetails.length === 0) {
        productDetails.push({ key: 'Category', value: product.category?.name || 'General' });
        productDetails.push({ key: 'Stock', value: product.stock > 0 ? `${product.stock} available` : 'Out of Stock' });
    }

    const getColorHex = (colorName: string) => {
        const namedColors: Record<string, string> = {
            red: '#FF0000', orange: '#FF8C00', yellow: '#FFD700', green: '#00C853',
            blue: '#2196F3', black: '#000000', white: '#FFFFFF', pink: '#FF69B4',
            purple: '#9C27B0', brown: '#795548', gray: '#9E9E9E', grey: '#9E9E9E',
            navy: '#001F3F', teal: '#009688', maroon: '#800000', olive: '#808000',
            cyan: '#00BCD4', lime: '#76FF03', coral: '#FF7F50', gold: '#FFD700',
            silver: '#C0C0C0', beige: '#F5F5DC', cream: '#FFFDD0', khaki: '#F0E68C',
        };
        return namedColors[colorName.toLowerCase()] || colorName;
    };

    // ── Handler: COLOR selected → find that color's FIRST image in allImages and select it ──
    const handleColorSelect = (colorName: string) => {
        if (selectedColor === colorName) {
            setSelectedColor('');
            return; // keep current image, just deselect color
        }
        setSelectedColor(colorName);
        // Reset size if current selectedSize is not available for the new color
        if (selectedSize && hasVariants) {
            const sizesForNewColor = variants.filter((v: any) => v.color === colorName).map((v: any) => v.size).filter(Boolean);
            if (!sizesForNewColor.includes(selectedSize)) {
                setSelectedSize('');
            }
        }
        // Find the first image belonging to this color in allImages
        const colorImgs = colorImageMap[colorName];
        if (colorImgs?.length > 0) {
            const firstColorImg = colorImgs[0];
            const idx = allImages.indexOf(firstColorImg);
            if (idx >= 0) setSelectedImage(idx);
        }
    };

    // ── Handler: IMAGE thumbnail clicked → auto-select matching color ──
    const handleImageSelect = (imgIdx: number) => {
        setSelectedImage(imgIdx);
        // Find which color this image belongs to and auto-select
        const imgUrl = allImages[imgIdx];
        if (imgUrl && imageToColorMap[imgUrl]) {
            setSelectedColor(imageToColorMap[imgUrl]);
        }
    };

    // Handler: when size is selected
    const handleSizeSelect = (size: string) => {
        if (selectedSize === size) {
            setSelectedSize('');
            return;
        }
        setSelectedSize(size);
    };

    return (
        <>
            <div className="bg-gray-50" style={{ minHeight: '100vh' }}>
                <div className="container mx-auto px-4">
                    {/* ── Fullscreen Image Modal ── */}
                    {isFullscreen && (
                        <div
                            style={{
                                position: 'fixed', inset: 0, zIndex: 9999,
                                background: 'rgba(0,0,0,0.95)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', padding: '1rem'
                            }}
                            onClick={() => { setIsFullscreen(false); setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => { setIsFullscreen(false); setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
                                style={{
                                    position: 'absolute', top: '1rem', right: '1rem',
                                    width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)',
                                    border: 'none', borderRadius: '50%', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', zIndex: 10
                                }}
                            >
                                <FiX size={22} />
                            </button>

                            {/* Thumbnail Strip */}
                            {allImages.length > 1 && (
                                <div className="pd-zoom-thumbs" style={{
                                    position: 'absolute', left: '11rem', top: '50%',
                                    transform: 'translateY(-50%)', display: 'flex',
                                    flexDirection: 'column', gap: '0.5rem', zIndex: 10
                                }}>
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); handleImageSelect(idx); setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
                                            style={{
                                                width: '56px', height: '56px', borderRadius: '8px',
                                                overflow: 'hidden', border: selectedImage === idx ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                                                opacity: selectedImage === idx ? 1 : 0.6,
                                                cursor: 'pointer', background: 'transparent', padding: 0,
                                                transform: selectedImage === idx ? 'scale(1.1)' : 'scale(1)',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Image + Arrows Container */}
                            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                                {/* Left Arrow — always visible, disabled at first */}
                                <button
                                    onClick={() => { if (selectedImage > 0) { setSelectedImage(prev => prev - 1); setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); } }}
                                    disabled={selectedImage === 0}
                                    style={{
                                        background: selectedImage === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)',
                                        border: 'none', borderRadius: '50%',
                                        width: '44px', height: '44px',
                                        cursor: selectedImage === 0 ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s ease', flexShrink: 0,
                                        opacity: selectedImage === 0 ? 0.3 : 1,
                                    }}
                                >
                                    <FiChevronLeft size={24} color="#fff" />
                                </button>

                                {/* Image Box — large, responsive to viewport */}
                                <div
                                    style={{ position: 'relative', width: 'min(92vh, 90vw)', height: 'min(92vh, 90vw)', flexShrink: 0, overflow: 'hidden', borderRadius: '12px' }}
                                    onMouseDown={(e) => {
                                        if (zoomLevel > 1) {
                                            e.preventDefault();
                                            isDraggingRef.current = true;
                                            hasDraggedRef.current = false;  // reset on each new press
                                            dragStartRef.current = {
                                                x: e.clientX - panOffsetRef.current.x,
                                                y: e.clientY - panOffsetRef.current.y,
                                            };
                                        }
                                    }}
                                    onMouseMove={(e) => {
                                        if (isDraggingRef.current && zoomLevel > 1) {
                                            hasDraggedRef.current = true;  // real drag happened
                                            const newOffset = {
                                                x: e.clientX - dragStartRef.current.x,
                                                y: e.clientY - dragStartRef.current.y,
                                            };
                                            panOffsetRef.current = newOffset;
                                            setPanOffset({ ...newOffset });
                                        }
                                    }}
                                    onMouseUp={() => { isDraggingRef.current = false; }}
                                    onMouseLeave={() => { isDraggingRef.current = false; }}
                                >
                                    <img
                                        src={allImages[selectedImage] || allImages[0]}
                                        alt={product.name}
                                        draggable={false}
                                        style={{
                                            width: '100%', height: '100%',
                                            objectFit: 'contain', borderRadius: '12px',
                                            transition: 'transform 0.1s ease',
                                            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                                            cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
                                            background: '#111',
                                            userSelect: 'none',
                                            transformOrigin: 'center center',
                                        }}
                                        onClick={(e) => {
                                            // Block click if a real drag just happened
                                            if (hasDraggedRef.current) {
                                                hasDraggedRef.current = false;
                                                return;
                                            }
                                            e.stopPropagation();
                                            if (zoomLevel > 1) {
                                                setZoomLevel(1);
                                                const reset = { x: 0, y: 0 };
                                                panOffsetRef.current = reset;
                                                setPanOffset(reset);
                                            } else {
                                                setZoomLevel(1.8);
                                            }
                                        }}
                                        onWheel={(e) => {
                                            e.stopPropagation();
                                            setZoomLevel(prev => {
                                                const next = prev + (e.deltaY < 0 ? 0.15 : -0.15);
                                                const clamped = Math.max(1, Math.min(2.5, next));
                                                if (clamped <= 1) {
                                                    const reset = { x: 0, y: 0 };
                                                    panOffsetRef.current = reset;
                                                    setPanOffset(reset);
                                                }
                                                return clamped;
                                            });
                                        }}
                                    />
                                    {/* Counter — always visible inside image */}
                                    <div style={{
                                        position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                                        color: '#fff', fontSize: '13px', fontWeight: 600, letterSpacing: '1px',
                                        background: 'rgba(0,0,0,0.55)', padding: '4px 14px', borderRadius: '20px',
                                        pointerEvents: 'none', whiteSpace: 'nowrap',
                                    }}>
                                        {selectedImage + 1} / {allImages.length}
                                    </div>
                                </div>

                                {/* Right Arrow — always visible, disabled at last */}
                                <button
                                    onClick={() => { if (selectedImage < allImages.length - 1) { setSelectedImage(prev => prev + 1); setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); } }}
                                    disabled={selectedImage === allImages.length - 1}
                                    style={{
                                        background: selectedImage === allImages.length - 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)',
                                        border: 'none', borderRadius: '50%',
                                        width: '44px', height: '44px',
                                        cursor: selectedImage === allImages.length - 1 ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s ease', flexShrink: 0,
                                        opacity: selectedImage === allImages.length - 1 ? 0.3 : 1,
                                    }}
                                >
                                    <FiChevronRight size={24} color="#fff" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══ BREADCRUMB + PRODUCT TITLE BAR ═══ */}
                    <div className="pd-title-bar" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', marginTop: '16px', padding: '16px 20px 12px' }}>
                            {/* Breadcrumb */}
                            <div className="pd-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#999', marginBottom: '10px', flexWrap: 'nowrap', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                <a href="/" style={{ color: '#888', textDecoration: 'none', flexShrink: 0 }}>Home</a>
                                <span style={{ flexShrink: 0 }}>/</span>
                                <a href="/products" style={{ color: '#888', textDecoration: 'none', flexShrink: 0 }}>Products</a>
                                {product.category?.name && (
                                    <>
                                        <span style={{ flexShrink: 0 }}>/</span>
                                        <a href={`/products?category=${product.category._id}`} style={{ color: '#888', textDecoration: 'none', flexShrink: 0 }}>{product.category.name}</a>
                                    </>
                                )}
                                <span style={{ flexShrink: 0 }}>/</span>
                                <span style={{ color: '#555', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{product.name?.slice(0, 30)}...</span>
                            </div>

                            {/* Product Name */}
                            <h1 style={{
                                fontSize: '22px', fontWeight: 700, color: '#111',
                                margin: 0, lineHeight: 1.4,
                            }}>
                                {product.name}
                            </h1>

                            {/* Tagline */}
                            {product.tagline && (
                                <p style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 500, margin: '4px 0 0' }}>{product.tagline}</p>
                            )}

                            {/* Stats Row */}
                            <div className="pd-stats-row" style={{
                                display: 'flex', alignItems: 'center', gap: '20px',
                                flexWrap: 'wrap', fontSize: '13px', color: '#888',
                                marginTop: '12px', paddingBottom: '8px',
                            }}>
                                {/* Rating */}
                                <button
                                    onClick={() => setShowRatingModal(true)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#888', fontSize: '13px', padding: 0,
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '1px' }}>
                                        {[1,2,3,4,5].map(s => <FiStar key={s} size={13} style={{ color: '#f59e0b', fill: s <= Math.round(product.rating || 0) ? '#f59e0b' : 'none' }} />)}
                                    </div>
                                    <span style={{ fontWeight: 600, color: '#333' }}>{product.rating?.toFixed(1) || '0.0'}</span>
                                    <span>({product.reviewCount || 0})</span>
                                </button>

                                <span style={{ color: '#ddd' }}>|</span>

                                {/* Sold */}
                                <span>{product.soldCount || product.totalSold || 0} sold</span>

                                <span style={{ color: '#ddd' }}>|</span>

                                {/* Views */}
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FiEye size={13} /> {(product.viewCount || 0) + viewBump} views
                                </span>

                                {/* Like */}
                                <button
                                    onClick={() => {
                                        if (!isLiked && product?._id) {
                                            incrementStat({ id: product._id, field: 'likeCount' });
                                            setIsLiked(true);
                                        }
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: isLiked ? '#ef4444' : '#888', fontSize: '13px', padding: 0, marginLeft: 'auto',
                                    }}
                                >
                                    <FiHeart size={14} style={{ fill: isLiked ? '#ef4444' : 'none' }} />
                                    <span>{product.likeCount || 0}</span>
                                </button>

                                {/* Share */}
                                <button
                                    onClick={() => { setShowSharePopup(true); if (product?._id) incrementStat({ id: product._id, field: 'shareCount' }); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#888', fontSize: '13px', padding: 0,
                                    }}
                                >
                                    <FiShare2 size={14} />
                                    <span>Share</span>
                                </button>

                                {/* Copy Link */}
                                <button
                                    onClick={() => {
                                        if (typeof window !== 'undefined') {
                                            navigator.clipboard.writeText(window.location.href);
                                            setLinkCopied(true);
                                            setTimeout(() => setLinkCopied(false), 2000);
                                        }
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: linkCopied ? 'var(--color-primary)' : '#888', fontSize: '13px', padding: 0,
                                    }}
                                >
                                    <FiCopy size={13} />
                                    <span>{linkCopied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                    </div>

                    {/* ═══ MAIN CONTENT AREA ═══ */}
                    <div style={{ paddingTop: '12px' }}>
                        <div className="pd-main-flex" style={{
                            display: 'flex', gap: 0,
                            alignItems: 'stretch',
                            background: '#fff',
                            borderRadius: '12px',
                            border: '1px solid #eee',
                            overflow: 'hidden',
                            height: 'calc(clamp(300px, 32vw, 520px) + 60px)',
                        }}>

                            {/* ═══ LEFT SECTION: Color Swatches + Product Image + Action Bar ═══ */}
                            <div className="pd-left-section" style={{
                                display: 'flex', flexDirection: 'column', flex: '0 0 50%', maxWidth: '50%',
                                minWidth: '320px',
                                paddingRight: '16px',
                                overflow: 'visible',
                            }}>
                                {/* Image area row */}
                                <div className="pd-image-area-row" style={{ display: 'flex', height: 'clamp(300px, 32vw, 480px)', overflow: 'visible' }}>
                                    <div className="pd-thumb-col" style={{
                                        width: '82px', display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', padding: '8px 0', marginLeft: '4px',
                                        flexShrink: 0, gap: '4px',
                                    }}>
                                        {/* Label */}
                                        <span style={{ fontSize: '11px', fontWeight: 400, color: '#555', textTransform: 'capitalize', letterSpacing: '0.5px' }}>Image</span>

                                        {/* Image Thumbnails */}
                                        <div
                                            ref={colorSwatchRef}
                                            style={{
                                                display: 'flex', flexDirection: 'column', gap: '8px',
                                                overflow: 'hidden', maxHeight: '580px', flex: 1,
                                            }}
                                            className="no-scrollbar"
                                        >
                                            {allImages.map((img: string, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleImageSelect(idx)}
                                                    style={{
                                                        width: '75px', height: '75px', flexShrink: 0,
                                                        border: selectedImage === idx
                                                            ? '2px solid var(--color-primary)'
                                                            : '2px solid #e0e0e0',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        overflow: 'hidden',
                                                        padding: 0, background: '#f5f5f5',
                                                        boxShadow: selectedImage === idx ? '0 0 0 2px rgba(11,66,34,0.2)' : 'none',
                                                    }}
                                                >
                                                    <img src={img} alt={`Product ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </button>
                                            ))}
                                        </div>

                                        {/* Up & Down Arrows */}
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button onClick={() => scrollList(colorSwatchRef, 'up')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiChevronUp size={18} />
                                            </button>
                                            <button onClick={() => scrollList(colorSwatchRef, 'down')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiChevronDown size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Image Wrapper — fills remaining flex space */}
                                    <div className="pd-image-wrapper" style={{
                                        position: 'relative', flex: 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        padding: '8px',
                                    }}>
                                        {/* Left Arrow — outside image, simple negative offset */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); if (selectedImage > 0) { setSelectedImage(prev => prev - 1); setZoomLevel(1); } }}
                                            style={{
                                                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'rgba(255,255,255,0.95)', border: '1px solid #ddd', borderRadius: '50%',
                                                width: '32px', height: '32px', zIndex: 5,
                                                cursor: selectedImage === 0 ? 'not-allowed' : 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'all 0.2s ease',
                                                opacity: selectedImage === 0 ? 0.25 : 1,
                                            }}
                                            onMouseEnter={(e) => { if (selectedImage > 0) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)'; } }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'; }}
                                        >
                                            <FiChevronLeft size={18} color="#333" />
                                        </button>

                                        {/* Right Arrow — outside image, simple positive offset */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); if (selectedImage < allImages.length - 1) { setSelectedImage(prev => prev + 1); setZoomLevel(1); } }}
                                            style={{
                                                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'rgba(255,255,255,0.95)', border: '1px solid #ddd', borderRadius: '50%',
                                                width: '32px', height: '32px', zIndex: 5,
                                                cursor: selectedImage >= allImages.length - 1 ? 'not-allowed' : 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'all 0.2s ease',
                                                opacity: selectedImage >= allImages.length - 1 ? 0.25 : 1,
                                            }}
                                            onMouseEnter={(e) => { if (selectedImage < allImages.length - 1) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)'; } }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'; }}
                                        >
                                            <FiChevronRight size={18} color="#333" />
                                        </button>

                                        {/* Actual image — square gray box centered */}
                                        <div
                                            className="pd-main-image-box"
                                            style={{
                                                height: '100%', aspectRatio: '1 / 1',
                                                background: '#f5f5f5', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', position: 'relative',
                                                overflow: 'hidden',
                                            }}
                                            onClick={() => setIsFullscreen(true)}
                                        >
                                            <img
                                                src={allImages[selectedImage] || allImages[0]}
                                                alt={product.name}
                                                style={{
                                                    width: '100%', height: '100%',
                                                    objectFit: 'cover', transition: 'transform 0.3s ease',
                                                }}
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600/f3f4f6/9ca3af?text=No+Image'; }}
                                            />

                                            {/* Zoom Indicator */}
                                            <div style={{
                                                position: 'absolute', bottom: '12px', right: '12px',
                                                background: 'var(--color-primary)', borderRadius: '50%',
                                                padding: '8px', color: '#fff', opacity: 0,
                                                transition: 'opacity 0.3s ease',
                                            }} className="zoom-indicator">
                                                <FiZoomIn size={18} />
                                            </div>

                                            {/* Discount Badge */}
                                            {product.discount > 0 && (
                                                <div className="discount-badge" style={{
                                                    position: 'absolute', top: '12px', left: '12px',
                                                    background: 'var(--color-primary)', color: '#fff', fontSize: '11px',
                                                    fontWeight: 700, padding: '4px 10px', borderRadius: '9999px',
                                                    zIndex: 2, opacity: 0, transition: 'opacity 0.3s ease'
                                                }}>
                                                    -{product.discount}% Off
                                                </div>
                                            )}

                                            {/* Low Stock Badge */}
                                            {product.stock <= 5 && product.stock > 0 && (
                                                <div style={{
                                                    position: 'absolute', top: '12px', right: '12px',
                                                    background: '#f59e0b', color: '#fff', fontSize: '11px',
                                                    fontWeight: 700, padding: '4px 10px', borderRadius: '9999px',
                                                    zIndex: 2
                                                }} className="animate-pulse">
                                                    Only {product.stock} left!
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>{/* end image area row */}
                            </div>

                            {/* ═══ RIGHT SECTION: Price + Product Details ═══ */}
                            <div className="pd-right-section" style={{
                                flex: '0 0 50%', maxWidth: '50%',
                                paddingLeft: '0',
                                display: 'flex', flexDirection: 'column',
                                position: 'relative',
                                borderLeft: '1px solid #f0f0f0',
                            }}>

                                {/* Scrollable Content */}
                                <div
                                    ref={detailsRef}
                                    style={{
                                        flex: 1, overflowY: 'auto', padding: '8px 20px',
                                        paddingRight: '20px',
                                    }}
                                    className="no-scrollbar pd-right-scroll"
                                >
                                    {/* Price Section */}
                                    <div style={{ marginBottom: '18px', padding: '16px 20px', background: 'linear-gradient(135deg, #fafafa, #f5f5f5)', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '30px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.5px' }}>
                                                ৳{discountedPrice.toLocaleString()}
                                            </span>
                                            {product.originalPrice && product.originalPrice > discountedPrice && (
                                                <span style={{ fontSize: '16px', color: '#bbb', textDecoration: 'line-through', fontWeight: 400 }}>
                                                    ৳{product.originalPrice.toLocaleString()}
                                                </span>
                                            )}
                                            {product.discount > 0 && (
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #e74c3c, #c0392b)', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.3px' }}>
                                                    -{product.discount}% OFF
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stock & SKU */}
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                                            background: displayStock > 5 ? 'var(--color-primary-lightest)' : displayStock > 0 ? '#fffbeb' : '#fef2f2',
                                            color: displayStock > 5 ? 'var(--color-primary)' : displayStock > 0 ? '#d97706' : '#dc2626',
                                            border: `1px solid ${displayStock > 5 ? 'var(--color-primary-border)' : displayStock > 0 ? '#fde68a' : '#fecaca'}`,
                                        }}>
                                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'currentColor' }} />
                                            {displayStock > 5 ? 'In Stock' : displayStock > 0 ? `Only ${displayStock} left` : 'Out of Stock'}
                                        </div>
                                        {product.sku && (
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: '#f3f4f6', color: '#555' }}>
                                                SKU: {product.sku}
                                            </div>
                                        )}
                                    </div>


                                    {/* ── Color Selector (compact inline) ── */}
                                    {colorSwatches.length > 0 && (
                                        <div style={{ marginBottom: '14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>{product.productType === 'multi-color' ? 'Multi Color' : 'Color'}:</span>
                                                {selectedColor && <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>{selectedColor}</span>}
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {colorSwatches.map((color: any, idx: number) => {
                                                    const isAvailable = availableColorsForSize.includes(color.name);
                                                    const isSelected = selectedColor === color.name;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleColorSelect(color.name)}
                                                            title={color.name}
                                                            style={{
                                                                width: '30px', height: '30px',
                                                                background: getColorHex(color.hex || color.name),
                                                                border: isSelected ? '2.5px solid var(--color-primary)' : !isAvailable ? '2px solid #ddd' : '2px solid #e0e0e0',
                                                                borderRadius: '50%',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: isSelected ? '0 0 0 2px rgba(11,66,34,0.2)' : 'none',
                                                                opacity: !isAvailable ? 0.5 : 1,
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                padding: 0,
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {!isAvailable && (
                                                                <div style={{
                                                                    position: 'absolute', inset: 0,
                                                                    background: 'linear-gradient(to top right, transparent calc(50% - 1px), rgba(180,180,180,0.7) calc(50% - 1px), rgba(180,180,180,0.7) calc(50% + 1px), transparent calc(50% + 1px))',
                                                                    pointerEvents: 'none',
                                                                }} />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Size Selector (compact inline) ── */}
                                    {sizeList.length > 0 && (
                                        <div style={{ marginBottom: '14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Size:</span>
                                                {selectedSize && <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>{selectedSize}</span>}
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {sizeList.map((size: string, idx: number) => {
                                                    const isAvailable = availableSizesForColor.includes(size);
                                                    const isSelected = selectedSize === size;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => isAvailable && handleSizeSelect(size)}
                                                            title={!isAvailable ? `${size} — not available` : size}
                                                            style={{
                                                                minWidth: '36px', height: '32px', flexShrink: 0,
                                                                padding: '0 10px',
                                                                background: isSelected ? 'var(--color-primary)' : !isAvailable ? '#f3f4f6' : '#fff',
                                                                color: isSelected ? '#fff' : !isAvailable ? '#ccc' : '#333',
                                                                border: isSelected ? '2px solid var(--color-primary)' : !isAvailable ? '1.5px solid #e8e8e8' : '1.5px solid #e0e0e0',
                                                                borderRadius: '6px',
                                                                cursor: !isAvailable ? 'not-allowed' : 'pointer',
                                                                fontWeight: 700, fontSize: '12px',
                                                                transition: 'all 0.2s ease',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                boxShadow: isSelected ? '0 0 0 2px rgba(11,66,34,0.2)' : 'none',
                                                                opacity: !isAvailable ? 0.5 : 1,
                                                                textDecoration: !isAvailable ? 'line-through' : 'none',
                                                            }}
                                                        >
                                                            {size}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Specifications Table */}
                                    {productDetails.length > 0 && (
                                        <div style={{ marginBottom: '18px' }}>
                                            <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ width: '3px', height: '14px', background: 'var(--color-primary)', borderRadius: '2px', display: 'inline-block' }} />
                                                Specifications
                                            </h4>
                                            <div style={{ border: '1px solid #eaeaea', borderRadius: '10px', overflow: 'hidden' }}>
                                                {productDetails.map((d, i) => (
                                                    <div key={i} style={{ display: 'flex', fontSize: '13px', borderBottom: i < productDetails.length - 1 ? '1px solid #f3f3f3' : 'none' }}>
                                                        <span style={{ flex: '0 0 38%', padding: '9px 14px', background: '#f8f9fa', fontWeight: 600, color: '#555', borderRight: '1px solid #f0f0f0' }}>{d.key}</span>
                                                        <span style={{ flex: 1, padding: '9px 14px', color: '#333' }}>{d.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Short Description */}
                                    <div style={{ marginBottom: '18px' }}>
                                        <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ width: '3px', height: '14px', background: 'var(--color-primary)', borderRadius: '2px', display: 'inline-block' }} />
                                            Short Description
                                        </h4>
                                        {product.description && (
                                            <div
                                                style={{ fontSize: '13px', color: '#555', lineHeight: 1.8 }}
                                                dangerouslySetInnerHTML={{ __html: product.description }}
                                            />
                                        )}
                                    </div>

                                    {/* ═══ QUANTITY + ADD TO CART + BUY NOW ═══ */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        marginBottom: '8px', position: 'sticky', bottom: 0,
                                        background: 'linear-gradient(to top, #fff 80%, transparent)', padding: '14px 0 6px',
                                    }}>
                                        {/* Quantity */}
                                        <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '34px', height: '40px', background: '#f9fafb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
                                                <FiMinus size={14} />
                                            </button>
                                            <span style={{ width: '36px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#111' }}>{quantity}</span>
                                            <button onClick={() => setQuantity(quantity + 1)} style={{ width: '34px', height: '40px', background: '#f9fafb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
                                                <FiPlus size={14} />
                                            </button>
                                        </div>
                                        {/* Add to Cart — allowed even when out of stock (sourcing model) */}
                                        <button
                                            onClick={handleAddToCart}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                background: '#fff', border: '2px solid var(--color-primary)', color: 'var(--color-primary)',
                                                fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                                                padding: '10px 12px', letterSpacing: '0.3px',
                                                textTransform: 'uppercase', whiteSpace: 'nowrap', flex: 1,
                                                borderRadius: '10px', transition: 'all 0.2s ease',
                                                height: '40px',
                                            }}
                                        >
                                            <FiShoppingCart size={14} />
                                            {isInCart ? '✓ ADDED' : addedToCart ? 'ADDED!' : 'ADD TO CART'}
                                        </button>
                                        {/* Buy Now — allowed even when out of stock (sourcing model) */}
                                        <button
                                            onClick={handleBuyNow}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', border: 'none', color: '#fff',
                                                fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                                                padding: '10px 12px', letterSpacing: '0.3px',
                                                textTransform: 'uppercase', whiteSpace: 'nowrap', flex: 1,
                                                borderRadius: '10px', transition: 'all 0.2s ease',
                                                height: '40px',
                                                boxShadow: '0 2px 8px rgba(11,66,34,0.25)',
                                            }}
                                        >
                                            BUY NOW
                                        </button>
                                    </div>
                                </div>


                            </div>

                        </div>
                    </div>

                    {/* ═══ DESCRIPTION / REVIEWS / OTHERS ═══ */}
                    <div style={{ marginTop: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
                        <div className="pd-info-bar" style={{ display: 'flex', alignItems: 'center', height: '46px', borderBottom: '1px solid #f0f0f0' }}>
                            {([
                                { key: 'description' as const, label: '📝 Description' },
                                { key: 'reviews' as const, label: `⭐ Rating & Review (${reviews.length})` },
                                { key: 'others' as const, label: 'ℹ️ Others Information' },
                            ]).map((tab, idx) => (
                                <button key={tab.key} onClick={() => setActiveInfoPanel(tab.key)} style={{
                                    background: activeInfoPanel === tab.key ? 'var(--color-primary-lightest)' : 'transparent',
                                    border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                                    color: activeInfoPanel === tab.key ? 'var(--color-primary)' : '#666',
                                    flex: 1, height: '100%', transition: 'all 0.2s ease',
                                    borderRight: idx < 2 ? '1px solid #f0f0f0' : 'none',
                                    borderBottom: activeInfoPanel === tab.key ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                }}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="pd-info-content" style={{ padding: '20px 24px', minHeight: '80px' }}>
                            {activeInfoPanel === 'description' && (
                                <div>
                                    {product.description ? (
                                        <div style={{ fontSize: '14px', color: '#444', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: product.description }} />
                                    ) : (
                                        <p style={{ fontSize: '13px', color: '#888' }}>No description available.</p>
                                    )}
                                </div>
                            )}
                            {activeInfoPanel === 'reviews' && (
                                <div>
                                    {/* ── Write Review Form ── */}
                                    <div style={{ marginBottom: '24px', padding: '20px', background: 'var(--color-primary-surface)', borderRadius: '12px', border: '1px solid var(--color-primary-light)' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            ✍️ Write a Review
                                        </h4>
                                        {isAuthenticated ? (
                                            <div>
                                                <div style={{ marginBottom: '12px' }}>
                                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#666', display: 'block', marginBottom: '6px' }}>Your Rating</label>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {[1,2,3,4,5].map(star => (
                                                            <button key={star} type="button" onClick={() => setCmtRating(star)} onMouseEnter={() => setCmtHoverRating(star)} onMouseLeave={() => setCmtHoverRating(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                                                                <FiStar size={24} style={{ color: star <= (cmtHoverRating || cmtRating) ? '#F59E0B' : '#ddd', fill: star <= (cmtHoverRating || cmtRating) ? '#F59E0B' : 'none', transition: 'all 0.15s' }} />
                                                            </button>
                                                        ))}
                                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B', marginLeft: '8px', alignSelf: 'center' }}>{cmtRating}/5</span>
                                                    </div>
                                                </div>
                                                <textarea value={cmtText} onChange={(e) => setCmtText(e.target.value)} placeholder="Share your experience with this product..." rows={3} style={{ width: '100%', padding: '12px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none', resize: 'vertical', background: '#fff', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                                                    <span style={{ fontSize: '11px', color: '#999' }}>{cmtSuccess ? '✅ Review submitted successfully!' : 'Your review will be visible immediately'}</span>
                                                    <button onClick={async () => { if (!cmtText.trim()) return; setCmtSubmitting(true); try { await createReviewMutation({ product: product._id, rating: cmtRating, comment: cmtText.trim() }).unwrap(); setCmtText(''); setCmtRating(5); setCmtSuccess(true); setTimeout(() => setCmtSuccess(false), 3000); } catch (err: any) { alert(err?.data?.message || 'Failed to submit review'); } setCmtSubmitting(false); }} disabled={cmtSubmitting || !cmtText.trim()} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: cmtSubmitting || !cmtText.trim() ? '#ccc' : 'var(--color-primary)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: cmtSubmitting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                                                        <FiSend size={14} />
                                                        {cmtSubmitting ? 'Submitting...' : 'Submit Review'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                                <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>Please login to write a review</p>
                                                <button onClick={() => router.push('/login')} style={{ padding: '8px 28px', borderRadius: '8px', border: '2px solid var(--color-primary)', background: 'transparent', color: 'var(--color-primary)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-primary)'; }}>
                                                    Login to Review
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {reviews.length > 0 && (() => {
                                        const avg = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length;
                                        return (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px 20px', background: '#f8f9fa', borderRadius: '10px' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{avg.toFixed(1)}</div>
                                                    <div style={{ display: 'flex', gap: '2px', marginTop: '6px', justifyContent: 'center' }}>
                                                        {[1,2,3,4,5].map(s => (
                                                            <FiStar key={s} size={14} style={{ color: s <= Math.round(avg) ? '#F59E0B' : '#ddd', fill: s <= Math.round(avg) ? '#F59E0B' : 'none' }} />
                                                        ))}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>{reviews.length} review{reviews.length > 1 ? 's' : ''}</div>
                                                </div>
                                                <div style={{ width: '1px', height: '50px', background: '#e5e7eb' }} />
                                                <div style={{ flex: 1 }}>
                                                    {[5,4,3,2,1].map(star => {
                                                        const count = reviews.filter((r: any) => r.rating === star).length;
                                                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                                        return (
                                                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                                                                <span style={{ fontSize: '11px', color: '#888', width: '12px' }}>{star}</span>
                                                                <FiStar size={11} style={{ color: '#F59E0B', fill: '#F59E0B', flexShrink: 0 }} />
                                                                <div style={{ flex: 1, height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                                                                    <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B', borderRadius: '3px', transition: 'width 0.3s' }} />
                                                                </div>
                                                                <span style={{ fontSize: '11px', color: '#aaa', width: '24px', textAlign: 'right' }}>{count}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Review List */}
                                    {reviews.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                            {reviews.map((r: any, i: number) => (
                                                <div key={i} style={{ padding: '14px 16px', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f0' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                                                                {(r.userName || r.user?.firstName || 'A').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#333' }}>{r.userName || `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim() || 'Anonymous'}</span>
                                                                <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                                                                    {[1,2,3,4,5].map(s => (
                                                                        <FiStar key={s} size={11} style={{ color: s <= r.rating ? '#F59E0B' : '#ddd', fill: s <= r.rating ? '#F59E0B' : 'none' }} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span style={{ fontSize: '11px', color: '#aaa' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                                                    </div>
                                                    {r.comment && <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, margin: 0 }}>{r.comment}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                            <FiStar size={32} style={{ color: '#ddd', margin: '0 auto 10px' }} />
                                            <p style={{ fontSize: '14px', color: '#888', fontWeight: 500 }}>No reviews yet</p>
                                            <p style={{ fontSize: '12px', color: '#aaa' }}>Be the first to review this product</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeInfoPanel === 'others' && (
                                <div>
                                    <div className="pd-others-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        {product.category?.name && (
                                            <div style={{ padding: '12px 16px', background: '#f8f9fa', borderRadius: '8px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</span>
                                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#333', margin: '4px 0 0' }}>{product.category.name}</p>
                                            </div>
                                        )}
                                        {product.brand && (
                                            <div style={{ padding: '12px 16px', background: '#f8f9fa', borderRadius: '8px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Brand</span>
                                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#333', margin: '4px 0 0' }}>{product.brand}</p>
                                            </div>
                                        )}
                                        {product.sku && (
                                            <div style={{ padding: '12px 16px', background: '#f8f9fa', borderRadius: '8px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SKU</span>
                                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#333', margin: '4px 0 0' }}>{product.sku}</p>
                                            </div>
                                        )}
                                        {product.origin && (
                                            <div style={{ padding: '12px 16px', background: '#f8f9fa', borderRadius: '8px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Origin</span>
                                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#333', margin: '4px 0 0' }}>{product.origin}</p>
                                            </div>
                                        )}
                                        {product.material && (
                                            <div style={{ padding: '12px 16px', background: '#f8f9fa', borderRadius: '8px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Material</span>
                                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#333', margin: '4px 0 0' }}>{product.material}</p>
                                            </div>
                                        )}
                                        {product.weight && (
                                            <div style={{ padding: '12px 16px', background: '#f8f9fa', borderRadius: '8px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Weight</span>
                                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#333', margin: '4px 0 0' }}>{product.weight}</p>
                                            </div>
                                        )}
                                        <div style={{ padding: '12px 16px', background: '#f8f9fa', borderRadius: '8px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sold</span>
                                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#333', margin: '4px 0 0' }}>{product.totalSold || 0} pcs</p>
                                        </div>
                                        <div style={{ padding: '12px 16px', background: '#f8f9fa', borderRadius: '8px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</span>
                                            <p style={{ fontSize: '14px', fontWeight: 600, color: product.stock > 0 ? 'var(--color-primary)' : '#dc2626', margin: '4px 0 0' }}>{product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}</p>
                                        </div>
                                    </div>
                                    {product.tags?.length > 0 && (
                                        <div style={{ marginTop: '16px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tags</span>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                                {product.tags.map((tag: string, i: number) => (
                                                    <span key={i} style={{ fontSize: '12px', padding: '4px 12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '20px', fontWeight: 500 }}>{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>



                    {/* ═══ Related Products Section ═══ */}
                    {relatedProducts.length > 0 && (
                        <div style={{ marginTop: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #eee', padding: '20px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div>
                                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Related Products</h2>
                                        {product?.category?.name && (
                                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
                                                More from <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{product.category.name}</span>
                                            </p>
                                        )}
                                    </div>
                                    {product?.category?._id && (
                                        <Link
                                            href={`/products?category=${product.category._id}`}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)',
                                                background: 'var(--color-primary-lightest)', padding: '0.5rem 1rem',
                                                borderRadius: '9999px', textDecoration: 'none',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            View All <FiChevronRight size={16} />
                                        </Link>
                                    )}
                                </div>
                                <div className="pd-related-grid grid grid-cols-4 gap-2 overflow-hidden">
                                    {relatedProducts.slice(0, 4).map((item: any) => (
                                        <NewProductCard
                                            key={item._id}
                                            product={{
                                                id: item._id,
                                                slug: item.slug,
                                                name: item.name,
                                                image: item.thumbnail,
                                                price: item.discount > 0 ? item.price - (item.price * item.discount) / 100 : item.price,
                                                originalPrice: item.originalPrice,
                                                mrp: item.originalPrice || item.price,
                                                discount: item.discount,
                                                rating: item.rating,
                                                reviews: item.reviewCount,
                                                categoryName: item.category?.name || product?.category?.name,
                                                priceType: item.priceType,
                                                likeCount: item.likeCount || 0,
                                                commentCount: item.commentCount || 0,
                                                shareCount: item.shareCount || 0,
                                                viewCount: item.viewCount || 0,
                                                reviewCount: item.reviewCount || 0,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}


                    {/* ═══ Rating Popup Modal ═══ */}
                    {showRatingModal && (
                        <div
                            style={{
                                position: 'fixed', inset: 0, zIndex: 9999,
                                background: 'rgba(0,0,0,0.5)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', padding: '1rem'
                            }}
                            onClick={() => setShowRatingModal(false)}
                        >
                            <div
                                style={{
                                    background: '#fff', borderRadius: '12px', maxWidth: '500px',
                                    width: '100%', maxHeight: '80vh', overflowY: 'auto',
                                    padding: '24px', position: 'relative',
                                    animation: 'fadeIn 0.2s ease-out',
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={() => setShowRatingModal(false)}
                                    style={{
                                        position: 'absolute', top: '12px', right: '12px',
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: '#f3f4f6', border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <FiX size={16} />
                                </button>

                                {/* Header */}
                                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', color: '#1a1a1a' }}>
                                    Ratings & Reviews
                                </h3>

                                {/* Overall Rating */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '36px', fontWeight: 800, color: '#1a1a1a' }}>
                                            {product.rating?.toFixed(1) || '0.0'}
                                        </div>
                                        <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '4px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <FiStar key={star} size={14} style={{
                                                    color: '#f59e0b',
                                                    fill: star <= Math.round(product.rating || 0) ? '#f59e0b' : 'none'
                                                }} />
                                            ))}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                                            {product.reviewCount || 0} ratings
                                        </div>
                                    </div>

                                    {/* Star Breakdown */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = product.ratingBreakdown?.[star] || 0;
                                            const total = product.reviewCount || 1;
                                            const percentage = Math.round((count / total) * 100);
                                            return (
                                                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                                    <span style={{ width: '12px', fontWeight: 600, color: '#555' }}>{star}</span>
                                                    <FiStar size={10} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                                                    <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${percentage}%`, height: '100%', background: '#f59e0b', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                                                    </div>
                                                    <span style={{ width: '30px', textAlign: 'right', color: '#888', fontSize: '11px' }}>{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Reviews List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {(product.reviews && product.reviews.length > 0) ? (
                                        product.reviews.map((review: any, idx: number) => (
                                            <div key={idx} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <FiStar key={star} size={10} style={{
                                                            color: '#f59e0b',
                                                            fill: star <= (review.rating || 0) ? '#f59e0b' : 'none'
                                                        }} />
                                                    ))}
                                                </div>
                                                {review.comment && (
                                                    <p style={{ fontSize: '12px', color: '#555', margin: 0, lineHeight: 1.6 }}>
                                                        {review.comment}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: '13px' }}>
                                            No reviews yet. Be the first to review this product!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hover styles for zoom indicator */}
                    <style>{`
                div:hover > .zoom-indicator {
                    opacity: 1 !important;
                }
                div:hover > .discount-badge {
                    opacity: 1 !important;
                }

                /* ═══ MOBILE RESPONSIVE ═══ */
                @media (max-width: 767px) {

                    /* Main flex → column, remove fixed height */
                    .pd-main-flex {
                        flex-direction: column !important;
                        height: auto !important;
                        overflow: visible !important;
                    }

                    /* Left section → full width, wrap so inner cols reorder */
                    .pd-left-section {
                        flex: 0 0 100% !important; max-width: 100% !important;
                        min-width: unset !important; height: auto !important;
                        padding-right: 0 !important;
                        flex-wrap: wrap !important; align-content: flex-start !important;
                    }

                    /* ── Image area row → column on mobile, auto height ── */
                    .pd-image-area-row {
                        flex-direction: column !important;
                        height: auto !important;
                    }

                    /* ── Image wrapper → full width, ORDER 1 ── */
                    .pd-image-wrapper {
                        width: 100% !important; flex: unset !important;
                        order: 1 !important; padding: 4px !important;
                    }
                    .pd-main-image-box {
                        width: 100% !important; height: auto !important;
                        aspect-ratio: 1 / 1 !important;
                    }

                    /* ── Thumbnail column → horizontal strip, ORDER 2 ── */
                    .pd-thumb-col {
                        width: 100% !important; order: 2 !important;
                        flex-direction: row !important; flex-wrap: nowrap !important;
                        overflow-x: auto !important; overflow-y: hidden !important;
                        gap: 6px !important; padding: 6px 8px !important;
                        margin-left: 0 !important; align-items: center !important;
                    }
                    .pd-thumb-col > span { display: none !important; }
                    .pd-thumb-col > div:last-child { display: none !important; }
                    .pd-thumb-col > div:first-of-type {
                        flex-direction: row !important; flex-wrap: nowrap !important;
                        max-height: unset !important; overflow: visible !important; gap: 6px !important;
                    }
                    .pd-thumb-col button { width: 56px !important; height: 56px !important; flex-shrink: 0 !important; }

                    /* ── Size → horizontal row, ORDER 3 ── */
                    .pd-size-col {
                        width: 100% !important; order: 3 !important;
                        flex-direction: row !important; flex-wrap: wrap !important;
                        align-items: center !important; gap: 8px !important; padding: 6px 0 !important;
                    }
                    .pd-size-col > div:first-of-type {
                        flex-direction: row !important; flex-wrap: wrap !important;
                        max-height: unset !important; overflow: visible !important; gap: 6px !important;
                    }
                    .pd-size-col > div:last-child { display: none !important; }
                    .pd-size-col button { width: 40px !important; height: 40px !important; font-size: 11px !important; }

                    /* ── Color → horizontal row, ORDER 4 ── */
                    .pd-color-col {
                        width: 100% !important; order: 4 !important;
                        flex-direction: row !important; flex-wrap: wrap !important;
                        align-items: center !important; gap: 8px !important; padding: 6px 0 !important;
                    }
                    .pd-color-col > div:first-of-type {
                        flex-direction: row !important; flex-wrap: wrap !important;
                        max-height: unset !important; overflow: visible !important; gap: 6px !important;
                    }
                    .pd-color-col > div:last-child { display: none !important; }
                    .pd-color-col button { width: 36px !important; height: 36px !important; }

                    /* Right section → full width, auto height, LAST on mobile */
                    .pd-right-section {
                        flex: 0 0 100% !important; max-width: 100% !important;
                        height: auto !important; border-left: none !important;
                        border-top: 1px solid #e5e7eb !important; padding-left: 0 !important;
                        order: 10 !important;
                    }
                    .pd-right-scroll {
                        overflow-y: visible !important; flex: unset !important;
                        padding: 12px 12px 8px !important;
                    }
                    .pd-scroll-arrow { display: none !important; }

                    /* Action bar → full width, BEFORE description */
                    .pd-action-bar {
                        flex: 0 0 100% !important; max-width: 100% !important;
                        flex-wrap: wrap !important; gap: 8px !important;
                        height: auto !important; padding-right: 0 !important; margin-top: 16px !important;
                        order: 6 !important;
                    }
                    .pd-action-bar > div, .pd-action-bar > button {
                        flex: 1 1 auto !important; min-width: 100px !important; height: 42px !important;
                    }

                    /* Info tabs bar → scrollable horizontal strip */
                    .pd-info-bar {
                        height: auto !important;
                        flex-wrap: nowrap !important;
                        overflow-x: auto !important;
                        -webkit-overflow-scrolling: touch !important;
                        gap: 0 !important;
                    }
                    .pd-info-bar > button {
                        flex: 0 0 auto !important;
                        white-space: nowrap !important;
                        padding: 10px 14px !important;
                        font-size: 12px !important;
                        min-width: max-content !important;
                    }

                    /* Breadcrumb & title bar */
                    .pd-title-bar { padding: 12px 14px 10px !important; margin-top: 10px !important; }
                    .pd-breadcrumb {
                        font-size: 11px !important;
                        gap: 4px !important;
                        -ms-overflow-style: none !important;
                        scrollbar-width: none !important;
                    }
                    .pd-breadcrumb::-webkit-scrollbar { display: none !important; }

                    /* Stats row */
                    .pd-stats-row { gap: 8px !important; flex-wrap: wrap !important; font-size: 12px !important; }

                    /* Related products → 2 columns */
                    .pd-related-grid { grid-template-columns: repeat(2, 1fr) !important; }

                    .pd-title { font-size: 16px !important; }
                    .pd-price { font-size: 17px !important; }

                    /* Hide zoom modal sidebar thumbnails on mobile */
                    .pd-zoom-thumbs { display: none !important; }
                }

                /* ═══ SMALL MOBILE (≤480px) ═══ */
                @media (max-width: 480px) {
                    .pd-info-content { padding: 14px 12px !important; }
                    .pd-others-grid { grid-template-columns: 1fr !important; }
                    .pd-info-bar > button {
                        padding: 8px 10px !important;
                        font-size: 11px !important;
                    }
                    .pd-thumb-col button { width: 48px !important; height: 48px !important; }
                }
            `}</style>

                    {/* ── Share Popup Modal ── */}
                    {showSharePopup && (() => {
                        const productUrl = typeof window !== 'undefined' ? window.location.href : '';
                        const shareText = `${product.name} - Tk.${product.price}`;
                        const shareLinks = [
                            { name: 'Facebook', icon: FaFacebookF, color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(shareText)}` },
                            { name: 'WhatsApp', icon: FaWhatsapp, color: '#25D366', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + productUrl)}` },
                            { name: 'Messenger', icon: FaFacebookMessenger, color: '#0078FF', url: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(productUrl)}&app_id=966242223397117&redirect_uri=${encodeURIComponent(productUrl)}` },
                            { name: 'X', icon: FaXTwitter, color: '#000000', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}` },
                            { name: 'Telegram', icon: FaTelegramPlane, color: '#0088cc', url: `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}` },
                            { name: 'LinkedIn', icon: FaLinkedinIn, color: '#0A66C2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}` },
                            { name: 'Pinterest', icon: FaPinterestP, color: '#E60023', url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&media=${encodeURIComponent(allImages[0])}&description=${encodeURIComponent(shareText)}` },
                            { name: 'Instagram', icon: FaInstagram, color: '#E1306C', url: `https://www.instagram.com/` },
                            { name: 'TikTok', icon: FaTiktok, color: '#000000', url: `https://www.tiktok.com/` },
                            { name: 'Email', icon: FaEnvelope, color: '#555555', url: `mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(shareText + '\n\n' + productUrl)}` },
                        ];
                        return (
                            <div
                                className='fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4'
                                onClick={() => setShowSharePopup(false)}
                            >
                                <div
                                    className='bg-white rounded-lg w-full max-w-[620px] max-h-[88vh] flex flex-col overflow-hidden shadow-2xl'
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                                >
                                    {/* Header */}
                                    <div className='flex items-center justify-between px-4 py-2.5 border-b border-gray-200 shrink-0'>
                                        <h3 className='text-[15px] font-bold text-gray-900 truncate pr-4'>{product.name}</h3>
                                        <button
                                            onClick={() => setShowSharePopup(false)}
                                            className='w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors shrink-0'
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>

                                    {/* Product Image — full view like comments popup */}
                                    <div className='shrink-0 border-b border-gray-200'>
                                        <div className='w-full bg-gray-50 flex items-center justify-center' style={{ maxHeight: '280px' }}>
                                            <img
                                                src={allImages[0]}
                                                alt={product.name}
                                                className='w-full object-contain'
                                                style={{ maxHeight: '280px' }}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/620x200/f3f4f6/9ca3af?text=No+Image';
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Share With label */}
                                    <div className='px-4 pt-3 pb-1'>
                                        <p className='text-[13px] font-bold text-gray-900'>Share With</p>
                                    </div>

                                    {/* Social Media Grid */}
                                    <div className='px-4 py-2 overflow-y-auto flex-1'>
                                        <div className='grid grid-cols-5 gap-3'>
                                            {shareLinks.map((link) => (
                                                <a
                                                    key={link.name}
                                                    href={link.url}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='flex flex-col items-center gap-1.5 py-2 rounded-lg hover:bg-gray-50 transition-colors'
                                                >
                                                    <div className='w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110' style={{ background: link.color }}>
                                                        <link.icon size={16} />
                                                    </div>
                                                    <span className='text-[10px] text-gray-500 font-medium'>{link.name}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Copy Link Bar */}
                                    <div className='px-4 py-3 border-t border-gray-100 shrink-0'>
                                        <div className='flex items-center bg-gray-100 rounded-lg overflow-hidden'>
                                            <input type='text' value={productUrl} readOnly className='flex-1 bg-transparent text-xs text-gray-600 outline-none px-3 py-2.5 truncate' />
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(productUrl); setShareLinkCopied(true); setTimeout(() => setShareLinkCopied(false), 2000); }}
                                                className='px-4 py-2.5 bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-1.5 whitespace-nowrap'
                                            >
                                                {shareLinkCopied ? <><FiCheckCircle size={12} /> Copied!</> : <><FiCopy size={12} /> Copy</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                    {/* ── Comments Modal (same component as product card) ── */}
                    {showCommentsModal && product && (
                        <CommentsPopup
                            productId={product._id}
                            productName={product.name}
                            productImage={allImages[0]}
                            onClose={() => setShowCommentsModal(false)}
                        />
                    )}

                    {/* ═══ Download Modal ═══ */}
                    {showDownloadModal && (
                        <div
                            style={{
                                position: 'fixed', inset: 0, zIndex: 9999,
                                background: 'rgba(0,0,0,0.7)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', padding: '2rem',
                            }}
                            onClick={() => setShowDownloadModal(false)}
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    background: '#fff', borderRadius: '12px', padding: '24px',
                                    maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
                                        <FiDownload size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                        Download Images
                                    </h3>
                                    <button onClick={() => setShowDownloadModal(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FiX size={16} />
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                    {allImages.map((img: string, idx: number) => (
                                        <div
                                            key={idx}
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(img);
                                                    const blob = await res.blob();
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `${product.name || 'product'}-image-${idx + 1}.jpg`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);
                                                    URL.revokeObjectURL(url);
                                                } catch {
                                                    window.open(img, '_blank');
                                                }
                                            }}
                                            style={{
                                                aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden',
                                                cursor: 'pointer', border: '2px solid #e5e7eb', position: 'relative',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'scale(1.03)'; (e.currentTarget.querySelector('.dl-overlay') as HTMLElement).style.opacity = '1'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'scale(1)'; (e.currentTarget.querySelector('.dl-overlay') as HTMLElement).style.opacity = '0'; }}
                                        >
                                            <img src={img} alt={`Image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div className="dl-overlay" style={{
                                                position: 'absolute', inset: 0, background: 'rgba(11,66,34,0.5)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                opacity: 0, transition: 'opacity 0.2s ease',
                                            }}>
                                                <FiDownload size={24} color="#fff" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ Send Inquiry Modal ═══ */}
                    {showInquiryModal && (
                        <div
                            style={{
                                position: 'fixed', inset: 0, zIndex: 9999,
                                background: 'rgba(0,0,0,0.7)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', padding: '2rem',
                            }}
                            onClick={() => { setShowInquiryModal(false); setInquirySuccess(false); }}
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    background: '#fff', borderRadius: '12px', padding: '24px',
                                    maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                                }}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
                                        <FiMessageSquare size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                        Send Inquiry
                                    </h3>
                                    <button onClick={() => { setShowInquiryModal(false); setInquirySuccess(false); }} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FiX size={16} />
                                    </button>
                                </div>

                                {/* Product Preview */}
                                <div style={{ display: 'flex', gap: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
                                    <img src={product.thumbnail} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px 0', lineHeight: 1.3 }}>{product.name}</p>
                                        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>Tk.{discountedPrice.toLocaleString()}</p>
                                    </div>
                                </div>

                                {inquirySuccess ? (
                                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                        <FiCheckCircle size={48} color="var(--color-primary)" />
                                        <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '12px' }}>Inquiry Sent!</p>
                                        <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>We'll get back to you soon.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!inquiryName.trim() || !inquiryContact.trim() || !inquiryPhone.trim() || !inquiryMessage.trim()) return;
                                        setInquirySubmitting(true);
                                        try {
                                            await createInquiry({
                                                product: product._id,
                                                name: inquiryName.trim(),
                                                phone: inquiryPhone.trim(),
                                                email: inquiryContact.trim(),
                                                message: inquiryMessage.trim(),
                                            }).unwrap();
                                            setInquirySuccess(true);
                                            setInquiryName('');
                                            setInquiryContact('');
                                            setInquiryPhone('');
                                            setInquiryMessage('');
                                        } catch (err) {
                                            console.error('Inquiry error:', err);
                                        } finally {
                                            setInquirySubmitting(false);
                                        }
                                    }}>
                                        {/* Name */}
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>Your Name *</label>
                                            <input
                                                value={inquiryName}
                                                onChange={(e) => setInquiryName(e.target.value)}
                                                placeholder="Enter your name"
                                                required
                                                style={{
                                                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                                                    border: '1.5px solid #e5e7eb', fontSize: '13px', outline: 'none',
                                                    transition: 'border 0.2s ease', boxSizing: 'border-box',
                                                }}
                                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                                            />
                                        </div>

                                        {/* Email Address */}
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>Email Address *</label>
                                            <input
                                                value={inquiryContact}
                                                onChange={(e) => setInquiryContact(e.target.value)}
                                                placeholder="name@example.com"
                                                required
                                                type="email"
                                                style={{
                                                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                                                    border: '1.5px solid #e5e7eb', fontSize: '13px', outline: 'none',
                                                    transition: 'border 0.2s ease', boxSizing: 'border-box',
                                                }}
                                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                                            />
                                        </div>

                                        {/* Phone Number */}
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>Phone Number *</label>
                                            <input
                                                value={inquiryPhone || ''}
                                                onChange={(e) => setInquiryPhone(e.target.value)}
                                                placeholder="01XXXXXXXXX"
                                                required
                                                type="tel"
                                                style={{
                                                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                                                    border: '1.5px solid #e5e7eb', fontSize: '13px', outline: 'none',
                                                    transition: 'border 0.2s ease', boxSizing: 'border-box',
                                                }}
                                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                                            />
                                        </div>

                                        {/* Message */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>Your Query *</label>
                                            <textarea
                                                value={inquiryMessage}
                                                onChange={(e) => setInquiryMessage(e.target.value)}
                                                placeholder="Write your question or inquiry..."
                                                required
                                                rows={4}
                                                style={{
                                                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                                                    border: '1.5px solid #e5e7eb', fontSize: '13px', outline: 'none',
                                                    transition: 'border 0.2s ease', resize: 'vertical',
                                                    fontFamily: 'inherit', boxSizing: 'border-box',
                                                }}
                                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                                            />
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={inquirySubmitting}
                                            style={{
                                                width: '100%', padding: '12px', borderRadius: '9999px',
                                                background: 'var(--color-primary)', color: '#fff', border: 'none',
                                                fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                                                opacity: inquirySubmitting ? 0.7 : 1,
                                                transition: 'all 0.2s ease', textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                            }}
                                        >
                                            {inquirySubmitting ? 'Submitting...' : 'Submit Inquiry'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </>
    );
}
