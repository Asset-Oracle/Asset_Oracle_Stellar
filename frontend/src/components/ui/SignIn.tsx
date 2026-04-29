import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
interface SigninProp {
  isLoggingIn: boolean;
  isLoading: boolean;
  setError: (value: string | null) => void;
}

export default function SignIn({
  isLoggingIn,
  isLoading,
  setError,
}: SigninProp) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);

  const resetInput = () => {
    setEmail("");
    setPassword("");
  };
  const navigate = useNavigate();

  const handleEmailSignUp = useCallback(
    async (e: any) => {
      e.preventDefault();
      setError(null);

      if (!email || !email.includes("@")) {
        setInvalidEmail(true);
        return;
      }
      if (password.length < 8) {
        setInvalidPassword(true);
        return;
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        alert("Login Succesful");
        console.log(data);
        resetInput();
        navigate(0);
      } catch (error: any) {
        console.log(error.message);
        setError(error.message);
      }
    },
    [email, password],
  );
  useEffect(() => {
    if (email) {
      setInvalidEmail(false);
    }
    if (password) {
      setInvalidPassword(false);
    }
  }, [email, password]);
  return (
    <>
      {isLoggingIn && (
        <form action="" className="flex flex-col gap-2">
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

          <div className="flex justify-center items-center mt-3">
            <Button
              onClick={handleEmailSignUp}
              type="submit"
              className="w-[80%] "
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign In"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
