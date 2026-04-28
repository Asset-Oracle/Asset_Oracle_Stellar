import { useCallback, useState } from "react";
import { MdCancel } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignUp from "./ui/Signup";
import SignIn from "./ui/SignIn";

interface LoginProp {
  setOpen: (value: boolean) => void;
}

export function LoginForm({
  className,
  setOpen,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & LoginProp) {
  const [isLoggingIn, setIsLogginIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) throw error;
      location.href = "/protected";
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className={`${cn("flex flex-col gap-6", className)}`} {...props}>
      <div className="h-screen w-full backdrop-blur-md fixed flex justify-center items-center left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <Card className="w-[90%] lg:w-[40%] h-auto shadow-lg">
          <div className="flex justify-between">
            <CardHeader className="w-[80%]">
              <CardTitle className="text-2xl">Welcome!</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>

            <div
              className="px-5"
              onClick={() => {
                setOpen(false);
              }}
            >
              <MdCancel size={"2rem"} color="red" />
            </div>
          </div>
          {error && (
            <div className="flex justify-center items-center">
              <p className="text-red-500 border-1 border-red-500 px-3 py-1 rounded-md">
                {error}
              </p>
            </div>
          )}

          <CardContent>
            <div>
              <SignUp
                isLoggingIn={isLoggingIn}
                isLoading={isLoading}
                setError={setError}
              />

              <SignIn
                isLoggingIn={isLoggingIn}
                isLoading={isLoading}
                setError={setError}
              />

              <div className="flex justify-center items-center gap-2 mt-2">
                <p>{isLoggingIn ? "dont have" : "already have"} an account</p>
                <p
                  onClick={() => {
                    setIsLogginIn((prev) => !prev);
                  }}
                  className="text-blue-500 cursor-pointer"
                >
                  {isLoggingIn ? "Sign Up" : "Sign In"}
                </p>
              </div>
            </div>
            <div className="flex w-full justify-center items-center gap-4 mt-3">
              <form onSubmit={handleSocialLogin}>
                <div className="flex flex-col gap-6">
                  <Button type="submit" className="" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Google"}
                    <FcGoogle />
                  </Button>
                </div>
              </form>
              <form onSubmit={handleSocialLogin}>
                <div className="flex flex-col gap-6">
                  <Button type="submit" className="" disabled={isLoading}>
                    {isLoading ? "Logging in..." : " Apple"}
                    <FaApple />
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
