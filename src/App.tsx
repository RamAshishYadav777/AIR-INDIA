// src/App.tsx
import {
  Suspense,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";

import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { store } from "./hooks/redux/store";
import router from "./routes/appRoutes";
import { Toaster } from "react-hot-toast";
import LoadingScreen from "./components/ui/LoadingScreen";
import Chatbot from "./components/Chatbot";
import { supabase } from "./lib/supabase";

// ⭐ Redux action — MUST import this
import { useAppDispatch } from "./hooks/redux/hooks";
import { fetchSupabaseUser } from "./hooks/redux/slices/authSlice";

// ====================================================
// 🔵 Auth Context
// ====================================================
const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

// ====================================================
// 🔵 Supabase Auth Provider
// ====================================================
const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch(); // ⭐ Needed to update Redux

  useEffect(() => {
    // Get existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);

      // ✔ Also fetch user metadata into Redux
      dispatch(fetchSupabaseUser());
    });

    // Listen for login/logout/token refresh events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      // ✔ When session changes, update Redux user
      dispatch(fetchSupabaseUser());
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  if (loading) return <LoadingScreen />;

  return (
    <AuthContext.Provider value={{ session, user: session?.user }}>
      {children}
    </AuthContext.Provider>
  );
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

// ====================================================
// 🔵 Root App Wrapper
// ====================================================
const App = () => (
  <Provider store={store}>
    <CssBaseline />

    <SupabaseAuthProvider>
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
    </SupabaseAuthProvider>
  </Provider>
);

export default App;
