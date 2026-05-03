"use client";
import { FiFileText } from 'react-icons/fi';
import LegalPageLayout from '@/components/shared/LegalPageLayout';

export default function TermsPage() {
    return (
        <LegalPageLayout
            slug="terms"
            fallbackTitle="Terms & Conditions"
            icon={<FiFileText size={24} />}
            accentColor="var(--color-primary)"
            ctaTitle="Have questions about these terms?"
            ctaDescription="Our team is happy to help clarify anything."
            ctaButtonText="Contact Us"
        />
    );
}
