import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    organisation: null,
    isOwner: false,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setOrganisation: (state, action) => {
      state.organisation = action.payload.organisation;
      state.isOwner = action.payload.isOwner;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.organisation = null;
      state.isOwner = false;
    },
  },
});

export const { loginSuccess, setToken, setOrganisation, logout } = authSlice.actions;
export default authSlice.reducer;