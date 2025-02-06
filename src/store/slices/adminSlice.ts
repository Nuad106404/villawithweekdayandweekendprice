import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface DashboardStats {
  totalBookings: number;
  pendingPayments: number;
  totalRevenue: number;
}

interface Booking {
  _id: string;
  customerName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  guests: number;
}

interface AdminState {
  stats: DashboardStats;
  recentBookings: Booking[];
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: {
    totalBookings: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  },
  recentBookings: [],
  bookings: [],
  loading: false,
  error: null
};

// Base URL for admin endpoints (no /api prefix since it's in axios.defaults.baseURL)
const ADMIN_BASE = '/admin';

// Thunks
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async () => {
    const response = await axios.get(`${ADMIN_BASE}/stats`);
    return response.data;
  }
);

export const fetchRecentBookings = createAsyncThunk(
  'admin/fetchRecentBookings',
  async () => {
    const response = await axios.get(`${ADMIN_BASE}/recent-bookings`);
    return response.data;
  }
);

export const fetchAllBookings = createAsyncThunk(
  'admin/fetchAllBookings',
  async () => {
    const response = await axios.get(`${ADMIN_BASE}/bookings`);
    return response.data;
  }
);

export const updateBookingStatus = createAsyncThunk(
  'admin/updateBookingStatus',
  async ({ bookingId, status }: { bookingId: string; status: string }) => {
    const response = await axios.patch(`${ADMIN_BASE}/bookings/${bookingId}/status`, { status });
    return response.data;
  }
);

export const deleteBooking = createAsyncThunk(
  'admin/deleteBooking',
  async (bookingId: string) => {
    await axios.delete(`${ADMIN_BASE}/bookings/${bookingId}`);
    return bookingId;
  }
);

export const updateBooking = createAsyncThunk(
  'admin/updateBooking',
  async ({ bookingId, bookingData }: { bookingId: string; bookingData: Partial<Booking> }) => {
    const response = await axios.patch(`${ADMIN_BASE}/bookings/${bookingId}`, {
      customerName: bookingData.customerName,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      totalPrice: bookingData.totalPrice
    });
    return response.data;
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      // Recent Bookings
      .addCase(fetchRecentBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.recentBookings = action.payload;
      })
      // All Bookings
      .addCase(fetchAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      // Update Booking Status
      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBooking = action.payload;
        state.bookings = state.bookings.map(booking => 
          booking._id === updatedBooking._id ? updatedBooking : booking
        );
      })
      // Update Booking
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBooking = action.payload;
        state.bookings = state.bookings.map(booking => 
          booking._id === updatedBooking._id ? updatedBooking : booking
        );
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update booking';
      })
      // Delete Booking
      .addCase(deleteBooking.fulfilled, (state, action) => {
        const bookingId = action.payload;
        state.bookings = state.bookings.filter(booking => booking._id !== bookingId);
      });
  },
});

export default adminSlice.reducer;
