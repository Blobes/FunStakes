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


export const GlobalManager = ({ children }: { children: React.ReactNode }) => {
    const { handleBrowserEvents } = useEvent();
    const drawerRef = useRef<DrawerRef>(null);
    const modalRef = useRef<ModalRef>(null);
    const { openDrawer, openModal, verifySignal, isOffline } = useController();
    const { handleCurrentPage } = usePage()
    const { snackBarMsg, drawerContent, modalContent, isGlobalLoading,
        authStatus, networkStatus, offlineMode } = useGlobalContext();
    const pathname = usePathname();
    const { verifyAuth } = useAuth();
    const hasAuthInit = useRef(false);
    const { switchToOfflineMode } = useOffline();
    const [mounted, setMounted] = useState(true)

    useEffect(() => {
        const init = async () => {
            // Delay a little for splash
            await delay();
            setMounted(false);

            // Switch to offline mode if offline
            // if (isOffline) switchToOfflineMode()
            // Initialize Auth
            verifySignal();
            if (!hasAuthInit.current) {
                hasAuthInit.current = true;
                await verifyAuth();
            }
            // Register service worker
            registerSW()
        }
        init();
    }, [networkStatus, authStatus, offlineMode]);

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

    // App Splash
    if (mounted) return <SplashUI />;

    // Page loader
    if ((isGlobalLoading || authStatus === "PENDING" ||
        networkStatus === "UNKNOWN") && !mounted) {
        return <PageLoaderUI />;
    }

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
