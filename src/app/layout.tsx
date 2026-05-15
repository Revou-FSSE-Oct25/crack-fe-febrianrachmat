import "./globals.css";
import AppShortcutBar from "@/components/AppShortcutBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/contexts/toast-context";
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
    <html lang="id" className={plusJakarta.variable}>
      <body
        className={`${plusJakarta.className} min-h-screen flex flex-col text-slate-900 antialiased`}
      >
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <AppShortcutBar />
            <div className="flex-1 w-full">{children}</div>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}