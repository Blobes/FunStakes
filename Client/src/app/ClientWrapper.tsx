'use client';

import { SplashUI } from '@/components/SplashUI';
import dynamic from 'next/dynamic';
import React from 'react';
import { OfflinePrefetcher } from './offline/OfflinePrefetcher';

// 1. Move the dynamic import here
const GlobalManager = dynamic(
    () => import('./GlobalManager').then((mod) => mod.GlobalManager),
    {
        ssr: false,
        loading: () => <SplashUI />, // Optional: Render nothing while loading
    }
);

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    return (
        <>
            <OfflinePrefetcher />
            <GlobalManager>{children}</GlobalManager>
        </>
    )
}