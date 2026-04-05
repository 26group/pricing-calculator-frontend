import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as subscriptionApi from '../../services/subscriptionApi';

export const fetchSubscription = createAsyncThunk(
  'subscription/fetchSubscription',
  async (_, { rejectWithValue }) => {
    try {
      return await subscriptionApi.getSubscription();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'subscription/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await subscriptionApi.getProducts();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const selectPlan = createAsyncThunk(
  'subscription/selectPlan',
  async (priceId, { rejectWithValue }) => {
    try {
      return await subscriptionApi.selectPlan(priceId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    subscription: null,
    products: [],
    loading: false,
    error: null,
    requiresPayment: false,
    isTrialExpired: false,
    // Current plan info
    currentPlanName: null,
  },
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    setRequiresPayment: (state, action) => {
      state.requiresPayment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch subscription
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
        state.requiresPayment = action.payload?.requiresPayment || false;
        state.isTrialExpired = action.payload?.isTrialExpired || false;
        state.currentPlanName = action.payload?.plan?.name || null;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Select plan
      .addCase(selectPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(selectPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(selectPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubscriptionError, setRequiresPayment } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
