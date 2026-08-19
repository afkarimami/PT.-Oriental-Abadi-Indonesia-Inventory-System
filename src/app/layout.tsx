import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Ruang Inventaris",
  description: "Workspace inventaris kantor yang rapi dan mudah digunakan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster closeButton position="top-right" richColors />
      </body>
    </html>
  );
}