import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { User } from "@/types/User";

interface UserState {
  user: User | undefined;
}

const initialState: UserState = {
  user: undefined,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;

export default userSlice.reducer;
