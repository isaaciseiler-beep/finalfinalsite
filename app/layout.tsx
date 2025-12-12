// app/layout.tsx — DROP-IN
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/components/SidebarContext";
import Brand from "@/components/Brand";
import HeaderGradient from "@/components/HeaderGradient";
import FooterGradient from "@/components/FooterGradient";
import Footer from "@/components/Footer";
import SiteShell from "@/components/SiteShell";
import 'mapbox-gl/dist/mapbox-gl.css';

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: "isaac • portfolio",
  description: "black & white, elegant, fast.",
  openGraph: {
    title: "isaac • portfolio",
    description: "black & white, elegant, fast.",
    type: "website",
    url: "https://example.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      {/* pure black surface + antialias to avoid hairlines */}
      <body className="h-full bg-black text-white antialiased">
        <SidebarProvider>
          {/* fixed gradients */}
          <HeaderGradient />    {/* z-[50] */}
          <FooterGradient />    {/* z-[5], behind page + footer */}

          {/* fixed brand + sidebar layers */}
          <Brand />             {/* z-[60] */}
          <Sidebar />           {/* its own z-index inside */}

          {/* page + footer content (reserves space for sidebar; animates in sync) */}
          <SiteShell>
            {children}
            <Footer />
          </SiteShell>
        </SidebarProvider>
      </body>
    </html>
  );
}
