import { create } from "zustand";

type AuthType = {
  isAuthenticated: boolean | undefined;
  activeAccount: { username: string; email: string; address: string };
  setAuth: (data: { username: string; email: string; address: string }) => void;
  setIsAuthenticated: (value: boolean) => void;
};

type WalletAccountType = {
  accout: { address: string };
  setAccount: (value: string) => void;
};

export const useAuth = create<AuthType>((set) => ({
  isAuthenticated: undefined,
  activeAccount: { username: "", email: "", address: "" },
  setAuth: (data: { username: string; email: string; address: string }) =>
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
