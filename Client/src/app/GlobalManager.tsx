"use client";

import React, { useEffect, useRef, useState } from "react";
import { SnackBars } from "@/components/SnackBars";
import { useGlobalContext } from "./GlobalContext";
import { Drawer, DrawerRef } from "@/components/Drawer";
import { useController } from "@/hooks/global";
import { useAuth } from "@/app/(auth)/authHook";
import { SplashUI } from "../components/SplashUI";
import { usePathname } from "next/navigation";
import { usePage } from "@/hooks/page";
import { useEvent } from "@/hooks/events";
import { Modal, ModalRef } from "@/components/Modal";
import { registerSW } from "@/helpers/serviceWorker";
import { delay } from "@/helpers/global";
import { PageLoaderUI } from "@/components/LoadingUIs";
import { OfflinePromptUI } from "./offline/OfflinePromptUI";


export const GlobalManager = ({ children }: { children: React.ReactNode }) => {
    const { handleBrowserEvents } = useEvent();
    const drawerRef = useRef<DrawerRef>(null);
    const modalRef = useRef<ModalRef>(null);
    const { openDrawer, openModal, verifySignal, isOffline } = useController();
    const { handleCurrentPage, isOnOffline } = usePage()
    const { snackBarMsg, drawerContent, modalContent, isGlobalLoading,
        authStatus, networkStatus, offlineMode, setGlobalLoading } = useGlobalContext();
    const pathname = usePathname();
    const { verifyAuth } = useAuth();
    const [isAppReady, setIsAppReady] = useState(false); // New local gate
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                registerSW();
                setGlobalLoading(true);

                await delay();
                setShowSplash(false);

                // Initial check only
                verifySignal();
                await verifyAuth();
            } finally {
                setGlobalLoading(false);
                setIsAppReady(true);
            }
        };
        init();
    }, []);

    // Drawer & Modal Open / Close
    useEffect(() => {
        if (!drawerContent) drawerRef.current?.closeDrawer();
        if (!modalContent) modalRef.current?.closeModal()

        requestAnimationFrame(() => {
            if (drawerContent) drawerRef.current?.openDrawer();
            if (modalContent) modalRef.current?.openModal()
        });
    }, [drawerContent, openDrawer, modalContent, openModal]);

    // // Page Load Handler
    useEffect(() => {
        handleCurrentPage();
        handleBrowserEvents();
    }, [pathname]);

    // App Splash UI
    if (showSplash) return <SplashUI />;

    // Page loader UI
    const isInitializing = !isAppReady ||
        isGlobalLoading ||
        authStatus === "PENDING" ||
        networkStatus === "UNKNOWN";
    if (isInitializing) return <PageLoaderUI />;

    // // Offline Prompt UI
    // const isOnOfflineRoute = isOnOffline(pathname);
    // // if (isOffline && !offlineMode) return <OfflinePromptUI />


    // Render the app UIs
    return (
        <>
            {children}
            {snackBarMsg.messages && <SnackBars snackBarMsg={snackBarMsg} />}
            {drawerContent && <Drawer ref={drawerRef} {...drawerContent} />}
            {modalContent && <Modal ref={modalRef} {...modalContent} />}
        </>
    );
};
