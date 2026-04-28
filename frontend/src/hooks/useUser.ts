import { use, useCallback, useEffect } from "react";
import { useActiveEVMAccount, useAuth } from "../Zustand/Store";
import { useCall } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { GetUserInfo } from "../server_functions/Server_Functions";
import { supabase } from "@/lib/supabase/client";

export function useGetUser() {
  const setAuth = useAuth((state) => state.setAuth);
  const activeAccount = useAuth((state) => state.activeAccount);
  const setActiveEvmAccount = useActiveEVMAccount((state) => state.setAccount);
  const setIsAuthenticated = useAuth((state) => state.setIsAuthenticated);
  const getUser = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (user) {
      console.log(user);
      setAuth({
        username: user.user_metadata.name,
        email: user?.email || "",
        uid: user?.id || "",
      });
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  };

  const {
    data: Info,
    error: InfoError,
    refetch,
  } = useQuery({
    queryKey: ["get_user_info"],
    queryFn: () => GetUserInfo(activeAccount.uid),
    enabled: !!activeAccount.uid,
  });

  useEffect(() => {
    if (Info) {
      console.log("INFO : ", Info);
      if (Info.data.data.wallet_address) {
        setActiveEvmAccount(Info.data.data.wallet_address);
      } else {
        setActiveEvmAccount("");
      }
    }
    if (InfoError) {
      console.log("INFO ERROR : ", InfoError);
    }
  }, [Info, InfoError]);

  return { getUser, getUserInfo: refetch };
}
