<<<<<<< HEAD
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";
import { Providers } from "./providers";

const geist = Geist({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  adjustFontFallback: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "TechTronicsDeals - Best Tech Deals & Coupons",
  description: "Find the best deals on electronics, gadgets, and tech accessories with exclusive coupons and discounts.",
};

=======
>>>>>>> 868642809a379b7c1c3f052c9a08ed97544724b5
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
<<<<<<< HEAD
  return (
    <html lang="en" className={geist.className}>
      <body>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
=======
  return <ClientLayout>{children}</ClientLayout>;
} // Remove the extra closing brace
>>>>>>> 868642809a379b7c1c3f052c9a08ed97544724b5
