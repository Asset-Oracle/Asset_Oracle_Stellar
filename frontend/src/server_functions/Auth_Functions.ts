import axios from "axios";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export const Login = async (params: { email: string; password: string }) => {
  const retrived_user = await axios.post(
    `${API_ENDPOINT}/api/auth/login`,
    params,
  );
  return retrived_user;
};

export const Register = async (params: {
  email: string;
  password: string;
  name: string;
}) => {
  const created_user = await axios.post(
    `${API_ENDPOINT}/api/auth/register`,
    params,
  );
  return created_user;
};
