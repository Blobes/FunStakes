"use client"

import { AppManager } from "./AppManager";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppManager>{children}</AppManager>
}