import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CustomThemeProvider } from "@/providers/custom-theme-provider";
import { InstanceProvider } from "@/providers/instance-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { SessionProvider } from "@/providers/SessionProvider";
import { SyncProvider } from "@/providers/SyncProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aura POS",
  description: "Advanced Point of Sale System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased overflow-x-hidden`}
      >
        <CustomThemeProvider>
          <QueryProvider>
            <InstanceProvider>
              <I18nProvider>
                <AuthProvider>
                  <SessionProvider>
                    <SyncProvider>
                      {children}
                      <Toaster />
                      {/* SyncProvider has its own toast logic or uses Toaster */}
                    </SyncProvider>
                  </SessionProvider>
                </AuthProvider>
              </I18nProvider>
            </InstanceProvider>
          </QueryProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}
