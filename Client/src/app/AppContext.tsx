"use client";

import React, { createContext, useContext, useState } from "react";
import {
  IUser,
  SnackBarMsg,
  LoginStatus,
  ModalContent,
  Page,
  NetworkStatus,
} from "@/types";
import { clientRoutes } from "@/helpers/info";

interface AppContextType {
  loginStatus: LoginStatus;
  setLoginStatus: React.Dispatch<React.SetStateAction<LoginStatus>>;
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
  modalContent: ModalContent | null;
  setModalContent: React.Dispatch<React.SetStateAction<ModalContent | null>>;
  networkStatus: NetworkStatus;
  setNetworkStatus: React.Dispatch<React.SetStateAction<NetworkStatus>>;
}

const context = createContext<AppContextType | null>(null);
export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loginStatus, setLoginStatus] = useState<LoginStatus>("PENDING");
  const [authUser, setAuthUser] = useState<IUser | null>(null);
  const [snackBarMsg, setSnackBarMsg] = useState<SnackBarMsg>({
    messgages: [],
    defaultDur: 5,
    dir: "up"
  });
  const [inlineMsg, setInlineMsg] = useState<string | null>(null);
  const [isGlobalLoading, setGlobalLoading] = useState(false);
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [lastPage, setPage] = useState<Page>(clientRoutes.about);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>("STABLE");

  return (
    <context.Provider
      value={{
        loginStatus,
        setLoginStatus,
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
        modalContent,
        setModalContent,
        networkStatus, setNetworkStatus
      }}>
      {children}
    </context.Provider>
  );
};
// Custom hook for consuming the context
export const useAppContext = () => {
  const appContext = useContext(context);
  if (!appContext) {
    throw new Error("useAppContext must be used within a ContextProvider");
  }
  return appContext;
};
