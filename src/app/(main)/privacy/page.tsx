"use client";
import { FiShield } from 'react-icons/fi';
import LegalPageLayout from '@/components/shared/LegalPageLayout';

export default function PrivacyPage() {
    return (
        <LegalPageLayout
            slug="privacy"
            fallbackTitle="Privacy Policy"
            icon={<FiShield size={24} />}
            accentColor="var(--color-primary)"
            ctaTitle="Privacy concerns?"
            ctaDescription="Contact our team if you have questions about your data."
            ctaButtonText="Contact Us"
        />
    );
}
