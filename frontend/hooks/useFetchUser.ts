import { retrieveData } from "@/api/apiCalls";
import { selectUser, setUser } from "@/slices/userSlice";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
const useFetchUser = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await retrieveData("api/auth/info");
        dispatch(setUser(response.user));
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);
  const user = useSelector(selectUser);
  return { user };
};
export default useFetchUser;
