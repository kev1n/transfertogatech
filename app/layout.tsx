import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Transfer to GaTech",
  description: "Transfer to GaTech",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex h-screen w-[1024px] max-w-full flex-col px-10 ">
          <Header />
          <div className="grow">{children}</div>
        </div>
      </body>
    </html>
  );
}
