import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";
interface SignupProp {
  isLoggingIn: boolean;
  isLoading: boolean;
  setError: (value: string | null) => void;
}

export default function SignUp({
  isLoggingIn,
  isLoading,
  setError,
}: SignupProp) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [invalidUsername, setInvalidUsername] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [invalidCPassword, setInvalidCPassword] = useState(false);

  const resetInput = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleEmailSignUp = useCallback(
    async (e: any) => {
      e.preventDefault();
      setError(null);
      if (!username) {
        setInvalidUsername(true);
        return;
      }
      if (!email || !email.includes("@")) {
        setInvalidEmail(true);
        return;
      }
      if (password.length < 8) {
        setInvalidPassword(true);
        return;
      }
      if (password !== confirmPassword) {
        setInvalidCPassword(true);
        return;
      }
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: username } },
        });
        if (error) throw error;
        alert("Registration Succesful, Please confirm your email");
        resetInput();
      } catch (error: any) {
        console.log(error.message);
        setError(error.message);
      }
    },
    [username, email, password, confirmPassword],
  );
  useEffect(() => {
    if (username) {
      setInvalidUsername(false);
    }
    if (email) {
      setInvalidEmail(false);
    }
    if (password) {
      setInvalidPassword(false);
    }
    if (confirmPassword) {
      setInvalidCPassword(false);
    }
  }, [username, email, password, confirmPassword]);
  return (
    <>
      {!isLoggingIn && (
        <form action="" className="flex flex-col gap-2">
          <label htmlFor="" className="flex flex-col">
            Username
            <div className="w-full flex flex-col">
              {invalidUsername && (
                <p className="text-red-500">invalid username</p>
              )}

              <input
                className="px-2 py-1 border-1 border-grey-500 rounded-sm"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </div>
          </label>

          <label htmlFor="" className="flex flex-col">
            Email
            <div className="w-full flex flex-col">
              {invalidEmail && <p className="text-red-500">invalid email</p>}
              <input
                className="px-2 py-1 border-1 border-grey-500 rounded-sm"
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
          </label>
          <label htmlFor="" className="flex flex-col">
            Password
            <div className="w-full flex flex-col">
              {invalidPassword && (
                <p className="text-red-500">invalid password</p>
              )}
              <input
                className="px-2 py-1 border-1 border-grey-500 rounded-sm"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
          </label>
          <label htmlFor="" className="flex flex-col">
            Confirm Password
            <div className="w-full flex flex-col">
              {invalidCPassword && (
                <p className="text-red-500">password dont match</p>
              )}

              <input
                className="px-2 py-1 border-1 border-grey-500 rounded-sm"
                type="password"
                placeholder="confirm password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
              />
            </div>
          </label>
          <div className="flex justify-center items-center mt-3">
            <Button
              onClick={handleEmailSignUp}
              type="submit"
              className="w-[80%] "
              disabled={isLoading}
            >
              {isLoading ? "Siging up..." : "Sign Up"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
