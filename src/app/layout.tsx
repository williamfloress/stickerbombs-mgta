import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StickerBomb | Premium Card Stickers",
  description: "Customize your credit and debit cards with premium stickers.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = 'client';

  let missingProfileInfo = false;

  if (user) {
    const { data } = await supabase.from('users').select('rol, direccion, telefono').eq('id', user.id).single();
    if (data) {
      userRole = data.rol;
      if (!data.direccion || !data.telefono) {
        missingProfileInfo = true;
      }
    }
  }

  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <CartProvider>
          <Navbar initialUser={user} initialUserRole={userRole} missingProfileInfo={missingProfileInfo} />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
