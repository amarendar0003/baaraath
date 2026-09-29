import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Baaraath - Event Booking Platform",
    template: "%s | Baaraath",
  },
  description:
    "Discover venues and event services for weddings, birthdays, family gatherings and every occasion worth celebrating. Plan your event with Baaraath.",
  keywords: [
    "event booking",
    "banquet hall",
    "catering",
    "wedding",
    "venue",
    "event planning",
    "Baaraath",
  ],
  authors: [{ name: "Baaraath" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://baaraath.com",
    siteName: "Baaraath",
    title: "Baaraath - Event Booking Platform",
    description:
      "Discover venues and event services for weddings, birthdays, family gatherings and every occasion worth celebrating.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#fffdf9] text-[#342433]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
