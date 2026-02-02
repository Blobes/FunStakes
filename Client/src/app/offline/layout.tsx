"use client"

import { App } from "./App";
import { RootUIContainer } from "@/components/Containers";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootUIContainer>
      <App>{children}</App>
    </RootUIContainer>
  )
}