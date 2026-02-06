"use client";

import React, { useEffect, useRef } from "react";
import { SnackBars } from "@/components/SnackBars";
import { useGlobalContext } from "./GlobalContext";
import { Drawer, DrawerRef } from "@/components/Drawer";
import { useController } from "@/hooks/global";
import { useAuth } from "@/app/(auth)/authHook";
import { NetworkGlitchUI } from "../components/NetworkGlitchUI";
import { SplashUI } from "../components/SplashUI";
import { registerSW, unregisterSW } from "@/helpers/serviceWorker";
import { usePathname, useRouter } from "next/navigation";
import { usePage } from "@/hooks/page";
import { useEvent } from "@/hooks/events";
import { Modal, ModalRef } from "@/components/Modal";


export const GlobalManager = ({ children }: { children: React.ReactNode }) => {
    const { handleBrowserEvents } = useEvent();
    const drawerRef = useRef<DrawerRef>(null);
    const modalRef = useRef<ModalRef>(null);
    const { openDrawer, openModal, verifySignal } = useController();
    const { handleCurrentPage } = usePage()
    const { snackBarMsg, drawerContent, modalContent, isGlobalLoading,
        authStatus, networkStatus } = useGlobalContext();
    const pathname = usePathname();
    const { verifyAuth } = useAuth();
    const hasAuthInit = useRef(false);

    // Initialize Auth
    useEffect(() => {
        const init = async () => {
            // unregisterSW()
            verifySignal();
            if (!hasAuthInit.current) {
                hasAuthInit.current = true;
                await verifyAuth();
            }
        }
        init();
    }, [networkStatus, authStatus]);

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
        handleBrowserEvents(hasAuthInit)
    }, [pathname]);

    // App Splash
    if (isGlobalLoading || authStatus === "PENDING" || networkStatus === "UNKNOWN") {
        return <SplashUI />;
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
