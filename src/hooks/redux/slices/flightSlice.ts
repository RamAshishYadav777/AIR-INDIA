import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../../lib/supabase";

import toast from "react-hot-toast";

export interface Flight {
  id: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  status: string;
  created_at?: string;
}

interface FlightState {
  list: Flight[];
  loading: boolean;
  adding: boolean;
  error: string | null;
}

const initialState: FlightState = {
  list: [],
  loading: false,
  adding: false,
  error: null,
};

// ✅ 1. Fetch all flights
export const fetchFlights = createAsyncThunk<Flight[]>(
  "flights/fetchFlights",
  async () => {
    const { data, error } = await supabase
      .from("flights")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching flights:", error.message);
      throw new Error(error.message);
    }
     console.log("Fetched flights:", data);

    return data as Flight[];
  }
);

// ✅ 2. Add a new flight (timestamp fix)
export const addFlight = createAsyncThunk<
  Flight,
  Omit<Flight, "id" | "status" | "created_at">
>("flights/addFlight", async (flightData) => {
  // ✅ Ensure departure and arrival are valid ISO timestamps with timezone
  const formatToISO = (dateString: string) => {
    if (!dateString) return null;
    // dateString from <input type="datetime-local" /> like "2025-11-04T10:30"
    const date = new Date(dateString);
    return date.toISOString(); // → Proper UTC ISO format
  };

  const formattedData = {
    ...flightData,
    departure_time: formatToISO(flightData.departure_time),
    arrival_time: formatToISO(flightData.arrival_time),
    status: "On Time",
  };

  const { data, error } = await supabase
    .from("flights")
    .insert([formattedData])
    .select()
    .single();

  if (error) {
    console.error("❌ Supabase insert error:", error.message);
    throw new Error(error.message);
  }

  toast.success("✈️ Flight added successfully!");
  return data as Flight;
});


// ✅ 2.5 Delete a flight
export const deleteFlight = createAsyncThunk<string, string>(
  "flights/deleteFlight",
  async (flightId) => {
    const { error } = await supabase.from("flights").delete().eq("id", flightId);

    if (error) {
      console.error("❌ Error deleting flight:", error.message);
      throw new Error(error.message);
    }

    toast.success("🗑️ Flight deleted successfully!");
    return flightId;
  }
);

// ✅ 3. Slice
const flightSlice = createSlice({
  name: "flights",
  initialState,
  reducers: {
    clearFlights: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchFlights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlights.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchFlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch flights";
      })

      // Add
      .addCase(addFlight.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(addFlight.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to add flight";
      })

      // Delete
      .addCase(deleteFlight.fulfilled, (state, action) => {
        state.list = state.list.filter((flight) => flight.id !== action.payload);
      })
      .addCase(deleteFlight.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to delete flight";
      });
  },
});

export const { clearFlights } = flightSlice.actions;
export default flightSlice.reducer;
