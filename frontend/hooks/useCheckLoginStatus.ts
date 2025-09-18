import { useEffect } from "react";
import { getData } from "../functions/userKey";
import { navigate, replace } from "@/functions/NavigationService";

export default function useCheckLoginStatus(navigation: any) {
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
}