"use client";

import React, { createContext, useContext, useState } from "react";
import {
  IUser,
  SnackBarMsg,
  AuthStatus,
  DrawerContent,
  Page,
  NetworkStatus,
} from "@/types";
import { clientRoutes } from "@/helpers/routes";
import { ModalProps } from "@/components/Modal";

interface Context {
  authStatus: AuthStatus;
  setAuthStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
  authUser: IUser | null;
  setAuthUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  snackBarMsg: SnackBarMsg;
  setSnackBarMsg: React.Dispatch<React.SetStateAction<SnackBarMsg>>;
  inlineMsg: string | null;
  setInlineMsg: React.Dispatch<React.SetStateAction<string | null>>;
  isGlobalLoading: boolean;
  setGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isAuthLoading: boolean;
  setAuthLoading: React.Dispatch<React.SetStateAction<boolean>>;
  lastPage: Page;
  setPage: React.Dispatch<React.SetStateAction<Page>>;
  drawerContent: DrawerContent | null;
  setDrawerContent: React.Dispatch<React.SetStateAction<DrawerContent | null>>;
  modalContent: DrawerContent | null;
  setModalContent: React.Dispatch<React.SetStateAction<DrawerContent | null>>;
  networkStatus: NetworkStatus;
  setNetworkStatus: React.Dispatch<React.SetStateAction<NetworkStatus>>;
  checkingSignal: boolean;
  setSignalCheck: React.Dispatch<React.SetStateAction<boolean>>;
  offlineMode: boolean;
  setOfflineMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const context = createContext<Context | null>(null);
export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("PENDING");
  const [authUser, setAuthUser] = useState<IUser | null>(null);
  const [snackBarMsg, setSnackBarMsg] = useState<SnackBarMsg>({
    messages: [],
    defaultDur: 5,
    dir: "up"
  });
  const [inlineMsg, setInlineMsg] = useState<string | null>(null);
  const [isGlobalLoading, setGlobalLoading] = useState(false);
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [lastPage, setPage] = useState<Page>(clientRoutes.home);
  const [drawerContent, setDrawerContent] = useState<DrawerContent | null>(null);
  const [modalContent, setModalContent] = useState<ModalProps | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>("UNKNOWN");
  const [checkingSignal, setSignalCheck] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  return (
    <context.Provider
      value={{
        authStatus,
        setAuthStatus,
        authUser,
        setAuthUser,
        snackBarMsg,
        setSnackBarMsg,
        inlineMsg,
        setInlineMsg,
        isGlobalLoading,
        setGlobalLoading,
        isAuthLoading,
        setAuthLoading,
        lastPage: lastPage,
        setPage,
        drawerContent,
        setDrawerContent,
        modalContent,
        setModalContent,
        networkStatus,
        setNetworkStatus,
        checkingSignal,
        setSignalCheck,
        offlineMode,
        setOfflineMode
      }}>
      {children}
    </context.Provider>
  );
};
// Custom hook for consuming the context
export const useGlobalContext = () => {
  const globalContext = useContext(context);
  if (!globalContext) {
    throw new Error("useAppContext must be used within a ContextProvider");
  }
  return globalContext;
};
