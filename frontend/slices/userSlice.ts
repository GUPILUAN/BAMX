import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { User } from "@/types/User";

interface UserState {
  user: User | undefined;
  protected_image: string | undefined;
}

const initialState: UserState = {
  user: undefined,
  protected_image: undefined,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setNewUserImage: (state, action) => {
      state.protected_image = action.payload;
    },
  },
});

export const { setUser, setNewUserImage } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;

export const selectUserImage = (state: RootState) => state.user.protected_image;

export default userSlice.reducer;
