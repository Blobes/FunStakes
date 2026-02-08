"use client"

import { OfflineManager } from "./OfflineManager";
import { RootUIContainer } from "@/components/Containers";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <RootUIContainer>
      <OfflineManager>{children}</OfflineManager>
    </RootUIContainer>
  )
}