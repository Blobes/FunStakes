"use client";

import React, { useEffect, useRef, useState } from "react";
import { SnackBars } from "@/components/SnackBars";
import { useGlobalContext } from "./GlobalContext";
import { Modal, ModalRef } from "@/components/Modal";
import { useController } from "@/hooks/global";
import { delay } from "@/helpers/global";
import { useAuth } from "@/app/(auth)/authHook";
import { Offline } from "../components/Offline";
import { Splash } from "../components/Splash";
import { registerSW } from "@/helpers/registerSW";

export const GlobalManager = ({ children }: { children: React.ReactNode }) => {
    const { verifyAuth, handleBrowserEvents } = useAuth();
    const modalRef = useRef<ModalRef>(null);
    const { openModal, verifySignal, isUnstableNetwork, isOffline } = useController();
    const { snackBarMsg, loginStatus, modalContent, lastPage,
        networkStatus } = useGlobalContext();
    const [mounted, setMounted] = useState(false);


    // SERVICE WORKER REGISTRATION
    useEffect(() => {
        registerSW()
        //Browser Events
        handleBrowserEvents()
    }, []);

    // MOUNT & INITIAL AUTH CHECK
    useEffect(() => {
        setMounted(true);
        const init = async () => {
            // 1. Wait for Service Worker to be fully active and controlling the page
            // if ('serviceWorker' in navigator &&
            //     navigator.serviceWorker.controller === null) {
            //     await new Promise((resolve) => {
            //         navigator
            //             .serviceWorker
            //             .addEventListener('controllerchange', resolve, { once: true });
            //         // Timeout fallback so we don't hang forever
            //         setTimeout(resolve, 1000);
            //     });
            // }
            await verifySignal();
            await delay(500)
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


    // RENDER UIs
    // Conditionally render the splash UI
    if (!mounted || loginStatus === "PENDING") {
        return <Splash />;
    }
    // Conditionally render the offline UI
    if ((isOffline || isUnstableNetwork) && loginStatus === "UNKNOWN") {
        return <Offline />;
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
