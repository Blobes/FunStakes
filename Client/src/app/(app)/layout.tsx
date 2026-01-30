"use client"

import { AppWrapper } from "./AppWrapper";
import { RootUIContainer } from "@/components/Containers";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootUIContainer>
      <AppWrapper>{children}</AppWrapper>
    </RootUIContainer>
  )
}