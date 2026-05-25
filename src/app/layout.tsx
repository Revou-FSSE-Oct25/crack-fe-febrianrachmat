import "./globals.css";
import ApiHealthBanner from "@/components/ApiHealthBanner";
import AppShortcutBar from "@/components/AppShortcutBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { ThemeScript } from "@/components/ThemeScript";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-kinova",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakarta.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${plusJakarta.className} min-h-screen flex flex-col text-slate-900 antialiased dark:text-slate-100`}
      >
        <Providers>
          <ApiHealthBanner />
          <Navbar />
          <AppShortcutBar />
          <div className="flex-1 w-full">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
