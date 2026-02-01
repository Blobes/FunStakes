"use client";

import React, { useEffect, useRef, useState } from "react";
import { SnackBars } from "@/components/SnackBars";
import { useGlobalContext } from "./GlobalContext";
import { Modal, ModalRef } from "@/components/Modal";
import { useController } from "@/hooks/global";
import { useAuth } from "@/app/(auth)/authHook";
import { OfflineUI } from "../components/OfflineUI";
import { SplashUI } from "../components/SplashUI";
import { registerSW } from "@/helpers/registerSW";
import { usePathname } from "next/navigation";
import { usePage } from "@/hooks/page";
import { useEvent } from "@/hooks/events";


export const GlobalManager = ({ children }: { children: React.ReactNode }) => {
    const { handleBrowserEvents } = useEvent();
    const { verifyAuth } = useAuth();
    const modalRef = useRef<ModalRef>(null);
    const { openModal, verifySignal, isUnstableNetwork, isOffline } = useController();
    const { handleCurrentPage } = usePage()
    const { snackBarMsg, loginStatus, modalContent,
        networkStatus, isGlobalLoading } = useGlobalContext();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname()


    //  MOUNT && SERVICE WORKER REGISTRATION
    useEffect(() => {
        setMounted(true);
        registerSW();
        handleBrowserEvents()
    }, []);

    // AUTH CHECK & NETWORK SIGNAL CHECK
    useEffect(() => {
        const init = async () => {
            await verifySignal();
            await verifyAuth();
        }
        init();
    }, [networkStatus, loginStatus]);

    // MODAL OPEN / CLOSE
    useEffect(() => {
        if (!modalContent) {
            modalRef.current?.closeModal();
            return;
        }
        requestAnimationFrame(() => {
            modalRef.current?.openModal();
        });
    }, [modalContent, openModal]);

    // PAGE LOAD HANDLER
    useEffect(() => {
        handleCurrentPage()
    }, [pathname]);


    // RENDER UIs
    // Conditionally render the splash UI
    if (!mounted || loginStatus === "PENDING" || isGlobalLoading) {
        return <SplashUI />;
    }
    // Conditionally render the offline UI
    if ((isOffline || isUnstableNetwork) && loginStatus === "UNKNOWN") {
        return <OfflineUI />;
    }

    // Conditionally render the app UIs
    return (
        <>
            {children}
            {snackBarMsg.messages && <SnackBars snackBarMsg={snackBarMsg} />}
            {modalContent && <Modal ref={modalRef} {...modalContent} />}
        </>
    );
};
