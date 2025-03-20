import { Geist, Geist_Mono } from "next/font/google";
import { Unbounded } from "next/font/google";
import "./globals.css";
import PrivyProvider from "./providers/PrivyProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "PrivLend | Privacy-Preserving Credit Scoring for DeFi",
  description: "Protect your data while proving your creditworthiness. Access undercollateralized loans in DeFi with ZK-proofs.",
};

export default function RootLayout({ children }) {
  return (
    <html className="h-full" lang="en">
      <body
        className={`${geistSans.variable} bg-white ${geistMono.variable} ${unbounded.variable} antialiased`}
      >
        <PrivyProvider>
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
