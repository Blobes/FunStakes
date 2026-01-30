"use client"

import { RootUIContainer } from "@/components/Containers";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootUIContainer >
      {children}
    </RootUIContainer>
  );
}