import axios from "axios";
import { use, useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { AssetInfo } from "./useAssetQuery";

import {
  getUser,
  getUserDashboard,
} from "../server_functions/Server_Functions";
import { useActiveEVMAccount } from "../Zustand/Store";

interface UserInfo {
  email: string;
  name: string;
}

interface DashboardInfo {
  pendingVerifications: number;
  totalValue: string;
  totalAssets: number;
  totalInvestmentValue: string;
  verifiedAssets: number;
}

export const useGetUserInfo = () => {
  const [backendUser, setBackendUser] = useState<UserInfo | null>(null);
  const [dashboardInfo, setDashBoardInfo] = useState<number[] | null>(null);
  const ActiveAccount = useActiveEVMAccount((state) => state.accout);
  const [allAssets, setAllAssets] = useState<AssetInfo[] | null>(null);

  const fetchLocalUser = () => {
    if (!ActiveAccount?.address) return;
    const user = localStorage.getItem(ActiveAccount.address!.toLowerCase());
    if (user) {
      setBackendUser(JSON.parse(user));
    } else {
      setBackendUser(null);
    }
  };

  useEffect(() => {
    fetchLocalUser();
  }, [ActiveAccount.address]);
  const {
    data: userInfo,
    error: userInfoError,
    refetch: RefetchUserData,
  } = useQuery({
    queryKey: ["getUser", ActiveAccount?.address?.toLowerCase()],
    queryFn: () => getUser(ActiveAccount?.address!.toLowerCase()),
    enabled: !!ActiveAccount?.address?.toLowerCase(),
  });

  const { data: userDashboardInfo, error: userDashboardInfoError } = useQuery({
    queryKey: ["getUserDashboard", ActiveAccount?.address?.toLowerCase()],
    queryFn: () => getUserDashboard(ActiveAccount?.address!.toLowerCase()),
    enabled: !!ActiveAccount?.address?.toLowerCase(),
  });

  useEffect(() => {
    if (!ActiveAccount.address) {
      return;
    }
    if (userInfo && userInfo.data.user) {
      console.log(userInfo);
      const user = localStorage.setItem(
        ActiveAccount.address!.toLowerCase(),
        JSON.stringify(userInfo.data.user),
      );
      setBackendUser({
        email: userInfo.data.user.email,
        name: userInfo.data.user.name,
      });
      fetchLocalUser();
    }
    if (userDashboardInfo) {
      console.log(userDashboardInfo);
      const data = userDashboardInfo.data.data.stats as DashboardInfo;
      const asset = userDashboardInfo.data.data.assetsByStatus;
      setDashBoardInfo([
        `$${data.totalValue}`,
        `$${data.totalInvestmentValue}`,
        (data.pendingVerifications = asset.pending.length),
        data.verifiedAssets,
      ]);
      setAllAssets(userDashboardInfo.data.data.assets);
    }
  }, [userInfo, userDashboardInfo, userInfoError, ActiveAccount.address]);

  return {
    backendUser,
    dashboardInfo,
    allAssets,
    userInfoError,
    RefetchUserData,
  };
};
