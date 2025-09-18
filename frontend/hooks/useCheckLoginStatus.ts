import { useEffect } from "react";
import { getData } from "../functions/userKey";

export default function useCheckLoginStatus(navigation: any) {
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await getData("access");
      if (token) {
        navigation.navigate("DashBoard");
      } else {
        navigation.navigate("Auth");
      }
    };
    checkLoginStatus();
  }, []);
}