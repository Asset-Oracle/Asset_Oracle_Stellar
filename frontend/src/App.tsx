import { use, useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import "./App.css";
import Header from "./components/Header";
import MarketPlace from "./pages/Marketplace";
import Settings from "./pages/Settings";
import RegisterAsset from "./pages/RegisterAsset";
import AuthWrapper from "./pages/AuthWrapper";
import Asset from "./pages/Asset";
import SDK from "./pages/SDK";
import Portfolio from "./pages/Portfolio";
import { useAuth } from "./Zustand/Store";
import { useGetUser } from "./hooks/useUser";
import {
  useEvmConnection,
  useStellarConnection,
} from "./hooks/useWalletConnect";

function App() {
  const [sideBarOut, setSideBarOut] = useState(false);
  const setAuth = useAuth((state) => state.setAuth);
  const getUser = useGetUser();
  const { getEvmConnection } = useEvmConnection();
  const { getStellarConnection } = useStellarConnection();
  useEffect(() => {
    getUser();
  }, [setAuth]);
  useEffect(() => {
    getEvmConnection();
    getStellarConnection();
  }, []);

  useEffect(() => {
    if (sideBarOut) {
      console.log("Sidebar is out");
    } else {
      console.log("Sidebar is in");
    }
  }, [sideBarOut]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <Header sideBarOut={sideBarOut} setSideBarOut={setSideBarOut} />
          <Home />,
        </>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <>
          <AuthWrapper
            children={
              <>
                <Header sideBarOut={sideBarOut} setSideBarOut={setSideBarOut} />
                <Dashboard sideBarOut={sideBarOut} />
              </>
            }
          />
        </>
      ),
    },

    {
      path: "/marketplace",
      element: (
        <AuthWrapper
          children={
            <>
              <Header sideBarOut={sideBarOut} setSideBarOut={setSideBarOut} />
              <MarketPlace sideBarOut={sideBarOut} />
            </>
          }
        />
      ),
    },
    {
      path: "/settings",
      element: (
        <AuthWrapper
          children={
            <>
              <Header sideBarOut={sideBarOut} setSideBarOut={setSideBarOut} />
              <Settings sideBarOut={sideBarOut} />
            </>
          }
        />
      ),
    },
    {
      path: "/registerasset",
      element: (
        <AuthWrapper
          children={
            <>
              <Header sideBarOut={sideBarOut} setSideBarOut={setSideBarOut} />
              <RegisterAsset sideBarOut={sideBarOut} />
            </>
          }
        />
      ),
    },
    {
      path: "/sdk",
      element: (
        <AuthWrapper
          children={
            <>
              <Header sideBarOut={sideBarOut} setSideBarOut={setSideBarOut} />
              <SDK sideBarOut={sideBarOut} />
            </>
          }
        />
      ),
    },
    {
      path: "/portfolio",
      element: (
        <AuthWrapper
          children={
            <>
              <Header sideBarOut={sideBarOut} setSideBarOut={setSideBarOut} />
              <Portfolio sideBarOut={sideBarOut} />
            </>
          }
        />
      ),
    },
    {
      path: "/marketplace/:id",
      element: (
        <AuthWrapper
          children={
            <>
              <Header sideBarOut={sideBarOut} setSideBarOut={setSideBarOut} />
              <Asset sideBarOut={sideBarOut} />
            </>
          }
        />
      ),
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
