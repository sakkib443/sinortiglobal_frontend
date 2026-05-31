import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/redux";
import FloatingContact from "@/components/shared/FloatingContact";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import Preloader from "@/components/shared/Preloader";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sinotriglobal.com"),
  title: {
    default: "Sinotri Global — Your Trusted Global Trading Platform",
    template: "%s | Sinotri Global",
  },
  description: "Source quality products from China with Sinotri Global. Sourcing, shipping, freight forwarding, and customs solutions for Bangladesh.",
  keywords: ["sinotri global", "trading", "sourcing", "china products", "import", "ecommerce", "bangladesh", "shipping", "freight forwarding"],
  applicationName: "Sinotri Global",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Sinotri Global",
    title: "Sinotri Global — Your Trusted Global Trading Platform",
    description: "Source quality products from China with Sinotri Global. Sourcing, shipping, and customs solutions for Bangladesh.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sinotri Global — Your Trusted Global Trading Platform",
    description: "Source quality products from China with Sinotri Global. Sourcing, shipping, and customs solutions for Bangladesh.",
  },
  robots: { index: true, follow: true },
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ReduxProvider>
          <ThemeProvider>
            <Preloader />
            <Toaster position="top-center" reverseOrder={false} />
            {children}
            <FloatingContact />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
