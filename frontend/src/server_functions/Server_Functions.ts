import axios from "axios";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
export const GetUserInfo = async (uid: string) => {
  const userinfo = await axios.get(`${API_ENDPOINT}/api/user/${uid}`);
  return userinfo;
};
export const getUser = async (address: string) => {
  const user = await axios.get(
    `${API_ENDPOINT}/api/auth/user/${address.toLowerCase()}`,
  );
  return user;
};

export const getUserDashboard = async (email: string) => {
  const userDashboard = await axios.get(
    `${API_ENDPOINT}/api/user/dashboard/${email.toLowerCase()}`,
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
  email: string;
  documents: File[];
}) => {
  const asset = await axios.post(
    `${API_ENDPOINT}/api/assets/${data.id}/claim`,
    {
      email: data.email,
      documents: data.documents,
    },
  );
  return asset;
};

export const tokenizeAsset = async (data: {
  id: string;
  email: string;
  address: string;
  tokenSupply: number;
  price_per_token: number;
}) => {
  const asset = await axios.post(
    `${API_ENDPOINT}/api/assets/${data.id}/tokenize`,
    {
      tokenSupply: data.tokenSupply,
      pricePerToken: data.price_per_token,
      email: data.email,
      walletAddress: data.address,
    },
  );
  return asset;
};

export const register = async (param: {
  name: string;
  description: string;
  estimatedValue: number;
  email: string;
  category?: string;
  location?: {
    address: string;
    city: string;
    state: string;
  };
  propertyDetails: File[];
  images: File[];
}) => {
  const formData = new FormData();

  formData.append("name", param.name);
  formData.append("description", param.description);
  formData.append("estimatedValue", param.estimatedValue.toString());
  formData.append("email", param.email);

  if (param.category) formData.append("category", param.category);

  // Send location as individual fields or a clean string
  if (param.location) {
    formData.append("location[address]", param.location.address);
    formData.append("location[city]", param.location.city);
    formData.append("location[state]", param.location.state);
  }

  // Use brackets for arrays to help backend parsers
  param.propertyDetails.forEach((file) => {
    formData.append("propertyDetails", file);
  });

  param.images.forEach((file) => {
    formData.append("images", file);
  });

  return axios.post(`${API_ENDPOINT}/api/assets/register`, formData);
  // Note: Axios automatically sets the multipart header when it sees FormData
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
