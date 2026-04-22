import React, { Suspense, useEffect, useState } from "react";

import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { store } from "./hooks/redux/store";
import router from "./routes/appRoutes";
import { Toaster } from "react-hot-toast";
import LoadingScreen from "./components/ui/LoadingScreen";
import { loadUser } from "./hooks/redux/slices/authSlice";
import Chatbot from "./components/Chatbot";
import { useAppDispatch } from "./hooks/redux/hooks";

// ====================================================
// 🔵 Auth Context (Optional if needed elsewhere, otherwise state is in Redux)
// ====================================================
// const AuthContext = createContext<any>(null);
// export const useAuth = () => useContext(AuthContext);

// ====================================================
// 🔵 Supabase Auth Provider
// ====================================================
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and load user
    const initAuth = async () => {
      await dispatch(loadUser());
      setLoading(false);
    };
    initAuth();
  }, [dispatch]);

  if (loading) return <LoadingScreen />;

  return <>{children}</>;
};

// ====================================================
// 🔵 Main App Content
// ====================================================
const AppContent = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/react-query";
import { socket } from "./lib/socket"; // Import socket instance

import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import type { RootState } from "./hooks/redux/store";

// ====================================================
// 🔵 Real-time Socket Manager
// ===================================
const SocketManager = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const userId = user?.id || (user as any)?._id;
    console.log("🔌 SocketManager: Current user ID:", userId);

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      if (userId) {
        console.log(`🔌 SocketManager: Re-joining room ${userId}`);
        socket.emit("join", userId);
      }
    });

    if (userId) {
      console.log(`🔌 SocketManager: Joining room ${userId}`);
      socket.emit("join", userId);
    }

    socket.on("notification", (notification: any) => {
      console.log("🔔 Real-time notification received:", notification);

      // Auto-refresh queries if data is included
      if (notification.type === "BOOKING_SUCCESS" || notification.type === "CHECKIN_SUCCESS") {
        queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
        queryClient.invalidateQueries({ queryKey: ["booking"] });
      }

      try {
        const audio = new Audio("/mixkit-sci-fi-confirmation-914.mp3");
        audio.volume = 0.5;
        audio.play().catch(e => console.warn("Audio play blocked", e));
      } catch (err) {
        console.error("Audio error:", err);
      }

      toast(
        () => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-bold text-blue-400">
              <span>{notification.title}</span>
            </div>
            <p className="text-xs text-slate-300">{notification.message}</p>
          </div>
        ),
        {
          duration: 6000,
          icon: '✈️',
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
        }
      );
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.log("⚠️ Socket connection error:", error);
    });

    return () => {
      socket.off("connect");
      socket.off("notification");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [user, queryClient]);

  return null; // This component doesn't render anything
};

// ====================================================
// 🔵 Root App Wrapper
// ====================================================
const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <AuthProvider>
          <SocketManager />
          <AppContent />
          {/* Toasts */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: "#333", color: "#fff" },
            }}
          />
          {/* AI Chatbot */}
          <Chatbot />
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
};


export default App;
