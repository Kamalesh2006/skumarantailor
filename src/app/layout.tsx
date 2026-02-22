import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import Navbar from "@/components/Navbar";
import AppShell from "@/components/AppShell";

import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "S Kumaran Tailors — Premium Tailoring Since 1990",
  description:
    "Professional tailoring services by S Kumaran Tailors, Cuddalore. Track your orders, manage measurements, and experience premium craftsmanship.",
};

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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Tamil:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen surface-primary">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppShell>
                <Navbar />
                <main>{children}</main>
                <Footer />
              </AppShell>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

