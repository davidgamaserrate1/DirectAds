import type { Metadata } from "next";
import { Bai_Jamjuree } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";

const baiJamjuree = Bai_Jamjuree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI Campaign Manager",
  description: "Gerencie campanhas de marketing com inteligência artificial",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={baiJamjuree.className}>
        <ThemeProvider>
          <AuthProvider>
            <Toaster>
              {children}
            </Toaster>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
