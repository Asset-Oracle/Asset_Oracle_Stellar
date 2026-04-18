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

const contractAddress = process.env.CONTRACT_ADDRESS;
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

export async function getTransaction(hash) {
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
