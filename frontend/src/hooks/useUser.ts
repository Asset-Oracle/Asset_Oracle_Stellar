import { useAuth } from "../Zustand/Store";

export function useGetUser() {
  const setAuth = useAuth((state) => state.setAuth);
  const setIsAuthenticated = useAuth((state) => state.setIsAuthenticated);
  const getUser = () => {
    const user = localStorage.getItem("user");
    if (user) {
      console.log(user);
      const parsedUser = JSON.parse(user);
      if (parsedUser.expires_at > Math.floor(Date.now() / 1000)) {
        setAuth({
          username: parsedUser.userName,
          email: parsedUser.email,
          address: "",
        });
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  return getUser;
}
