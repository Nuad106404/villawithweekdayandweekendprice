import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/axios';
import { Booking } from '../../types/booking';

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
  selectedDates: {
    checkIn: string | null;
    checkOut: string | null;
  };
  guests: number;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
  selectedDates: {
    checkIn: null,
    checkOut: null,
  },
  guests: 1,
};

export const fetchBookings = createAsyncThunk(
  'booking/fetchBookings',
  async () => {
    const response = await api.get('/api/admin/bookings');
    return response.data;
  }
);

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData: Partial<Booking>) => {
    const response = await api.post('/api/admin/bookings', bookingData);
    return response.data;
  }
);

export const fetchBooking = createAsyncThunk(
  'booking/fetchBooking',
  async (bookingId: string) => {
    const response = await api.get(`/api/admin/bookings/${bookingId}`);
    return response.data;
  }
);

export const updateBookingStatus = createAsyncThunk(
  'booking/updateStatus',
  async ({ bookingId, status }: { bookingId: string; status: string }) => {
    const response = await api.patch(`/api/admin/bookings/${bookingId}/status`, { status });
    return response.data;
  }
);

export const updateBooking = createAsyncThunk(
  'booking/updateBooking',
  async ({ id, data }: { id: string; data: Partial<Booking> }) => {
    const response = await api.patch(`/api/admin/bookings/${id}`, data);
    return response.data;
  }
);

export const deleteBooking = createAsyncThunk(
  'bookings/deleteBooking',
  async (id: string) => {
    await api.delete(`/api/admin/bookings/${id}`);
    return id;
  }
);

export const sendConfirmationEmail = createAsyncThunk(
  'booking/sendConfirmationEmail',
  async (bookingId: string) => {
    const response = await api.post(`/api/booking/${bookingId}/send-confirmation`);
    return response.data;
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSelectedDates: (state, action) => {
      state.selectedDates = action.payload;
    },
    setGuests: (state, action) => {
      state.guests = action.payload;
    },
    clearBooking: (state) => {
      state.currentBooking = null;
      state.selectedDates = {
        checkIn: null,
        checkOut: null,
      };
      state.guests = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bookings';
      })
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create booking';
      })
      // Fetch Single Booking
      .addCase(fetchBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch booking';
      })
      // Update Booking Status
      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.map(booking =>
          booking._id === action.payload._id ? action.payload : booking
        );
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update booking status';
      })
      // Update Booking
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update booking';
      })
      // Delete Booking
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.filter(booking => booking._id !== action.payload);
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete booking';
      })
      // Send Booking Confirmation Email
      .addCase(sendConfirmationEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendConfirmationEmail.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(sendConfirmationEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send booking confirmation email';
      });
  },
});

export const { setSelectedDates, setGuests, clearBooking } = bookingSlice.actions;

export default bookingSlice.reducer;
