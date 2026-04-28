import { useCallback, useEffect, useState } from "react";
import Header from "../components/Header";
import MenuBar from "../components/MenuBar";
import { useActiveEVMAccount, useAuth } from "../Zustand/Store";
import { useMutation } from "@tanstack/react-query";
import { Link_wallet } from "../server_functions/Auth_Functions";
import { useGetUser } from "../hooks/useUser";
import { supabase } from "@/lib/supabase/client";

interface DashboardProps {
  sideBarOut: boolean;
}
function Settings({ sideBarOut }: DashboardProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const ActiveAccount = useAuth((state) => state.activeAccount);
  const ActiveEvmAccount = useActiveEVMAccount((state) => state.accout);
  const { getUserInfo } = useGetUser();
  useEffect(() => {
    if (!ActiveAccount) return;
    setName(ActiveAccount.username);
    setEmail(ActiveAccount.email);
    if (ActiveEvmAccount) {
      setAddress(ActiveEvmAccount.address);
    }
  }, [ActiveAccount, ActiveEvmAccount]);

  const {
    data: LinkedData,
    error: LinkedError,
    mutate: LinkWallet,
  } = useMutation({
    mutationKey: ["link_wallet"],
    mutationFn: () =>
      Link_wallet({
        walletAddress: address,
        userId: "",
        email: ActiveAccount.email,
      }),
  });

  const handleLinkWallet = useCallback(() => {
    if (!ActiveAccount.email || !address) {
      alert("Email and Wallet Address is Requierd");
      return;
    }
    console.log(address, ActiveAccount.email);
    LinkWallet();
  }, [ActiveAccount.email, address]);

  useEffect(() => {
    if (LinkedData) {
      console.log("LinkedData : ", LinkedData);
      alert("Wallet Succefully Linked");
      getUserInfo();
    }
    if (LinkedError) {
      alert("Error Linking Wallet");
    }
  }, [LinkedData, LinkedError]);

  const handleLogout = async () => {
    const data = await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <>
      <div className="flex">
        <MenuBar />
        <div className="h-full w-[100%] lg:ml-[300px] py-10">
          <div className=" text-black pt-25 flex flex-col items-start justify-center ml-10">
            <div className="flex flex-col ">
              <h1 className="font-bold !text-4xl">Settings</h1>
              <p>Manage your account preferences and configuration</p>
            </div>
          </div>
          <div className=" text-black px-10 py-5 mt-10 mx-10 shadow-md border-[#e2e8f0] border-2 rounded-lg">
            <div>
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <p>Your account details and role</p>
            </div>
            <div className="mt-5">
              <div>
                <p>Full Name</p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  className="border border-gray-500 rounded-md w-full px-2 py-1"
                />
              </div>
              <div className="mt-5">
                <p>Email Address</p>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className="border border-gray-500 rounded-md w-full  px-2 py-1 "
                />
              </div>
              {/* <div className="mt-5 ">
                <p>Role</p>
                <input
                  type="text"
                  className="border border-gray-500 rounded-md w-full px-2 py-1 "
                />
              </div> */}
            </div>
          </div>
          <div className=" text-black px-10 py-5 mt-10 mx-10 shadow-md border-[#e2e8f0] border-2 rounded-lg">
            <div>
              <h2 className="text-xl font-semibold">Wallet Connection</h2>
              <p>Manage your connected wallet</p>
            </div>
            <div className="mt-5">
              <div>
                <p>Wallet Address</p>
                <input
                  type="text"
                  placeholder="Ox"
                  className="border border-gray-500 rounded-md w-full px-2 py-1"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                  }}
                />
                <button onClick={handleLinkWallet} className="mt-5">
                  Save Wallet
                </button>
              </div>
            </div>
          </div>

          <div className=" text-black px-10 py-5 mt-10 mx-10 shadow-md border-[#e2e8f0] border-2 rounded-lg">
            <div>
              <h2 className="text-xl font-semibold">
                Notification Preferences
              </h2>
              <p>Control how you receive updates</p>
            </div>
            <div className="mt-5">
              <div className="flex justify-between items-center">
                <div>
                  <h2>Email Notifications</h2>
                  <p>Receive notifications via email</p>
                </div>
                <input type="checkbox" />
              </div>
              <div className="flex justify-between items-center my-7">
                <div>
                  <h2>Verification Updates</h2>
                  <p>Get notified about verification status changes</p>
                </div>
                <input type="checkbox" />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h2>Investment Alerts</h2>
                  <p>Receive alerts for investment opportunities</p>
                </div>
                <input type="checkbox" />
              </div>
              <div className="flex flex-col gap-5">
                <button className="mt-7">Save Preferences</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Settings;
