import { useCallback, useEffect, useState } from "react";
import { useRegisterUser, useUserLogin } from "../hooks/useAccount";
import { useGetUser } from "../hooks/useUser";
import { LoginForm } from "./login-form";

export default function SignIn() {
  const [readyToSignIn, setReadyToSignIn] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setReadyToSignIn(true);
        }}
      >
        Sign In
      </button>

      {readyToSignIn && (
        <LoginForm autoFocus={true} setOpen={setReadyToSignIn} />
      )}
    </>
  );
}
