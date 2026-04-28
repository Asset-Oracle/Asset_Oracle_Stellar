import { useSideBar } from "@/Zustand/Store";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

function MenuBar() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const sideBarOut = useSideBar((state) => state.sideBarOut);
  const setSideBarOut = useSideBar((state) => state.setSideBarOut);
  const menuItems = [
    { name: "Dashboard" },
    { name: "MarketPlace" },
    { name: "Register Asset" },
    { name: "SDK" },
    { name: "Portfolio" },
    { name: "Settings" },
  ];

  const containerRef = useRef<any>(null); // 1. Create a reference to the container

  useEffect(() => {
    // 2. Function to handle clicks
    const handleClickOutside = (event: any) => {
      // If the clicked element is NOT inside our container, close it
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setSideBarOut(false);
      }
    };

    // 3. Attach listener to the whole document
    document.addEventListener("mousedown", handleClickOutside);

    // 4. Cleanup listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={`menu-bar fixed bg-white pt-15 flex flex-col items-start justify-start shadow-md h-screen border-[#e2e8f0] border-2 w-[300px] left-[-100%] lg:left-[0%] transition-all duration-300 z-40 ${sideBarOut ? "!left-[0%]" : "left-[-100%]"}`}
      >
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`!text-black font-bold text-lg flex flex-col items-center justify-center py-3 m-3 px-10`}
            onClick={() => {
              setSelected(index);
              navigate(`/${item.name.toLowerCase().replace(" ", "")}`);
            }}
          >
            <button className="w-[180px] box-content text-left !bg-white !text-black hover:!bg-[#eef2ff] !border-0 hover:text-white rounded-md px-4 py-1  focus:!bg-[#eef2ff]">
              {item.name}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
export default MenuBar;
