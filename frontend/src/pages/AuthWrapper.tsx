import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppKitAccount } from "@reown/appkit/react";
import { Thirdweb_Client } from "../Thirdweb/thirdweb";
import { useGetUserInfo } from "../hooks/useUserQuery";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "../server_functions/Server_Functions";
import { useAuth } from "../Zustand/Store";

interface AuthWrapperProps {
  children: React.ReactNode;
}

function AuthWrapper({ children }: AuthWrapperProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const account = useAppKitAccount();
  const { backendUser, RefetchUserData, userInfoError, isNewUser } =
    useGetUserInfo();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // ────────────────────────────────────────────────
  //  Recommended: show loading while we detect state
  // ────────────────────────────────────────────────
  if (account.status === "connecting") {
    console.log("connecting");
  }

  // After auto-connect attempt finished:
  //   - status === "connected"  → user is signed in
  //   - status === "disconnected" → not signed in
  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/");
    }
  }, [isAuthenticated]);

  // If we reach here → status === "connected" and account should exist
  if (!account?.address) {
    console.log("no address");
  }

  const {
    data: registerdata,
    error: registerError,
    mutate: Register,
  } = useMutation({
    mutationKey: ["create_user", account?.address, name, email],
    mutationFn: () => createUser(account?.address!, name, email),
  });

  const handleregister = () => {
    if (!name || !email) {
      alert("name and email must be provided");
      return;
    }
    Register();
  };

  useEffect(() => {
    if (registerdata) {
      console.log(registerdata);
      RefetchUserData();
    }
    if (registerError) {
      console.log(registerError);
    }
  }, [registerdata, registerError]);

  return (
    <>
      {children}
      {account.status === "connected" && isNewUser && (
        <div className=" flex flex-col align-center justify-center w-[60%] px-7 py-3 rounded-md shadow-lg bg-[#eef2ff] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
          <div className="text-center font-bold text-2xl text-[#4d42d6]">
            <h2>Welcome To AssetOracle May we Know you ?</h2>
          </div>

          <div className="flex flex-col mt-8">
            <input
              className="mb-5 border-black border-2 rounded-md px-3 py-2"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <input
              className="mb-5 border-black border-2 rounded-md px-3 py-2"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <button onClick={handleregister}>Register</button>
          </div>
        </div>
      )}
    </>
  );
}

export default AuthWrapper;
