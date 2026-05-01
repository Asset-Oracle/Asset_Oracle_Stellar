import { use, useCallback, useEffect, useState } from "react";

import MenuBar from "../components/MenuBar";

import { useNavigate, useParams } from "react-router";
import type { AssetInfo } from "../hooks/useAssetQuery";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  claimAsset,
  getAsset,
  tokenizeAsset,
} from "../server_functions/Server_Functions";
import { modal, useAppKitAccount } from "@reown/appkit/react";
import {
  useSignMessage,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { encodeAbiParameters, keccak256, parseEther, toBytes } from "viem";
import { tokenCreatorAbi } from "../ABI/abi";
import PurchaseAsset from "../components/PurchaseAsset";
import { useActiveEVMAccount, useAuth } from "../Zustand/Store";
import InfoModal from "@/components/InfoModal";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

interface DashboardProps {
  sideBarOut: boolean;
}
function Asset({ sideBarOut }: DashboardProps) {
  const { id } = useParams(); // get the dynamic "id" from the URL
  const nav = useNavigate();
  const User = useAuth((state) => state.activeAccount);
  const [tokenPrice, setTokenPrice] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const [isMintable, setIsMintable] = useState(false);
  const [documentation, setDocumentation] = useState<File[]>([]);
  const [assetInfo, setAssetInfo] = useState<AssetInfo | null>(null);
  const [readyToPurchase, setReadyToPurchase] = useState(false);
  const account = useAppKitAccount();
  const [isSigningTx, setIsSigningTx] = useState(false);
  const [currentImage, setCurrentImage] = useState(assetInfo?.images[0]);
  const [tokenizedResponse, setTokenizedResponse] = useState("");

  useEffect(() => {
    console.log(currentImage);
  }, [currentImage]);

  const activeAccount = useActiveEVMAccount((state) => state.accout);

  const { data, error, refetch } = useQuery({
    queryKey: ["getAsset", id],
    queryFn: () => getAsset(id!),
    enabled: !!id,
  });

  const {
    data: claimData,
    error: claimError,
    isError: isClaimError,
    isSuccess: isClaimSuccess,
    mutate: Claim,
  } = useMutation({
    mutationKey: [
      "claim_asset",
      { id, email: User.email, documents: documentation },
    ],
    mutationFn: () =>
      claimAsset({
        id: id || "",
        email: User.email,
        documents: documentation || [],
      }),
  });
  const {
    data: tokenizedData,
    error: tokenizedError,
    isError,
    isSuccess,
    mutate: Tokenize,
  } = useMutation({
    mutationKey: [
      "tokenize_asset",
      {
        id,
        address: activeAccount?.address,
        tokenSupply: Number(tokenSupply),
        price_per_token: Number(tokenPrice),
        signature: "",
      },
    ],
    mutationFn: () =>
      tokenizeAsset({
        id: id || "",
        email: User.email,
        address: activeAccount?.address!,
        tokenSupply: Number(tokenSupply),
        price_per_token: Number(tokenPrice),
      }),
  });

  const {
    data: user_signature,
    error: signatureError,
    mutateAsync: signMessage,
  } = useSignMessage();

  const handleSignMessage = useCallback(async () => {
    if (!activeAccount.address) return;

    Tokenize();
  }, [activeAccount.address, tokenSupply, tokenPrice]);

  useEffect(() => {
    if (data) {
      setAssetInfo(data.data.data);
      setCurrentImage(data.data.data.images[0]);
    }

    //setAssetInfo(asset || null); // Set the asset info or null if not found
  }, [data]);

  const handleClaim = () => {
    if (documentation?.length <= 0) {
      alert("upload a file");
      return;
    }
    Claim();
  };

  useEffect(() => {
    if (claimData) {
      console.log("claimed success", claimData);
      refetch();
      setTokenizedResponse("Successfully Claimed this Asset");
    }
    if (claimError) {
      setTokenizedResponse("Error while claiming asset");
      console.log(claimError);
    }
    if (tokenizedData) {
      setTokenizedResponse("Asset successfully tokenized");
      refetch();
    }
    if (tokenizedError) {
      console.log(tokenizedError);
      setTokenizedResponse("Error while Tokenizing asset");
    }
  }, [claimData, claimError, tokenizedData, tokenizedError]);

  useEffect(() => {
    if (signatureError) {
      const msg = signatureError.message.split(" ");
      if (
        msg[0].toLowerCase() === "connector" &&
        msg[1].toLowerCase() === "not"
      ) {
        alert("Connect Wallet");
        console.log(signatureError.message);
        modal?.open();
        setIsSigningTx(true);
      } else {
        alert("error signing message");
        setIsSigningTx(false);
      }
    }
    if (user_signature) {
      console.log(user_signature);
      setIsSigningTx(false);
      alert("message signed successfully");
    }
  }, [user_signature, signatureError, activeAccount.address]);

  useEffect(() => {
    if (account.address && isSigningTx) {
      handleSignMessage();
    }
  }, [isSigningTx, account.address]);

  const page3 = () => {
    return (
      <>
        <div>
          <h2 className="text-xl !text-black font-semibold">
            Upload Documentation
          </h2>
        </div>
        <div className="mt-5 ">
          <div className="mb-5">
            <p>
              Upload ownership proof, valuation reports, certifications, and
              legal documentation
            </p>
            <div className="mt-5">
              <label className="border border-[#e2e8f0] rounded-md w-full px-4 py-3 cursor-pointer flex justify-between items-center hover:bg-gray-50 transition">
                <span className="text-gray-400">Upload Document</span>

                <span className="text-sm text-indigo-600">Browse</span>

                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    setDocumentation(files ? Array.from(files) : []);
                  }}
                />
              </label>
            </div>
            <div className="mt-5">
              {documentation &&
                documentation.map((file, index) => (
                  <p key={index} className="text-sm">
                    {file.name}
                  </p>
                ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  const page4 = () => {
    return (
      <>
        <div>
          <h2 className="text-xl !text-black font-semibold">
            Tokenization Configuration
          </h2>
        </div>
        <div className="mt-5 ">
          <div className="mb-5">
            <p className="mb-3">Total Token Supply *</p>
            <input
              type="number"
              placeholder="1000"
              className="border !border-[#e2e8f0] rounded-md w-full mb-3"
              value={tokenSupply}
              onChange={(e) => setTokenSupply(e.target.value)}
            />
            <p className="text-sm">
              Total number of tokens to be created for this asset
            </p>
          </div>

          <div className="mb-5">
            <p className="mb-3">Price per Token (USD) *</p>
            <input
              type="text"
              placeholder="100.00"
              className="border !border-[#e2e8f0] rounded-md w-full mb-3"
              value={tokenPrice}
              onChange={(e) => setTokenPrice(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <p className="mb-3">Expected Annual Yield (%)</p>
            <input
              type="text"
              placeholder="5.0"
              className="border !border-[#e2e8f0] rounded-md w-full mb-3"
            />
            <p className="text-sm">
              Expected annual yield percentage for this asset
            </p>
            <p className="mt-5">Is Mintable</p>
            <p className="text-sm text-gray-500">
              if more supply can be added to this asset
            </p>
            <input
              className="scale-130"
              type="checkbox"
              checked={isMintable}
              onChange={(e) => setIsMintable(e.target.checked)}
            />
          </div>
          <button onClick={handleSignMessage}>Tokenize Asset</button>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="flex">
        <MenuBar />
        <div className="text-black h-full w-[100%] lg:ml-[300px] py-10">
          <div className=" text-black pt-25 flex flex-col items-start justify-center ml-10">
            <div className="flex flex-col ">
              <button
                onClick={() => {
                  nav("/marketplace");
                }}
              >
                Back to marketplace
              </button>
            </div>
          </div>
          <div className="m-10">
            {assetInfo ? (
              <div className="flex gap-5">
                <div className="w-full lg:w-[80%]">
                  <div className="border border-[#e2e8f0] shadow-md p-5 rounded-md">
                    <img
                      src={
                        currentImage
                          ? currentImage
                          : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
                      }
                      alt={assetInfo?.name || "Asset"}
                      className="w-full h-[450px] object-cover rounded-lg mb-4"
                    />
                    <div className="flex h-[200px] gap-5 my-5 w-full max-w-full overflow-x-auto">
                      {assetInfo.images.map((src, index) => (
                        <img
                          onClick={() => {
                            setCurrentImage(src);
                          }}
                          key={index}
                          src={src}
                          alt={index.toString()}
                          className="rounded-md"
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-md font-semibold">
                          {assetInfo?.category}
                        </h2>
                        <h2 className="text-2xl font-bold">
                          {assetInfo?.name}
                        </h2>
                        <p className="text-gray-500">{`${assetInfo?.location.address}, ${assetInfo.location.city}, ${assetInfo.location.state}`}</p>
                      </div>
                    </div>
                  </div>
                  {assetInfo.verification_status === "UNCLAIMED" && (
                    <div className="border border-[#e2e8f0] shadow-md p-5 rounded-md mt-10">
                      {page3()}
                      <button onClick={handleClaim}>Claim Asset</button>
                    </div>
                  )}

                  <div className=" mt-10 lg:hidden border border-[#e2e8f0] shadow-md p-5 rounded-md">
                    <h2 className="text-md font-semibold">Key Metrics</h2>
                    <div className="mt-3">
                      <p>Valuation</p>
                      <h2 className="text-xl font-bold">
                        {assetInfo?.estimated_value}
                      </h2>
                    </div>

                    <div className="mt-3">
                      <p>Token price</p>
                      <h2 className="text-xl font-bold">
                        $
                        {assetInfo.price_per_token
                          ? assetInfo.price_per_token
                          : 0}
                      </h2>
                    </div>

                    <div className="mt-3">
                      <p>Token Available</p>
                      <h2 className="text-xl font-bold">
                        {assetInfo.tokens_available
                          ? assetInfo.tokens_available
                          : 0.0}{" "}
                        /{" "}
                        {assetInfo.token_supply ? assetInfo.token_supply : 0.0}
                      </h2>
                      <button
                        onClick={() => setReadyToPurchase(true)}
                        className="mt-3"
                      >
                        Purchase Asset
                      </button>
                    </div>
                  </div>

                  <div className="border border-[#e2e8f0] shadow-md p-5 rounded-md mt-10">
                    <h2 className="text-md font-semibold">Ai analysis</h2>
                    <p className="text-sm mt-3 text-gray-500">
                      Ai analysis for this asset
                    </p>

                    <div>
                      {Object.entries(
                        assetInfo.ai_analysis ? assetInfo.ai_analysis : {},
                      ).map(([key, value], index) => (
                        <div
                          key={index}
                          className="border border-gray-300 rounded-md p-3 mt-3 flex justify-between item-center"
                        >
                          <h3 className="font-semibold">{key}</h3>
                          <p className="text-sm text-gray-500">
                            {value as any}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {assetInfo.verification_status !== "TOKENIZED" &&
                    User.email === assetInfo.email && (
                      <div className="border border-[#e2e8f0] shadow-md p-5 rounded-md mt-10">
                        {page4()}
                      </div>
                    )}

                  <div className="border border-[#e2e8f0] shadow-md p-5 rounded-md mt-10">
                    <h2 className="text-md font-semibold">Property details</h2>
                    <p className="text-sm mt-3 text-gray-500">
                      Asset information aggregated from verified sources
                    </p>

                    <div>
                      {Object.entries(assetInfo.property_details).map(
                        ([key, value], index) => (
                          <div
                            key={index}
                            className="border border-gray-300 rounded-md p-3 mt-3"
                          >
                            <h3 className="font-semibold">{key}</h3>
                            <p className="text-sm text-gray-500">
                              {value as any}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block border border-[#e2e8f0] shadow-md p-5 h-[50%] rounded-md">
                  <h2 className="text-md font-semibold">Key Metrics</h2>
                  <div className="mt-3">
                    <p>Valuation</p>
                    <h2 className="text-xl font-bold">
                      {assetInfo?.estimated_value}
                    </h2>
                  </div>

                  <div className="mt-3">
                    <p>Token price</p>
                    <h2 className="text-xl font-bold">
                      $
                      {assetInfo.price_per_token
                        ? assetInfo.price_per_token
                        : 0}
                    </h2>
                  </div>

                  <div className="mt-3">
                    <p>Token Available</p>
                    <h2 className="text-xl font-bold">
                      {assetInfo.tokens_available
                        ? assetInfo.tokens_available
                        : 0.0}{" "}
                      / {assetInfo.token_supply ? assetInfo.token_supply : 0.0}
                    </h2>
                    <button
                      onClick={() => setReadyToPurchase(true)}
                      className="mt-5"
                    >
                      Purchase Asset
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {error ? (
                  <p>Error loading asset</p>
                ) : (
                  <p className="text-3xl">loading assets</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <PurchaseAsset
        readyToPurchase={readyToPurchase}
        setReadyToPurchase={setReadyToPurchase}
        asset_id={id as string}
        refresh={refetch}
      />

      <InfoModal
        message={tokenizedResponse}
        isError={isError || isClaimError}
        isSuccess={isSuccess || isClaimSuccess}
        setMessage={setTokenizedResponse}
      />
    </>
  );
}
export default Asset;
