import { useEffect, useState } from "react";
import Header from "../components/Header";
import MenuBar from "../components/MenuBar";
import { useNavigate } from "react-router";
import MarketPlaceItemContainer from "../components/marketPlaceItemContainer";
import AssetOracleSnippet from "../components/JsCodeSnippet";
import InstallationSnippet from "../components/Installation";
import Chart from "../components/Chart";

interface DashboardProps {
  sideBarOut: boolean;
}
function Portfolio({ sideBarOut }: DashboardProps) {
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
        <MenuBar />
        <div className="h-full w-[100%] lg:ml-[300px] py-10">
          <div className=" text-black pt-25 flex flex-col items-start justify-center ml-10">
            <div className="flex flex-col ">
              <h1 className="font-bold !text-4xl">Investment Portfolio</h1>
              <p>Track your RWA investments and performance</p>
            </div>
          </div>
          <div className="w-full text-black grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 items-center justify-center pt-10 px-10 gap-5">
            <div className=" w-full border-1 border-gray-500 py-4 px-2 rounded-md">
              <div className="p-3 bg-[#5a57ec] w-[50px] mb-5 rounded-lg">
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
                  className="lucide lucide-wallet w-6 h-6 text-white"
                >
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                </svg>
              </div>

              <p className="mb-5">Total Invested</p>
              <h2 className="font-bold text-3xl mb-5">$ 0</h2>
            </div>

            <div className="border-1 border-gray-500 py-4 px-2 rounded-md">
              <div className="p-3 bg-[#5a57ec] w-[50px] mb-5 rounded-lg">
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
                  className="lucide lucide-trending-up w-6 h-6 text-white"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
              </div>

              <p className="mb-5">Current Value</p>
              <h2 className="font-bold text-3xl mb-5">$ 0</h2>
            </div>
            <div className="border-1 border-gray-500 py-4 px-2 rounded-md">
              <div className="p-3 bg-[#5a57ec] w-[50px] mb-5 rounded-lg">
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
                  className="lucide lucide-trending-up w-6 h-6 text-white"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
              </div>

              <p className="mb-5">Total Return</p>
              <h2 className="font-bold text-3xl mb-5">$ 0</h2>
            </div>
            <div className="border-1 border-gray-500 py-4 px-2 rounded-md">
              <div className="p-3 bg-[#5a57ec] w-[50px] mb-5 rounded-lg">
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
                  className="lucide lucide-building2 w-6 h-6 text-white"
                >
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                  <path d="M10 6h4"></path>
                  <path d="M10 10h4"></path>
                  <path d="M10 14h4"></path>
                  <path d="M10 18h4"></path>
                </svg>
              </div>

              <p className="mb-5">Total Assets</p>
              <h2 className="font-bold text-3xl mb-5">0</h2>
            </div>
          </div>
          <div className="ml-10 flex flex-col lg:flex-row gap-10 lg:gap-5 mt-10 mr-10 h-[300px] mb-10">
            <div className="lg:w-[60%] w-full border-gray-500 border-1 rounded-md shadow-md h-full">
              <Chart />
            </div>
            <div className="lg:w-[40%] w-full border-gray-500 border-1 rounded-md shadow-md h-full">
              <div className="flex text-black font-bold mt-3 ml-3">
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
                  className="lucide lucide-chart-pie w-5 h-5"
                >
                  <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"></path>
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                </svg>
                <h2>Asset Allocation</h2>
              </div>
            </div>
          </div>
          <div className="ml-10 mr-10 mt-10 border-gray-500 border-1 rounded-md shadow-md h-[300px]">
            <div className="p-2">
              <h2 className="font-bold text-black text-2xl">
                Your Investments
              </h2>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Portfolio;
