import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import flightReducer from "./slices/flightSlice";
import bookingReducer from "./slices/bookingSlice"; // ✅ new import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    flights: flightReducer,
    booking: bookingReducer, // ✅ added booking slice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
