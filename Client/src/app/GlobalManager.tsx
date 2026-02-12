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
    const { openDrawer, openModal, verifySignal } = useController();
    const { handleCurrentPage } = usePage()
    const { snackBarMsg, drawerContent, modalContent, isGlobalLoading,
        authStatus, networkStatus, setGlobalLoading } = useGlobalContext();
    const pathname = usePathname();
    const { verifyAuth } = useAuth();

    useEffect(() => {
        const init = async () => {
            try {
                registerSW();
                setGlobalLoading(true);
                await delay();

                // Initial check only
                verifySignal();
                await verifyAuth();
            } finally {
                setGlobalLoading(false);
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


    // Page loader UI
    const isInitializing =
        isGlobalLoading ||
        authStatus === "PENDING" ||
        networkStatus === "UNKNOWN";
    if (isInitializing) return <PageLoaderUI />;


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
