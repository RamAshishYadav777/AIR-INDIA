// src/hooks/redux/slices/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../../lib/supabase";

// ===============================
// 📦 Types
// ===============================
interface ExtendedUser {
  id: string;
  email?: string;
  fullName?: string | null;
  role?: "user" | "admin";
  username?: string; 
  avatar?: string | null;
}

interface AuthState {
  user: ExtendedUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// ===============================
// 🔄 Persistent Session Fetch
// ===============================
export const fetchSupabaseUser = createAsyncThunk(
  "auth/fetchSupabaseUser",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;
      if (!session?.user) return null;

      const user = session.user;

      return {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name ?? null,
        role: user.user_metadata?.role ?? "user",
        avatar: user.user_metadata?.avatar_url ?? null,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch user");
    }
  }
);

// ===============================
// 🔐 Login User
// ===============================
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("User not found");

      const user = data.user;

      return {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name ?? null,
        role: user.user_metadata?.role ?? "user",
        avatar: user.user_metadata?.avatar_url ?? null,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Login failed");
    }
  }
);

// ===============================
// 🧾 Signup User
// ===============================
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
      role: "user" | "admin";
      fullName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName || "",
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("Signup failed");

      const user = data.user;

      return {
        id: user.id,
        email: user.email,
        fullName: fullName ?? null,
        role: role ?? "user",
        avatar: user.user_metadata?.avatar_url ?? null,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Signup failed");
    }
  }
);

// ===============================
// 🚪 Logout User
// ===============================
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return null;
    } catch (err: any) {
      return rejectWithValue(err.message || "Logout failed");
    }
  }
);

// ===============================
// ✏️ Update Profile (Optional)
// ===============================
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    {
      fullName,
      avatar,
    }: { fullName?: string; avatar?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("No active user session");

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName ?? userData.user.user_metadata.full_name,
          avatar_url: avatar ?? userData.user.user_metadata.avatar_url,
        },
      });

      if (error) throw error;

      return {
        ...userData.user,
        fullName: fullName ?? userData.user.user_metadata.full_name,
        avatar: avatar ?? userData.user.user_metadata.avatar_url,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Profile update failed");
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
      // Fetch User
      .addCase(fetchSupabaseUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSupabaseUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchSupabaseUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
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
        state.user = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.error = null;
        state.loading = false;
      })

      // Profile Update
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user.fullName = action.payload.fullName;
          state.user.avatar = action.payload.avatar;
        }
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
