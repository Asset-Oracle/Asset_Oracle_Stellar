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
import { useActiveStellarAccount } from "../Zustand/Store";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

interface PurchaseassetProp {
  asset_id: string;
  readyToPurchase: boolean;
  setReadyToPurchase: (value: boolean) => void;
}

export default function PurchaseAsset({
  asset_id,
  readyToPurchase,
  setReadyToPurchase,
}: PurchaseassetProp) {
  const activeAccount = useAppKitAccount();
  const [assetPurchaseAmount, setAssetPurchaseAmount] = useState(0);
  const [currentMemo, setCurrentMemo] = useState("");
  const [selectedOption, setSelectedOption] = useState("card");
  const account = useActiveStellarAccount((state) => state.accout);

  const { sendXLM } = useSendXLM();

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
    (ethPrice: number) => {
      if (assetPurchaseAmount <= 0) return;
      console.log("Purchasing");
      if (selectedOption.toLowerCase() === "stellar") {
        // Handle Stellar purchase logic here
        console.log("Stellar purchase selected");
        sendXLM(
          account.address,
          "GB6LYIAOJOLIADDQCLPRTXWYMPYBQZCR57BTKQ35ZEKZDRK6K5H25DAW",
          "10",
          "djddhdy",
        ).then((res) => {
          if (res.successful) {
            alert("Payment Successful");
          } else {
            alert("Payment UnSuccessful");
          }
        });
      } else {
        // Handle EVM purchase logic here
        console.log("EVM purchase selected");
        Purchase({
          address: CONTRACT_ADDRESS.toLowerCase() as `0x${string}`,
          abi: tokenCreatorAbi.abi,
          args: [1, parseEther(assetPurchaseAmount.toString())],
          functionName: "purchaseToken",
          value: BigInt(ethPrice),
          gas: 8_000_000n,
        });
      }
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
        wallet_address: activeAccount.address!,
        token_amount: assetPurchaseAmount,
      }),
  });

  const {
    data: confirmPaymentData,
    error: confirmPaymentError,
    mutate: ConfirmPayment,
  } = useMutation({
    mutationKey: ["confirm_payments", asset_id],
    mutationFn: (hash: string) =>
      confirm_purchase(asset_id, {
        wallet_address: activeAccount.address!,
        hash,
        memo: currentMemo,
      }),
  });

  const handleCreatePayment = useCallback(() => {
    CreatePayment();
  }, []);

  useEffect(() => {
    if (createdPaymentData) {
      console.log("data : ", createdPaymentData);
      setCurrentMemo(createdPaymentData.data.data.memo);
      handleassetPurchase(createdPaymentData.data.data.amount);
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
      alert("Purchase Successful");
    }
    if (confirmPaymentError) {
      alert("Purchase UnSuccessful");
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
            <div className="mt-5 text-white!">
              <h2>Select Payment Method</h2>

              <label>
                <input
                  type="radio"
                  name="payment"
                  value="Evm"
                  checked={selectedOption === "Evm"}
                  onChange={(e) => setSelectedOption(e.target.value)}
                />
                EVM
              </label>

              <br />

              <label>
                <input
                  type="radio"
                  name="payment"
                  value="Stellar"
                  checked={selectedOption === "Stellar"}
                  onChange={(e) => setSelectedOption(e.target.value)}
                />
                Stellar
              </label>

              <p>Selected: {selectedOption}</p>
            </div>
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
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
