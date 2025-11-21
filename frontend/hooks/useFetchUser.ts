import { apiService } from "@/api/apiService";
import {
  selectUser,
  selectUserImage,
  setNewUserImage,
  setUser,
} from "@/slices/userSlice";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useFetchUser = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const userImage = useSelector(selectUserImage);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiService.retrieveData(`/api/usuarios/me`);
        dispatch(setUser(response));
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUserImage = async () => {
      try {
        if (user && user.profile_picture) {
          const response = await apiService.getImage(user?.profile_picture);
          dispatch(setNewUserImage(response));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUserImage();
  }, [user]);

  return { user, userImage, loading, setLoading };
};
