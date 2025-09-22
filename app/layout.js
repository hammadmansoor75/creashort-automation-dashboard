import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthWrapper from '@/components/AuthWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CreaShort Dashboard",
  description: "AI Agent Video Generation Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
