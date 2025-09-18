import React, { useEffect } from "react";
import { retrieveData } from "@/api/apiCalls";
const useFetchUser = () => {
  const [user, setUser] = React.useState<any>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await retrieveData("api/auth/info");
        setUser(response.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);
  return user;
};

export default useFetchUser;