// src/hooks/redux/slices/bookingSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface Passenger {
  name: string;
  age: number;
  gender: string;
}

interface BookingState {
  flightId: string | null;
  seatNumber: string | null;
  passengers: Passenger[];
  bookingId: string | null;
  paymentStatus: "pending" | "success" | "failed";
  price: number | null;            // ✅ NEW FIELD
}

const initialState: BookingState = {
  flightId: null,
  seatNumber: null,
  passengers: [],
  bookingId: null,
  paymentStatus: "pending",
  price: null,                     // ✅ INITIALIZED
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setFlightId: (state, action: PayloadAction<string>) => {
      state.flightId = action.payload;
    },
    setSeatNumber: (state, action: PayloadAction<string>) => {
      state.seatNumber = action.payload;
    },
    addPassenger: (state, action: PayloadAction<Passenger>) => {
      state.passengers.push(action.payload);
    },
    setPassengers: (state, action: PayloadAction<Passenger[]>) => {
      state.passengers = action.payload;
    },
    setBookingId: (state, action: PayloadAction<string>) => {
      state.bookingId = action.payload;
    },
    setPaymentStatus: (
      state,
      action: PayloadAction<"pending" | "success" | "failed">
    ) => {
      state.paymentStatus = action.payload;
    },

    // ⭐⭐⭐ ADD THIS — store dynamic price
    setPrice: (state, action: PayloadAction<number>) => {
      state.price = action.payload;
    },

    resetBooking: () => initialState,
  },
});

export const {
  setFlightId,
  setSeatNumber,
  addPassenger,
  setPassengers,
  setBookingId,
  setPaymentStatus,
  setPrice,          // ⭐ EXPORT PRICE ACTION
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
