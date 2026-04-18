import { modal } from "@reown/appkit/react";
import { setAllowed } from "@stellar/freighter-api";
import { useActiveEVMAccount, useActiveStellarAccount } from "../Zustand/Store";
import { useState } from "react";

export default function ConnectWallet() {
  const [open, setOpen] = useState(false);
  const EvmAccount = useActiveEVMAccount((state) => state.accout);
  const StellerAccount = useActiveStellarAccount((state) => state.accout);
  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
        }}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
      >
        {EvmAccount.address || StellerAccount.address
          ? "Connected"
          : "Connect Wallet"}
      </button>
      {open && (
        <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-[#eef2ff] p-6 rounded-md shadow-lg w-[60%] h-auto flex flex-col gap-5 justify-center items-center min-h-[60%]">
          <h2>Choose a Wallet</h2>
          <div className="flex flex-col gap-7 justify-center items-center">
            <button
              onClick={() => {
                modal?.open();
              }}
            >
              {EvmAccount.address
                ? `Connected: ${EvmAccount.address.slice(0, 6)}...${EvmAccount.address.slice(-4)}`
                : "EVM Wallet"}
            </button>
            <button onClick={setAllowed}>
              {" "}
              {StellerAccount.address
                ? `Connected: ${StellerAccount.address.slice(0, 6)}...${StellerAccount.address.slice(-4)}`
                : "Stellar Wallet"}
            </button>

            <button
              onClick={() => {
                setOpen(false);
              }}
              className="w-[100px] bg-red-500!"
            >
              close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
