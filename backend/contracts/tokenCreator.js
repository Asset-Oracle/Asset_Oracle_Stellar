import {
  Contract,
  Wallet,
  JsonRpcProvider,
  AbiCoder,
  keccak256,
  parseEther,
  getBytes,
  Interface,
} from "ethers";
import { tokenCreatorAbi } from "./abi.js";

import * as Stellar from "@stellar/stellar-sdk";

const contractAddress = process.env.CONTRACT_ADDRESS;
const stellar_api = process.env.STELLAR_API;
const RPC_URL = process.env.RPC_URL;
const provider = new JsonRpcProvider(RPC_URL);
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const wallet = new Wallet(PRIVATE_KEY, provider);

export async function TokenizeAsset(
  tokenSupply,
  price_per_token,
  owner_address,
  user_signature,
) {
  const contract = new Contract(contractAddress, tokenCreatorAbi.abi, wallet);
  const nonce = await contract.get_current_nonce();
  const total_supply = parseEther(tokenSupply.toString());
  const ppt = parseEther(price_per_token.toString());

  const backend_packed = new AbiCoder().encode(
    ["address", "uint256", "uint256", "uint256", "address"],
    [
      owner_address,
      total_supply,
      ppt,
      Number(nonce) + 1,
      contractAddress.toLowerCase(),
    ],
  );

  const backend_hash = keccak256(backend_packed); // bytes32
  const backend_signature = await wallet.signMessage(getBytes(backend_hash));

  const mint = await contract.mint(
    owner_address,
    total_supply,
    ppt,
    Number(nonce) + 1,
    "",
    backend_signature,
    user_signature,
  );

  const receipt = await mint.wait();
  if (receipt && receipt.hash) {
    const data = await getEvents(receipt);
    return data;
  }
  return null;
}

export async function Transfer_Token(id, wallet_address, amount) {
  const contract = new Contract(contractAddress, tokenCreatorAbi.abi, wallet);
  const transfer = await contract.safeTransferFrom(
    wallet.address,
    wallet_address,
    id,
    BigInt(amount),
    "0x",
  );
  const receipt = await transfer.wait(1);
  return receipt;
}

export async function getTransaction(hash, gateway) {
  if (gateway === "STELLAR") {
    return await getStellarTransaction(hash);
  } else if (gateway === "EVM") {
    return await getEvmTransaction(hash);
  } else {
    throw new Error("Unsupported gateway");
  }
}

async function getStellarTransaction(hash) {
  const server = new Stellar.Horizon.Server(stellar_api);
  try {
    const payments = await server.payments().forTransaction(hash).call();

    const payment = payments.records[0]; // Most common case

    if (!payment || payment.asset_type !== "native") {
      throw new Error("Not a valid XLM payment");
    }
    console.log("Payment Details:", {
      sender: payment.from,
      receiver: payment.to,
      amount: payment.amount,
      txHash: hash,
      createdAt: payment.created_at,
      successful: payment.transaction_successful,
    });
    return [payment.from, payment.to, payment.amount];
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
}

async function getEvmTransaction(hash) {
  const receipt = await provider.getTransactionReceipt(hash);
  const data = await getPurchaseTokenEvents(receipt);
  return data;
}

async function getEvents(receipt) {
  const abi = [
    "event AssetMinted(address _owner, uint256 token_id , uint256 total_supply, string _uri)",
  ];

  const iface = new Interface(abi);

  const events = receipt.logs
    .map((log) => {
      try {
        return iface.parseLog(log);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  return events[0]?.args;
}

async function getPurchaseTokenEvents(receipt) {
  const abi = [
    "event AssetPurchased(address from, address to, uint256 token_id, uint256 amount, uint256 ethVale)",
  ];

  const iface = new Interface(abi);

  const events = receipt.logs
    .map((log) => {
      try {
        return iface.parseLog(log);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  return events[0]?.args;
}
