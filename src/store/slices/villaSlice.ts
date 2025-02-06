import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Villa {
  _id: string;
  name: {
    en: string;
    th: string;
  };
  title: {
    en: string;
    th: string;
  };
  description: {
    en: string;
    th: string;
  };
  beachfront: {
    en: string;
    th: string;
  };
  weekdayPrice: number;
  weekdayDiscountedPrice: number;
  weekendPrice: number;
  weekendDiscountedPrice: number;
  priceReductionPerRoom: number;
  maxGuests: number;
  bedrooms: number;
  minRooms: number;
  bathrooms: number;
  bankDetails: Array<{
    bank: string;
    accountNumber: string;
    accountName: string;
  }>;
  backgroundImage?: string;
  slideImages: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VillaState {
  villa: Villa | null;
  loading: boolean;
  error: string | null;
}

const initialState: VillaState = {
  villa: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchVillaDetails = createAsyncThunk(
  'villa/fetchDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/admin/villa');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch villa details');
    }
  }
);

export const updateVillaDetails = createAsyncThunk(
  'villa/updateDetails',
  async (data: Partial<Villa>, { rejectWithValue }) => {
    try {
      const response = await axios.patch('/admin/villa', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update villa details');
    }
  }
);

const villaSlice = createSlice({
  name: 'villa',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setVilla(state, action) {
      state.villa = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVillaDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVillaDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.villa = action.payload;
      })
      .addCase(fetchVillaDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateVillaDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVillaDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.villa = action.payload;
      })
      .addCase(updateVillaDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setVilla } = villaSlice.actions;
export default villaSlice.reducer;
