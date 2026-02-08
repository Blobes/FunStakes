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
import { useOffline } from "./offline/offlineHook";
import { registerSW } from "@/helpers/serviceWorker";
import { delay } from "@/helpers/global";
import { PageLoaderUI } from "@/components/LoadingUIs";
import { OfflinePromptUI } from "./offline/OfflinePromptUI";


export const GlobalManager = ({ children }: { children: React.ReactNode }) => {
    const { handleBrowserEvents } = useEvent();
    const drawerRef = useRef<DrawerRef>(null);
    const modalRef = useRef<ModalRef>(null);
    const { openDrawer, openModal, verifySignal, isOffline } = useController();
    const { handleCurrentPage } = usePage()
    const { snackBarMsg, drawerContent, modalContent, isGlobalLoading,
        authStatus, networkStatus, offlineMode, setGlobalLoading } = useGlobalContext();
    const pathname = usePathname();
    const { verifyAuth } = useAuth();
    const hasAuthInit = useRef(false);
    const { switchToOfflineMode } = useOffline();
    const [isAppReady, setIsAppReady] = useState(false); // New local gate
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                registerSW();
                setGlobalLoading(true);

                // 1. Splash Phase
                await delay(1000);
                setShowSplash(false);

                // 2. Verification Phase
                verifySignal();
                if (!hasAuthInit.current) {
                    hasAuthInit.current = true;
                    await verifyAuth(); // Wait for the actual auth check
                }
            } catch (error) {
                console.error("Initialization failed", error);
            } finally {
                // 3. Finalization Phase
                setGlobalLoading(false);
                setIsAppReady(true); // ONLY now do we allow the app to show
            }
        };

        init();
    }, [networkStatus]);

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
        handleBrowserEvents(hasAuthInit);
    }, [pathname]);

    // App Splash UI
    if (showSplash) return <SplashUI />;

    // Page loader UI
    const isInitializing = !isAppReady ||
        isGlobalLoading ||
        authStatus === "PENDING" ||
        networkStatus === "UNKNOWN";
    if (isInitializing) return <PageLoaderUI />;

    // Offline Prompt UI
    if (isOffline && !offlineMode) return <OfflinePromptUI />


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
