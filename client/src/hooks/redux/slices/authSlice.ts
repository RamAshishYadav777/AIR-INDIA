import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../lib/axios";

// ===============================
// 📦 Types
// ===============================
interface ExtendedUser {
  id: string;
  email?: string;
  fullName?: string | null;
  role?: "user" | "admin" | "agent";
  username?: string;
  avatar?: string | null;
}

interface AuthState {
  user: ExtendedUser | null;
  loading: boolean;
  error: string | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  token: localStorage.getItem('token'),
};

// ===============================
// 🔄 Load User (from token)
// ===============================
// Start of Selection
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const { data } = await api.get('/auth/me');
      return data.data; // User object from new "data" wrapper
    } catch (err: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(err.message || "Failed to load user");
    }
  }
);

// 🔐 Login User
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // New structure: data: { success: true, data: { accessToken, refreshToken, user } }
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return data.data; 
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// 🧾 Signup User
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (
    {
      email,
      password,
      role,
      fullName,
    }: {
      email: string;
      password: string;
      role: "user" | "admin" | "agent";
      fullName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post('/auth/signup', { email, password, role, name: fullName });
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Signup failed");
    }
  }
);

// 🧾 Refresh Token
export const refreshUserToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error("No refresh token found");

      const { data } = await api.post('/auth/refresh', { refreshToken });
      localStorage.setItem('token', data.data.accessToken);
      return data.data.accessToken;
    } catch (err: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(err.response?.data?.message || "Refresh failed");
    }
  }
);

// 🚪 Logout User
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    } catch (err: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return rejectWithValue("Logout failed");
    }
  }
);


// ===============================
// 🧩 Slice
// ===============================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; 
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Refresh Token
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.token = action.payload;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
        state.loading = false;
      })
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
