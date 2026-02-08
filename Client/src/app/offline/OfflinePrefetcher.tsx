"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function OfflinePrefetcher() {
    const router = useRouter();

    useEffect(() => {
        // This tells Next.js to fetch the JS and data for the /offline route
        // without actually navigating to it.
        router.prefetch('/offline');

        // Optional: Also fetch it via the native browser fetch to ensure 
        // the Service Worker sees the request clearly
        fetch('/offline').catch(() => { });
    }, [router]);

    return null;
}