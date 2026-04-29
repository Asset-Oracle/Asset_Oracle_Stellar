import { useCallback, useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { tokenCreatorAbi } from "../ABI/abi";
import { parseEther } from "viem";
import { useMutation } from "@tanstack/react-query";
import { useAppKitAccount } from "@reown/appkit/react";
import {
  confirm_purchase,
  create_payment,
} from "../server_functions/Server_Functions";
import { useSendXLM } from "../hooks/useSendXlm";
import { useActiveEVMAccount, useActiveStellarAccount } from "../Zustand/Store";
import InfoModal from "./InfoModal";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

interface PurchaseassetProp {
  asset_id: string;
  readyToPurchase: boolean;
  setReadyToPurchase: (value: boolean) => void;
  refresh: () => void;
}

export default function PurchaseAsset({
  asset_id,
  readyToPurchase,
  setReadyToPurchase,
  refresh,
}: PurchaseassetProp) {
  const activeAccount = useAppKitAccount();
  const [assetPurchaseAmount, setAssetPurchaseAmount] = useState(0);
  const [currentMemo, setCurrentMemo] = useState("");
  const [selectedOption, setSelectedOption] = useState("card");
  const account = useActiveStellarAccount((state) => state.accout);
  const [purchaseResponse, setPurchaseResponse] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);

  const {
    data: purchaseData,
    error: purchaseError,
    mutate: Purchase,
  } = useWriteContract();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: purchaseData, // Automatically waits when hash appears
    confirmations: 1, // Optional: how many confirmations to wait for
    // timeout: 60_000,      // Optional: timeout in ms
  });
  const handleassetPurchase = useCallback(
    (token_number: number, ethPrice: number) => {
      if (assetPurchaseAmount <= 0) return;
      console.log("Purchasing");

      // Handle EVM purchase logic here
      console.log("EVM purchase selected", assetPurchaseAmount);
      Purchase({
        address: CONTRACT_ADDRESS.toLowerCase() as `0x${string}`,
        abi: tokenCreatorAbi.abi,
        args: [token_number, parseEther(assetPurchaseAmount.toString())],
        functionName: "purchaseToken",
        value: BigInt(ethPrice),
        gas: 8_000_000n,
      });
    },
    [assetPurchaseAmount, selectedOption],
  );

  const {
    data: createdPaymentData,
    error: createdPaymentError,
    mutate: CreatePayment,
  } = useMutation({
    mutationKey: ["create_payment", asset_id],
    mutationFn: () =>
      create_payment(asset_id, {
        evm_wallet_address: activeAccount.address!,
        stellar_wallet_address: account.address,
        token_amount: assetPurchaseAmount,
        gateway: "EVM",
      }),
  });

  const {
    data: confirmPaymentData,
    error: confirmPaymentError,
    isError,
    isSuccess,
    mutate: ConfirmPayment,
  } = useMutation({
    mutationKey: ["confirm_payments", asset_id],
    mutationFn: (hash: string) =>
      confirm_purchase(asset_id, {
        evm_wallet_address: activeAccount.address!,
        stellar_wallet_address: account.address,
        hash,
        memo: currentMemo,
      }),
  });

  const handleCreatePayment = useCallback(() => {
    if (selectedOption === "Evm" && !activeAccount.address) {
      alert("Please connect your EVM wallet");
      return;
    }
    if (selectedOption === "Stellar" && !account.address) {
      alert("Please connect your Stellar wallet");
      return;
    }
    CreatePayment();
  }, [selectedOption, activeAccount.address, account.address]);

  useEffect(() => {
    if (createdPaymentData) {
      console.log("data : ", createdPaymentData);
      setCurrentMemo(createdPaymentData.data.data.memo);
      handleassetPurchase(
        createdPaymentData.data.data.token_number,
        createdPaymentData.data.data.amount,
      );
    }
    if (createdPaymentError) {
      console.log("error : ", createdPaymentError);
    }
  }, [createdPaymentData, createdPaymentError]);

  useEffect(() => {
    if (receipt) {
      console.log("Purchase Data : ", receipt);
      ConfirmPayment(receipt.transactionHash);
      setCurrentMemo("");
    }
    if (purchaseError) {
      console.log("Purchase Error : ", purchaseError);
    }
    if (confirmError) {
      console.log("Confirm Error : ", confirmError);
    }
  }, [receipt, purchaseError, confirmError]);

  useEffect(() => {
    if (confirmPaymentData) {
      setPurchaseResponse("Purchase Successful");
      refresh();
    }
    if (confirmPaymentError) {
      setPurchaseResponse("Purchase UnSuccessful");
    }
  }, [confirmPaymentData, confirmPaymentError]);

  return (
    <>
      {readyToPurchase && (
        <div className="fixed w-[100%] h-[50%] flex justify-center left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
          <div className="lg:ml-[150px] bg-[#4f46e5] items-center justify-center w-[50%] p-3 rounded-md flex flex-col">
            <input
              className="w-[80%] bg-white text-black font-bold p-2 border border-white rounded-md"
              type="number"
              value={assetPurchaseAmount}
              onChange={(e) => {
                setAssetPurchaseAmount(Number(e.target.value));
              }}
            />

            <div className="flex gap-10 items-center justify-center">
              <button
                onClick={() => setReadyToPurchase(false)}
                className=" text-white! font-bold! mt-15 bg-red-400! text-white py-2 px-4 rounded-md"
              >
                Close
              </button>
              <button
                onClick={handleCreatePayment}
                className=" text-[#4f46e5]! font-bold! mt-15 bg-gray-100! text-white py-2 px-4 rounded-md"
              >
                {isPurchasing ? "Purchasing ..." : "Purchase"}
              </button>
            </div>
          </div>
        </div>
      )}
      <InfoModal
        message={purchaseResponse}
        isError={isError}
        isSuccess={isSuccess}
        setMessage={setPurchaseResponse}
      />
    </>
  );
}
