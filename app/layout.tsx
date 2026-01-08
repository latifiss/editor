"use client";

import type { Metadata } from "next";
import React from "react";
import { Nunito } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import Header from "@/components/ui/headers/header";
import ProgressBar from "@/components/ui/progressBar";
import ScrollToTop from "@/hooks/scrollToTop";
import { NotificationProvider } from '@/context/notificationContext'; 
import { NotificationContainer } from '@/components/notificationContainer'; 
import { usePathname } from "next/navigation";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
    const pathname = usePathname();
  return (
    <html lang="en" className={nunito.variable} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <NotificationProvider>
            <ProgressBar />
            <ScrollToTop />
            {pathname !== '/login' && pathname !== '/signup' && pathname !== '/not-found' && <Header />}
            {children}
            <NotificationContainer position="bottom" />
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
