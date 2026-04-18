import { useCallback, useEffect, useState } from "react";
import { useRegisterUser, useUserLogin } from "../hooks/useAccount";
import { useGetUser } from "../hooks/useUser";

export default function SignIn() {
  const [readyToSignIn, setReadyToSignIn] = useState(false);
  const [isSigingUp, setIsSigningUp] = useState(false);
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { RegisterUser, RegisteredUser, ErrorWhileRegistering } =
    useRegisterUser();
  const { UserLogin, LoggedInUser, ErrorWhileLoggingIn } = useUserLogin();

  const getUser = useGetUser();

  const resetValues = () => {
    setUserName("");
    setEmail("");
    setPassword("");
  };

  const storeSession = (
    expires_at: number,
    userName: string,
    email: string,
  ) => {
    localStorage.setItem(
      "user",
      JSON.stringify({ userName, email, expires_at }),
    );
  };

  const handle_submit = () => {
    if (isSigingUp) {
      if (!username || !email || !password) {
        alert("All Feild Requierd");
        return;
      }
      if (password.length < 8) {
        alert("Password must be greater than 8 characters long");
        return;
      }
      console.log("signing up");
      RegisterUser({ email, password, name: username });
      resetValues();
    } else {
      if (!email || !password) {
        alert("All Feild Requierd");
        return;
      }
      if (password.length < 8) {
        alert("Password must be greater than 8 characters long");
        return;
      }
      console.log("signing in");
      UserLogin({ email, password });
      resetValues();
    }
  };

  useEffect(() => {
    if (RegisteredUser) {
      alert("Registration Successful");
    }
    if (ErrorWhileRegistering) {
      alert("Error While Registering");
    }
  }, [RegisteredUser, ErrorWhileRegistering]);

  useEffect(() => {
    if (LoggedInUser) {
      storeSession(
        LoggedInUser.data.session.expires_at,
        LoggedInUser.data.session.user.user_metadata.name,
        LoggedInUser.data.session.user.user_metadata.email,
      );
      getUser();
      setReadyToSignIn(false);
      alert("Login Successful");
    }
    if (ErrorWhileLoggingIn) {
      alert("Error While Logging In");
    }
  }, [LoggedInUser, ErrorWhileLoggingIn]);
  return (
    <>
      <button
        onClick={() => {
          setReadyToSignIn(true);
        }}
      >
        Sing In
      </button>
      {readyToSignIn && (
        <div className="w-[60%] h-auto py-7 flex flex-col justify-between items-center fixed bg-[#4f46e5] left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] rounded-md min-h-[60%]">
          <div className="flex">
            <button
              className={`bg-[] ${isSigingUp ? "bg-white! text-[#4f46e5]!" : "bg-[]"}`}
              onClick={() => {
                setIsSigningUp(true);
              }}
            >
              Sign Up
            </button>
            <button
              className={`bg-[] ${!isSigingUp ? "bg-white! text-[#4f46e5]!" : "bg-[]"}`}
              onClick={() => {
                setIsSigningUp(false);
              }}
            >
              Sign In
            </button>
          </div>

          <div className="w-[60%] h-[60%] flex flex-col justify-center items-center ">
            {isSigingUp && (
              <div className="w-full flex flex-col gap-3 justify-center items-center">
                <div className="w-[80%]">
                  <p className="text-white font-bold">username</p>
                </div>
                <div className="w-full flex flex-col justify-start items-center">
                  <input
                    className="border-2 border-white w-[80%] font-bold rounded-md bg-white"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUserName(e.target.value);
                    }}
                  />
                </div>
                <div className="w-[80%]">
                  <p className="text-white font-bold">email</p>
                </div>
                <div className="w-full flex flex-col justify-start items-center">
                  <input
                    className="border-2 border-white w-[80%] font-bold rounded-md bg-white"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                </div>
                <div className="w-[80%]">
                  <p className="text-white font-bold">password</p>
                </div>
                <div className="w-full flex flex-col justify-start items-center">
                  <input
                    className="border-2 border-white w-[80%] font-bold rounded-md bg-white"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                  />
                </div>
              </div>
            )}

            {!isSigingUp && (
              <div className="w-full flex flex-col gap-3 justify-center items-center">
                <div className="w-[80%]">
                  <p className="text-white font-bold">email</p>
                </div>
                <div className="w-full flex flex-col justify-start items-center">
                  <input
                    className="border-2 border-white w-[80%] font-bold rounded-md bg-white"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                </div>
                <div className="w-[80%]">
                  <p className="text-white font-bold">password</p>
                </div>
                <div className="w-full flex flex-col justify-start items-center">
                  <input
                    className="border-2 border-white w-[80%] font-bold rounded-md bg-white"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="w-full flex justify-center gap-4">
            <button
              className="bg-red-500! text-white! font-bold! w-[20%] mt-5"
              onClick={() => {
                setReadyToSignIn(false);
              }}
            >
              Close
            </button>
            <button
              className="bg-white! text-[#4f46e5]! font-bold! w-[30%] mt-5"
              onClick={handle_submit}
            >
              {isSigingUp ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
