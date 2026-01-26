"use client";

import { ModalProps } from "./components/Modal";

export type LoginStatus = "UNKNOWN" | "AUTHENTICATED" | "UNAUTHENTICATED";

export type NetworkStatus = "STABLE" | "UNSTABLE" | "OFFLINE";

export type Direction = "left" | "right" | "up" | "down";

export type GenericObject<T> = {
  [key: string]: T | GenericObject<T>;
};

export interface IUser {
  _id: string;
  email?: string;
  isEmailVerified?: boolean;
  password?: string; // Often excluded on frontend for security
  phoneNumber?: string;
  isPhoneVerified?: boolean;
  verificationCode?: string;
  verificationExpiry?: string | Date;
  username?: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  profileImage?: string;
  coverImage?: string;
  about?: string;
  location?: string;
  worksAt?: string;
  relationship?: string;
  occupation?: string;
  interests?: any[]; // could also be string[]
  followers?: string[];
  following?: string[];
  onboardingStep?: string | null;
  country?: string | null;
  state?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Post {
  _id: string;
  authorId: string;
  content: string;
  postImage: string | null;
  likeCount: number;
  likedByMe: boolean;
  createdAt: number;
  status: "ACTIVE" | "DELETED";
}

export interface NavItem {
  title?: string;
  element?: React.ReactNode;
  url?: string;
  action?: () => void;
}

export interface NavBarProps {
  setLastPage: (page: Page) => void;
  list: NavItem[];
}

export interface ListItemType {
  item: React.ReactNode | string;
  action?: () => void | null;
}

export interface ModalContent extends ModalProps {
  source?: string;
}

export type SnackbarStatus = "SUCCESS" | "ERROR" | "INFO" | "WARNING" | null;

export interface MsgType {
  id?: number;
  title?: string | null;
  content?: string | null;
  msgStatus?: SnackbarStatus;
  behavior?: "FIXED" | "TIMED";
  duration?: number;
  hasClose?: boolean;
  cta?: {
    label: string;
    action: () => void;
  };
}

export interface SnackBarMsg {
  messgages?: MsgType[];
  defaultDur: number;
  dir?: Direction;
}

export interface SingleResponse<T> {
  message: string;
  payload: T | null;
  status: SnackbarStatus;
}

export interface ListResponse<T> {
  message: string;
  payload?: T[] | null;
  status: SnackbarStatus;
}

export interface InputValidation {
  status: "valid" | "invalid";
  message: string;
}

export interface Step {
  name: string;
  element: React.ReactNode;
  action?: () => void;
  allowPrevious?: boolean;
}

export interface Page {
  title: string;
  path: string;
}
