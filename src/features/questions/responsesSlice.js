import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  q1: {},
  q2: '',
  q3: '',
  q4: '',
  q5: '',
  // Add more question keys as needed
  questionsPricing: 0,
  serviceCatalogPricing: 0,
  serviceSelections: {},
  questionsOnceOffFee: 0,
  serviceCatalogOnceOffFee: 0,
  clientName: '',
};

const responsesSlice = createSlice({
  name: 'responses',
  initialState,
  reducers: {
    setResponses: (state, action) => {
      // Preserve pricing-related keys
      const preservedKeys = ['questionsPricing', 'serviceCatalogPricing', 'serviceSelections', 'questionsOnceOffFee', 'serviceCatalogOnceOffFee', 'clientName'];
      
      Object.keys(state).forEach((key) => { 
        if (!preservedKeys.includes(key)) {
          delete state[key];
        }
      });
      Object.entries(action.payload).forEach(([key, value]) => {
        // Don't overwrite preserved keys from payload (they might have stale values)
        if (!preservedKeys.includes(key)) {
          state[key] = value;
        }
      });
    },
    updateResponse: (state, action) => {
      const { questionId, value } = action.payload;
      state[questionId] = value;
    },
    setQuestionsPricing: (state, action) => {
      state.questionsPricing = action.payload;
    },
    setServiceCatalogPricing: (state, action) => {
      state.serviceCatalogPricing = action.payload;
    },
    setServiceSelections: (state, action) => {
      state.serviceSelections = action.payload;
    },
    setQuestionsOnceOffFee: (state, action) => {
      state.questionsOnceOffFee = action.payload;
    },
    setServiceCatalogOnceOffFee: (state, action) => {
      state.serviceCatalogOnceOffFee = action.payload;
    },
    setClientName: (state, action) => {
      state.clientName = action.payload;
    },
  }
});

export const { setResponses, updateResponse, setQuestionsPricing, setServiceCatalogPricing, setServiceSelections, setQuestionsOnceOffFee, setServiceCatalogOnceOffFee, setClientName } = responsesSlice.actions;
export default responsesSlice.reducer;
