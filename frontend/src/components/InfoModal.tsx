import { useEffect, useRef } from "react";
import { FcCancel } from "react-icons/fc";
import { GrStatusGood } from "react-icons/gr";

interface InfoModalProp {
  message: string;
  isError: boolean;
  isSuccess: boolean;
  setMessage: (value: string) => void;
}
export default function InfoModal({
  message,
  isError,
  isSuccess,
  setMessage,
}: InfoModalProp) {
  return (
    <>
      {message && (
        <div
          onClick={() => {
            setMessage("");
          }}
          className="fixed backdrop-blur-sm flex justify-center items-center w-full h-full top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] "
        >
          <div className="w-[90%] md:w-[40%] lg:ml-[300px] flex flex-col h-auto min-h-[300px] shadow-lg justify-center items-center bg-white border-2 border-grey-500 rounded-md">
            {isError && <FcCancel size={"4rem"} />}
            {isSuccess && <GrStatusGood color="green" size={"4rem"} />}
            <h2 className="font-bold mt-5">{message}</h2>
          </div>
        </div>
      )}
    </>
  );
}
