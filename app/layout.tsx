// app/layout.tsx — DROP-IN REPLACEMENT
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/components/SidebarContext";
import Brand from "@/components/Brand";
import HeaderGradient from "@/components/HeaderGradient";
import FooterGradient from "@/components/FooterGradient";
import Footer from "@/components/Footer";
import SiteShell from "@/components/SiteShell";
import "mapbox-gl/dist/mapbox-gl.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "isaac seiler",
    template: "%s — isaac seiler",
  },
  description: "isaac seiler — personal site. more coming soon.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "isaac seiler",
    description: "isaac seiler — personal site. more coming soon.",
    type: "website",
    url: SITE_URL,
    siteName: "isaac seiler",
  },
  twitter: {
    card: "summary_large_image",
    title: "isaac seiler",
    description: "isaac seiler — personal site. more coming soon.",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Isaac Seiler",
  url: SITE_URL,
  sameAs: [
    "https://www.linkedin.com/in/isaacseiler/",
    // add your github if you want it reflected in rich results:
    // "https://github.com/<your-handle>",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>

      <body className="h-full bg-black text-white antialiased">
        <SidebarProvider>
          <HeaderGradient />
          <FooterGradient />

          <Brand />
          <Sidebar />

          <SiteShell>
            {children}
            <Footer />
          </SiteShell>
        </SidebarProvider>
      </body>
    </html>
  );
}

