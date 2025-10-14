import { useEffect } from "react";
import { getData } from "@/functions/userKey";
import { navigate, replace } from "@/functions/NavigationService";

const useCheckLoginStatus = () => {
  useEffect(() => {
      const checkLoginStatus = async () => {
        const token = await getData("access");
        if (token) {
          navigate("Dashboard");
        } else {
          replace("Auth");
        }
      };
      checkLoginStatus(); 
  }, []);
};

export default useCheckLoginStatus;