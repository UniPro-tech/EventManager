import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MiniDrawer from "@/components/Sidebar";
import CustomBreadcrumbs from "@/components/CustomBreadcrumbs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "UniPro Event Manager",
    template: "%s - UniPro Event Manager",
  },
  description: "UniPro Event Managerへようこそ！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MiniDrawer>
          <CustomBreadcrumbs />
          {children}
        </MiniDrawer>
      </body>
    </html>
  );
}
