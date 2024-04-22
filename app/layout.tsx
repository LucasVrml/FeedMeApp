import "../lib/globals.scss";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NavBar } from "@/components/NavBar";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Feed Me",
  description: "The fastest way to build apps with Next.js and Supabase",
};

import { Raleway } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

const raleway = Raleway({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={raleway.className}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          storageKey="themeMode"
        >
          <main className="w-full max-h-[100vh] min-h-[100vh] flex flex-col justify-center items-center overflow-hidden">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
