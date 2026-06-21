import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { getTeams } from "@/lib/api/worldcup26";
import { AutoRefresh } from "@/components/features/AutoRefresh";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "World Cup 2026 Fixtures Hub",
  description: "Ultimate FIFA World Cup 2026 schedule platform with live results, predictions, and local timezone conversions.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const teams = await getTeams();

  // Applying dark class by default to the HTML tag as requested for premium sports-media design
  // suppressHydrationWarning is necessary to prevent browser extensions from causing attribute mismatches
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col bg-background text-foreground`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ThemeProvider teams={teams}>
            <AutoRefresh />
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
