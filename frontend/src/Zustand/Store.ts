import { create } from "zustand";

type SideBarType = {
  sideBarOut: boolean;
  setSideBarOut: (value: boolean) => void;
};

type AuthType = {
  isAuthenticated: boolean | undefined;
  activeAccount: { username: string; email: string; uid: string };
  setAuth: (data: { username: string; email: string; uid: string }) => void;
  setIsAuthenticated: (value: boolean) => void;
};

type WalletAccountType = {
  accout: { address: string };
  setAccount: (value: string) => void;
};

export const useAuth = create<AuthType>((set) => ({
  isAuthenticated: undefined,
  activeAccount: { username: "", email: "", uid: "" },
  setAuth: (data: { username: string; email: string; uid: string }) =>
    set((state) => ({ activeAccount: data })),
  setIsAuthenticated: (value: boolean) =>
    set((state) => ({ isAuthenticated: value })),
}));

export const useActiveEVMAccount = create<WalletAccountType>((set) => ({
  accout: { address: "" },
  setAccount: (value: string) =>
    set((state) => ({ accout: { address: value } })),
}));

export const useActiveStellarAccount = create<WalletAccountType>((set) => ({
  accout: { address: "" },
  setAccount: (value: string) =>
    set((state) => ({ accout: { address: value } })),
}));

export const useSideBar = create<SideBarType>((set) => ({
  sideBarOut: false,
  setSideBarOut: (value: boolean) => set((state) => ({ sideBarOut: value })),
}));
