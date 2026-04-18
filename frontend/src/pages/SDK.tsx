import { useEffect, useState } from "react";
import Header from "../components/Header";
import MenuBar from "../components/MenuBar";
import { useNavigate } from "react-router";
import { useGetUserInfo } from "../hooks/useUserQuery";
import MarketPlaceItemContainer from "../components/marketPlaceItemContainer";
import AssetOracleSnippet from "../components/JsCodeSnippet";
import InstallationSnippet from "../components/Installation";

interface DashboardProps {
  sideBarOut: boolean;
}
function SDK({ sideBarOut }: DashboardProps) {
  const { backendUser } = useGetUserInfo();
  const { dashboardInfo, allAssets } = useGetUserInfo();

  const [selectedOption, setSelectedOption] = useState(0);

  const navigate = useNavigate();
  const investments = [
    {
      name: "Total Asset Value",
      value: 0,
      PL: 0,
    },
    {
      name: "Total Investments",
      value: 0,
      PL: 0,
    },
    {
      name: "Pending Verifications",
      value: 0,
      PL: 0,
    },
    {
      name: "Verified Assets",
      value: 0,
      PL: 0,
    },
  ];
  return (
    <>
      <div className="flex">
        <MenuBar sideBarOut={sideBarOut} />
        <div className="h-full w-[100%] lg:ml-[300px] py-10">
          <div className=" text-black pt-25 flex flex-col items-start justify-center ml-10">
            <div className="flex flex-col ">
              <h1 className="font-bold !text-4xl">SDK & API Documentation</h1>
              <p>Integrate AssetOracle into your applications</p>
            </div>
          </div>
          <div className="text-black grid lg:grid-cols-3 md:grid-cols-1 items-center justify-center pt-10 px-10 gap-5">
            <div className="border-1 border-gray-500 py-4 px-2 rounded-md">
              <div className="p-3 bg-[#e0e7ff] w-[50px] mb-5 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-key w-6 h-6 text-indigo-600"
                >
                  <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"></path>
                  <path d="m21 2-9.6 9.6"></path>
                  <circle cx="7.5" cy="15.5" r="5.5"></circle>
                </svg>
              </div>

              <h2 className="font-bold mb-5">Api Keys</h2>
              <p className="mb-5">generate your key to get started</p>
              <h2 className="font-bold text-xl mb-5">Not Generated</h2>
            </div>

            <div className="border-1 border-gray-500 py-4 px-2 rounded-md">
              <div className="p-3 bg-[#d1fae5] w-[50px] mb-5 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-credit-card w-6 h-6 text-emerald-600"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg>
              </div>

              <h2 className="font-bold mb-5">API Credits</h2>
              <p className="mb-5">Available API call credits</p>
              <h2 className="font-bold text-xl mb-5">
                Available API call credits
              </h2>
            </div>
            <div className="border-1 border-gray-500 py-4 px-2 rounded-md">
              <div className="p-3 bg-[#fef3c7] w-[50px] mb-5 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-zap w-6 h-6 text-amber-600"
                >
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                </svg>
              </div>

              <h2 className="font-bold mb-5">Usage This Month</h2>
              <p className="mb-5">API calls made</p>
              <h2 className="font-bold text-xl mb-5">45</h2>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="text-black px-5 py-5 mt-10 ml-10 shadow-md border-[#e2e8f0] border-2 rounded-lg w-[65%]">
              <div className="border-1 border-gray-500 py-4 px-2 rounded-md flex flex-col align-center justify-center w-full">
                <div className="p-3 mb-5 rounded-lg">
                  <h2 className="text-black font-bold">API Key Management</h2>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h2 className=" mb-5">You don't have an API key yet</h2>
                  <button className="mb-5 w-[30%]">Generate API Key</button>
                  <h2 className=" text-sm mb-5">
                    Includes 10 free credits to get started
                  </h2>
                </div>
              </div>

              <div className="border-1 border-gray-500 py-4 px-2 mt-6 rounded-md flex flex-col align-center justify-center w-full">
                <div className="p-3 mb-5 rounded-lg">
                  <h2 className="text-black font-bold">SDK Integration</h2>
                </div>
                <div className="flex bg-[#f5f5f5] p-2 w-fit">
                  <button
                    onClick={() => setSelectedOption(0)}
                    className={`bg-[#f5f5f5]! text-black! ${selectedOption === 0 ? "bg-white!" : "bg-[#f5f5f5]!"}`}
                  >
                    Javascript
                  </button>
                  <button
                    onClick={() => setSelectedOption(1)}
                    className={`bg-[#f5f5f5]! text-black! ${selectedOption === 1 ? "bg-white!" : "bg-[#f5f5f5]!"}`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setSelectedOption(2)}
                    className={`bg-[#f5f5f5]! text-black! ${selectedOption === 2 ? "bg-white!" : "bg-[#f5f5f5]!"}`}
                  >
                    Curl
                  </button>
                </div>

                <div className="mt-5 w-full">
                  <AssetOracleSnippet optionIndex={selectedOption} />
                </div>
              </div>
              <div className="mt-5 w-full">
                <h2 className="font-bold mb-3">Installation</h2>

                <p className="mt-5">NPM</p>
                <InstallationSnippet code="npm install @assetoracle/sdk" />

                <p className="mt-5">Python</p>
                <InstallationSnippet code="pip install assetoracle" />
              </div>
            </div>
            <div className="flex flex-col gap-5 mr-10">
              <div className=" bg-[#f8faff] text-black px-5 py-5 mt-10 shadow-md border-[#e2e8f0] border-2 rounded-lg w-[100%]">
                <div className="border-1 border-gray-500 py-4 px-2 rounded-md">
                  <div className=" mb-5 rounded-lg">
                    <h2 className="text-black font-bold">
                      Purchase API Credits
                    </h2>
                  </div>

                  <p className="mb-5 text-gray-500">
                    Each API call consumes 1 credit. Buy credits in bulk for
                    better value.
                  </p>
                  <p>Number of Credits</p>
                  <input
                    className="border-1 border-gray-500 w-full rounded-md p-1"
                    type="number"
                  />
                  <div className="mt-5 p-3 bg-[#ffffff] rounded-md shadow-sm">
                    <div className="flex justify-between px-3 mb-2">
                      <p>Credit</p>
                      <h2 className="font-semibold">1</h2>
                    </div>
                    <div className="flex justify-between px-3 mb-2">
                      <p>Price per Credit</p>
                      <h2 className="font-semibold">$1</h2>
                    </div>
                    <div className="flex justify-between px-3 mb-2">
                      <p className="font-bold">Total</p>
                      <h2 className="font-bold text-[#4f46e5]">$1</h2>
                    </div>
                  </div>

                  <button className="w-full mt-3">Purchase Credit</button>
                </div>
              </div>
              <div className=" bg-[#f8faff] text-black px-5 py-5 mt-10 mr-10 shadow-md border-[#e2e8f0] border-2 rounded-lg w-[100%]">
                <div className="border-1 border-gray-500 py-4 px-2 rounded-md">
                  <div className=" mb-5 rounded-lg">
                    <h2 className="text-black font-bold">Pricing Tiers</h2>
                  </div>
                  <div className="border-1 border-gray-500 rounded-md px-1 py-2 shadow-md">
                    <h2>Starter</h2>
                    <p>100 credits - $10</p>
                  </div>

                  <div className="border-1 bg-[#eef2ff] border-gray-500 rounded-md px-1 py-2 mt-5 shadow-md">
                    <h2>Pro</h2>
                    <p>1000 credits - $100</p>
                  </div>
                  <div className="border-1 bg-[#ecfdf5] border-gray-500 rounded-md px-1 py-2 mt-5 shadow-md">
                    <h2>Enterprise</h2>
                    <p>10 000 credits - $600</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default SDK;
