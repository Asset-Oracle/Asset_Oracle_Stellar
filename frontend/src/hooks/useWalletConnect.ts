import { useAppKitAccount } from "@reown/appkit-controllers/react";
import { useEffect } from "react";
import { useActiveEVMAccount, useActiveStellarAccount } from "../Zustand/Store";
import { getAddress, isConnected } from "@stellar/freighter-api";

export const useEvmConnection = () => {
  const activeAccount = useActiveEVMAccount((state) => state.accout);
  const setActiveAccount = useActiveEVMAccount((state) => state.setAccount);
  const account = useAppKitAccount();
  const getEvmConnection = () => {
    // Logic to get EVM connection

    if (!account || !account.address) return;
    console.log("EVM Account Address:", account.address);
    const address = account.address;
    setActiveAccount(address);
  };

  useEffect(() => {
    getEvmConnection();
  }, [account.address]);

  return { getEvmConnection };
};

export const useStellarConnection = () => {
  // Logic to get Stellar connection
  const activeAccount = useActiveStellarAccount((state) => state.accout);
  const setActiveAccount = useActiveStellarAccount((state) => state.setAccount);
  const checkWalletInstalled = (async () => {
    if (await isConnected()) return (await isConnected()).isConnected;
    alert(
      "Please install the Freighter wallet extension to connect to Stellar.",
    );
    return false;
  })();

  const getStellarConnection = async () => {
    // Implement Stellar connection logic here
    const isWalletInStalled = await checkWalletInstalled;
    if (isWalletInStalled) {
      const address = await getAddress();
      if (address) {
        console.log("Stellar Account Address:", address);
        setActiveAccount(address.address);
      } else {
        console.error("Failed to retrieve Stellar account address.");
      }
    }
  };
  useEffect(() => {
    getStellarConnection();
  }, [activeAccount.address]);
  return { getStellarConnection };
};
