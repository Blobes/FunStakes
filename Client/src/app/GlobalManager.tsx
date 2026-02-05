"use client";

import React, { useEffect, useRef, useState } from "react";
import { SnackBars } from "@/components/SnackBars";
import { useGlobalContext } from "./GlobalContext";
import { Modal, ModalRef } from "@/components/Modal";
import { useController } from "@/hooks/global";
import { useAuth } from "@/app/(auth)/authHook";
import { NetworkGlitchUI } from "../components/NetworkGlitchUI";
import { SplashUI } from "../components/SplashUI";
import { registerSW, unregisterSW } from "@/helpers/serviceWorker";
import { usePathname, useRouter } from "next/navigation";
import { usePage } from "@/hooks/page";
import { useEvent } from "@/hooks/events";


export const GlobalManager = ({ children }: { children: React.ReactNode }) => {
    const { handleBrowserEvents } = useEvent();
    const modalRef = useRef<ModalRef>(null);
    const { openModal, verifySignal, isOnline } = useController();
    const { handleCurrentPage } = usePage()
    const { snackBarMsg, modalContent, isGlobalLoading,
        authStatus, networkStatus } = useGlobalContext();
    const pathname = usePathname();
    const { verifyAuth } = useAuth();
    const hasInitializedAuth = useRef(false);

    // Initialize Auth
    useEffect(() => {
        const init = async () => {
            // unregisterSW()
            await verifySignal();
            if (!hasInitializedAuth.current) {
                hasInitializedAuth.current = true;
                await verifyAuth();  // runs only once
            }
        }
        init();
    }, [networkStatus, authStatus]);

    // Modal Open / Close
    useEffect(() => {
        if (!modalContent) {
            modalRef.current?.closeModal();
            return;
        }
        requestAnimationFrame(() => {
            modalRef.current?.openModal();
        });
    }, [modalContent, openModal]);

    // // Page Load Handler
    useEffect(() => {
        handleCurrentPage();
        handleBrowserEvents()
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
            {modalContent && <Modal ref={modalRef} {...modalContent} />}
        </>
    );
};
