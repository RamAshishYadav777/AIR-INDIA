import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../lib/axios";
import toast from "react-hot-toast";

export interface Flight {
  _id: string; // MongoDB uses _id
  id: string; // Map _id to id for frontend compatibility
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  status: string;
  is_boosted: boolean;
  offer_text?: string;
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

// Fetch all flights
export const fetchFlights = createAsyncThunk<Flight[]>(
  "flights/fetchFlights",
  async () => {
    try {
      const { data } = await api.get('/flights');
      // data.data is the array of flights
      return data.data.map((f: any) => ({ ...f, id: f._id }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch flights");
    }
  }
);

// Add a new flight
export const addFlight = createAsyncThunk<
  Flight,
  Omit<Flight, "_id" | "id" | "status" | "created_at" | "is_boosted" | "offer_text">
>("flights/addFlight", async (flightData) => {
  try {
    const { data } = await api.post('/flights', flightData);
    toast.success("Flight added successfully!");
    const flight = data.data;
    return { ...flight, id: flight._id };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to add flight");
  }
});

// Update a flight
export const updateFlight = createAsyncThunk<
  Flight,
  { id: string; data: Partial<Flight> }
>("flights/updateFlight", async ({ id, data: updateData }) => {
  try {
    const { data } = await api.put(`/flights/${id}`, updateData);
    toast.success("Flight updated successfully!");
    const flight = data.data;
    return { ...flight, id: flight._id };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update flight");
  }
});


// Delete a flight
export const deleteFlight = createAsyncThunk<string, string>(
  "flights/deleteFlight",
  async (flightId) => {
    try {
      await api.delete(`/flights/${flightId}`);
      toast.success("Flight deleted successfully!");
      return flightId;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete flight");
    }
  }
);

// Slice definition
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

      // Update
      .addCase(updateFlight.fulfilled, (state, action) => {
        const index = state.list.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateFlight.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to update flight";
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
