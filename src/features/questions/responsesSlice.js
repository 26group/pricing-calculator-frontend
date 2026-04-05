import { createSlice } from '@reduxjs/toolkit';

// Helper functions for localStorage persistence
const STORAGE_KEY = 'bookkeeping_responses';

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading from storage:', error);
    return {};
  }
};

const saveToStorage = (state) => {
  try {
    // Only save question responses, not pricing data
    const toSave = { ...state };
    const excludeKeys = ['questionsPricing', 'serviceCatalogPricing', 'serviceSelections', 'questionsOnceOffFee', 'serviceCatalogOnceOffFee', 'activePriceId'];
    excludeKeys.forEach(key => delete toSave[key]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

const initialState = {
  q1: '',
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
  activePriceId: null,
};

const responsesSlice = createSlice({
  name: 'responses',
  initialState,
  reducers: {
    setResponses: (state, action) => {
      // Preserve pricing-related keys
      const preservedKeys = ['questionsPricing', 'serviceCatalogPricing', 'serviceSelections', 'questionsOnceOffFee', 'serviceCatalogOnceOffFee', 'clientName', 'activePriceId'];
      
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
      saveToStorage(state);
    },
    updateResponse: (state, action) => {
      const { questionId, value } = action.payload;
      state[questionId] = value;
      saveToStorage(state);
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
    setActivePriceId: (state, action) => {
      state.activePriceId = action.payload;
    },
    loadSavedPrice: (state, action) => {
      const { priceId, clientName, questionResponses, questionsPricing, questionsOnceOffFee, serviceCatalogPricing, serviceCatalogOnceOffFee, serviceSelections, serviceType } = action.payload;
      // Reset all question keys
      Object.keys(state).forEach((key) => {
        if (!['questionsPricing', 'serviceCatalogPricing', 'serviceSelections', 'questionsOnceOffFee', 'serviceCatalogOnceOffFee', 'clientName', 'activePriceId', 'serviceType'].includes(key)) {
          delete state[key];
        }
      });
      // Load saved question responses
      if (questionResponses) {
        Object.entries(questionResponses).forEach(([key, value]) => {
          state[key] = value;
        });
      }
      state.activePriceId = priceId;
      state.clientName = clientName || '';
      state.questionsPricing = questionsPricing || 0;
      state.questionsOnceOffFee = questionsOnceOffFee || 0;
      state.serviceCatalogPricing = serviceCatalogPricing || 0;
      state.serviceCatalogOnceOffFee = serviceCatalogOnceOffFee || 0;
      state.serviceSelections = serviceSelections || {};
      state.serviceType = serviceType || 'accounting';
    },
    resetPriceState: () => {
      localStorage.removeItem(STORAGE_KEY);
      return initialState;
    },
  }
});

export const { setResponses, updateResponse, setQuestionsPricing, setServiceCatalogPricing, setServiceSelections, setQuestionsOnceOffFee, setServiceCatalogOnceOffFee, setClientName, setActivePriceId, loadSavedPrice, resetPriceState } = responsesSlice.actions;
export default responsesSlice.reducer;
