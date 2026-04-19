import axios from "axios";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export const getUser = async (address: string) => {
  const user = await axios.get(
    `${API_ENDPOINT}/api/auth/user/${address.toLowerCase()}`,
  );
  return user;
};

export const getUserDashboard = async (address: string) => {
  const userDashboard = await axios.get(
    `${API_ENDPOINT}/api/user/dashboard/${address.toLowerCase()}`,
  );
  return userDashboard;
};

export const getUserAssets = async (address: string) => {
  console.log(address);
  const userAssets = await axios.get(
    `${API_ENDPOINT}/api/assets/user/${address.toLowerCase()}`,
  );
  console.log(userAssets);
  return userAssets;
};

export const createUser = async (
  address: string,
  name: string,
  email: string,
) => {
  const user = await axios.post(`${API_ENDPOINT}/api/auth/connect-wallet`, {
    walletAddress: address,
    name,
    email,
  });
  return user;
};

// Getting assets

export const getAssets = async () => {
  console.log("Getting assets");
  const assets = await axios.get(`${API_ENDPOINT}/api/assets`);
  console.log("hsdshd", `${API_ENDPOINT}/api/assets`);
  return assets;
};

export const getAsset = async (id: string) => {
  const asset = await axios.get(`${API_ENDPOINT}/api/assets/${id}`);
  return asset;
};

export const getUnclaimedassets = async () => {
  const asset = await axios.get(`${API_ENDPOINT}/api/assets/unclaimed`);
  return asset;
};
export const getTokenizedassets = async () => {
  const asset = await axios.get(`${API_ENDPOINT}/api/assets/tokenized`);
  return asset;
};

export const claimAsset = async (data: {
  id: string;
  address: string;
  documents: File[];
}) => {
  const asset = await axios.post(
    `${API_ENDPOINT}/api/assets/${data.id}/claim`,
    {
      walletAddress: data.address,
      documents: data.documents,
    },
  );
  return asset;
};

export const tokenizeAsset = async (data: {
  id: string;
  address: string;
  tokenSupply: number;
  price_per_token: number;
  userSignature: string;
}) => {
  const asset = await axios.post(
    `${API_ENDPOINT}/api/assets/${data.id}/tokenize`,
    {
      tokenSupply: data.tokenSupply,
      pricePerToken: data.price_per_token,
      walletAddress: data.address,
      userSignature: data.userSignature,
    },
  );
  return asset;
};

export const register = async (param: {
  name: string;
  description: string;
  estimatedValue: number;
  ownerWallet: string;
  category?: string;
  location?: {
    address: string;
    city: string;
    state: string;
  };
  propertyDetails?: string;
  images?: File[] | null;
}) => {
  const formData = new FormData();
  let imageLink: string = "";
  if (param.images) {
    formData.append("image", param.images[0]);
    console.log(formData);
    const key = "46794aea07a79f36db81f3046adc76b3";
    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${key}`,
      formData,
    );
    console.log(res);
    imageLink = res.data.data.url;
  }

  const user = await axios.post(`${API_ENDPOINT}/api/assets/register`, {
    name: param.name,
    description: param.description,
    estimatedValue: param.estimatedValue,
    ownerWallet: param.ownerWallet,
    category: param.category,
    location: {
      address: param.location?.address,
      city: param.location?.city,
      state: param.location?.state,
    },
    propertyDetails: param.propertyDetails,
    images: [imageLink],
  });
  console.log(imageLink);
  return user;
};

export const create_payment = async (
  id: string,
  params: {
    evm_wallet_address: string;
    stellar_wallet_address?: string;
    token_amount: number;
    gateway: "STELLAR" | "EVM";
  },
) => {
  const paymentObject = await axios.post(
    `${API_ENDPOINT}/api/assets/${id}/create_payment`,
    params,
  );
  return paymentObject;
};
export const confirm_purchase = async (
  id: string,
  params: {
    evm_wallet_address: string;
    stellar_wallet_address?: string;
    hash: string;
    memo: string;
  },
) => {
  const purchaseReceipt = await axios.post(
    `${API_ENDPOINT}/api/assets/${id}/confirm_purchase`,
    params,
  );
  console.log(purchaseReceipt);
  return purchaseReceipt.data;
};
