import type { Metadata } from "next";
import { ReactNode } from "react";

import { Nav } from "@/components/nav";
import { QueryProvider } from "@/lib/query-client";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlphaBox | 韭菜盒子",
  description: "Private investment signal subscriptions. No brokerage, no trade execution."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <Nav />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
