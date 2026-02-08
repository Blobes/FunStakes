'use client';

import { SplashUI } from '@/components/SplashUI';
import dynamic from 'next/dynamic';
import React from 'react';

// 1. Move the dynamic import here
const GlobalManager = dynamic(
    () => import('./GlobalManager').then((mod) => mod.GlobalManager),
    {
        ssr: false,
        loading: () => <SplashUI />, // Optional: Render nothing while loading
    }
);

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    return <GlobalManager>{children}</GlobalManager>;
}