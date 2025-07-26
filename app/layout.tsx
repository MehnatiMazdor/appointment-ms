import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/authContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dr. Tariq Ahmed - Pediatric Specialist",
  description: "Book appointments with Dr. Tariq Ahmed, experienced pediatric specialist at Khyber Teaching Hospital",
  generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem 
          disableTransitionOnChange 
          >
            {children}
            <Toaster/>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

