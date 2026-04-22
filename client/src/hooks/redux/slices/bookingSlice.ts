// src/hooks/redux/slices/bookingSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface Passenger {
  name: string;
  age: number;
  gender: string;
  phone: string;
}

interface Baggage {
  id: string;
  name: string;
  weight: number;
  price: number;
}

interface BookingState {
  flightId: string | null;
  seatNumber: string | null;
  passengers: Passenger[];
  baggage: Baggage[];
  bookingId: string | null;
  paymentStatus: "pending" | "success" | "failed";
  basePrice: number;
  seatAddon: number;
  price: number | null;
}

const initialState: BookingState = {
  flightId: null,
  seatNumber: null,
  passengers: [],
  baggage: [],
  bookingId: null,
  paymentStatus: "pending",
  basePrice: 0,
  seatAddon: 0,
  price: null,
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

    setPrice: (state, action: PayloadAction<number>) => {
      state.price = action.payload;
    },

    setBasePrice: (state, action: PayloadAction<number>) => {
      state.basePrice = action.payload;
    },

    setSeatAddon: (state, action: PayloadAction<number>) => {
      state.seatAddon = action.payload;
    },

    setBaggage: (state, action: PayloadAction<Baggage[]>) => {
      state.baggage = action.payload;
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
  setPrice,
  setBasePrice,
  setSeatAddon,
  setBaggage,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
