import { useMutation } from "@tanstack/react-query";
import { Login, Register } from "../server_functions/Auth_Functions";

export const useGetUserAccount = () => {};

export const useRegisterUser = () => {
  const {
    data: RegisteredUser,
    error: ErrorWhileRegistering,
    mutate: RegisterUser,
  } = useMutation({
    mutationKey: ["rgister_user"],
    mutationFn: (param: { email: string; password: string; name: string }) =>
      Register(param),
  });
  return {
    RegisterUser,
    RegisteredUser,
    ErrorWhileRegistering,
  };
};

export const useUserLogin = () => {
  const {
    data: LoggedInUser,
    error: ErrorWhileLoggingIn,
    mutate: UserLogin,
  } = useMutation({
    mutationKey: ["rgister_user"],
    mutationFn: (param: { email: string; password: string }) => Login(param),
  });
  return {
    UserLogin,
    LoggedInUser,
    ErrorWhileLoggingIn,
  };
};
