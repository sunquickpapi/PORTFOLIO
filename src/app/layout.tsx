import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Naufal - Portfolio",
  description: "Professional Portfolio of Naufal N - Intelligent System Engineer specializing in AI and precision engineering.",
  icons: {
    icon: "/assets/circleLogo.png",
    apple: "/assets/circleLogo.png",
  },
};

import { Providers } from "@/components/Providers";
import PageLoader from "@/components/PageLoader";

// Applies the saved theme before first paint, so the loader (and page) never flash the wrong colours.
const themeScript = `try{var t=localStorage.getItem("portfolio-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.classList.add(t)}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PageLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
