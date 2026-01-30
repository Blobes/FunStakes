"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SnackBars } from "@/components/SnackBars";
import { useGlobalContext } from "./GlobalContext";
import { Modal, ModalRef } from "@/components/Modal";
import { useController } from "@/hooks/global";
import { delay } from "@/helpers/global";
import { useAuth } from "@/app/(auth)/authHook";
import { Offline } from "../components/Offline";
import { Splash } from "../components/Splash";
import { useSnackbar } from "@/hooks/snackbar";
import { registerSW } from "@/helpers/registerSW";

export const GlobalManager = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { verifyAuth } = useAuth();
    const modalRef = useRef<ModalRef>(null);
    const { openModal, verifySignal, isUnstableNetwork, isOffline } = useController();
    const { setSBMessage, removeMessage, } = useSnackbar();
    const { snackBarMsg, loginStatus, modalContent, lastPage,
        networkStatus } = useGlobalContext();
    const [mounted, setMounted] = useState(false);


    // SERVICE WORKER REGISTRATION
    useEffect(() => {
        registerSW()
    }, []);

    // MOUNT & INITIAL AUTH CHECK
    useEffect(() => {
        setMounted(true);
        const init = async () => {
            await delay(3000)
            verifySignal();
            verifyAuth();
        }
        init();
    }, [networkStatus]);

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

    // BROWSER EVENTS
    useEffect(() => {
        const handleOnline = async () => {
            removeMessage(1);
            verifySignal();
            verifyAuth();
        };

        const handleOffline = async () => {
            setSBMessage({
                msg: {
                    id: 1,
                    title: "No internet connection",
                    content: "Refresh the page.",
                    msgStatus: "ERROR",
                    behavior: "FIXED",
                    hasClose: true,
                    cta: {
                        label: "Refresh",
                        action: () => router.refresh(),
                    },
                },
            });
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [pathname, lastPage, loginStatus,]);

    if (!mounted || loginStatus === "PENDING") {
        return <Splash />;
    }

    if ((isOffline || isUnstableNetwork) && loginStatus === "UNKNOWN") {
        return <Offline />;
    }

    return (
        <>
            {children}
            {snackBarMsg.messages && <SnackBars snackBarMsg={snackBarMsg} />}
            {modalContent && <Modal ref={modalRef} {...modalContent} />}
        </>
    );
};
