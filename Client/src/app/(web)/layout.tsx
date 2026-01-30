"use client"

import { BlurEffect } from "@/components/BlurEffect";
import { Footer } from "./nav/Footer";
import { Header } from "./nav/Header";
import { RootUIContainer } from "@/components/Containers";

export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootUIContainer>
      <>
        <BlurEffect />
        <Header />
        {children}
        <Footer />
      </>
    </RootUIContainer>
  )
}