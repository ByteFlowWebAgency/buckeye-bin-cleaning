import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Suspense } from 'react';
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Buckeye Bin Cleaning",
  description: "Trash Bin Cleaning & Pressure Washing Services",
  icons: {
    apple: '/apple-touch-icon.png',
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
  themeColor: '#ffffff',
};

function RootLayoutContent({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={ `${ geistSans.variable } ${ geistMono.variable } antialiased` }
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Script
          src={ `https://maps.googleapis.com/maps/api/js?key=${ process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }&libraries=places` }
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <Suspense fallback={null}>
      <RootLayoutContent>{children}</RootLayoutContent>
    </Suspense>
  );
}
