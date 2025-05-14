import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import { Sun, Moon, Brain } from 'lucide-react'; // Assuming ThemeToggle component is not used directly

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NeuroNest - Your Mental Wellness Companion',
  description: 'Nurture your mind with NeuroNest. Journal, track moods, and find personalized support.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased font-sans`}>
        <SidebarProvider defaultOpen>
          <Sidebar className="bg-sidebar text-sidebar-foreground" collapsible="icon">
            <SidebarNav />
          </Sidebar>
          <SidebarInset className="bg-background min-h-screen">
            <header className="sticky top-0 z-50 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <Brain className="h-7 w-7 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">NeuroNest</h1>
              </div>
              {/* Placeholder for theme toggle or user profile */}
              {/* For now, a simple button to illustrate placement */}
              {/* <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button> */}
            </header>
            <main className="p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
