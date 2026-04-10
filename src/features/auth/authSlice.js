import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    organisation: null,
    isOwner: false,
    isManager: false,
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
      state.isManager = action.payload.isManager || false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.organisation = null;
      state.isOwner = false;
      state.isManager = false;
    },
  },
});

export const { loginSuccess, setToken, setOrganisation, logout } = authSlice.actions;
export default authSlice.reducer;