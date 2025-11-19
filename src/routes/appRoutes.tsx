console.log("✅ Router file loaded successfully");

import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "../layout/user/MainLayout";
// import DashboardLayout from "../pages/dashboardui/admin/DashboardLayout";
import AdminLayout from "../layout/admin/AdminLayout";
import ErrorBoundary from "../components/ErrorBoundary";
import LoadingScreen from "../components/ui/LoadingScreen";
import ProtectedRoute from "../components/ProtectedRoute";
import FlightListPage from "../pages/dashboardui/admin/FlightListPage";
const OurHeroes = lazy(() => import("../components/OurHeroes"));


// 🌍 Public Pages
const Home = lazy(() => import("../pages/Home"));
const Flights = lazy(() => import("../pages/Flights"));
const FlightDetails = lazy(() => import("../pages/FlightDetails"));
const CheckIn = lazy(() => import("../pages/CheckIn"));
// const Tracking = lazy(() => import("../pages/Tracking"));
const Profile = lazy(() => import("../pages/Profile"));
const NotFound = lazy(() => import("../pages/NotFound"));

// 🔐 Auth Pages (Supabase-based)
const Login = lazy(() => import("../pages/auth/user/Login"));
const Signup = lazy(() => import("../pages/auth/user/Signup"));
const AdminLogin = lazy(() => import("../pages/auth/admin/AdminLogin"));
const AdminSignup = lazy(() => import("../pages/auth/admin/AdminSignup"));

// 🧾 Booking Flow Pages
const Booking = lazy(() => import("../pages/booking/Booking"));
const SeatSelection = lazy(() => import("../pages/booking/SeatSelection"));
const PassengerForm = lazy(() => import("../pages/booking/BookingForm"));
const Payment = lazy(() => import("../pages/booking/Payment"));
const Confirmation = lazy(() => import("../pages/booking/Confirmation"));

// 🧭 Dashboard Pages
const UserDashboard = lazy(() => import("../pages/dashboardui/user/UserDashboard"));
const AdminDashboard = lazy(() => import("../pages/dashboardui/admin/AdminDashboard"));
const BookingsList = lazy(() => import("../pages/dashboardui/admin/BookingsList"));
// const Analytics = lazy(() => import("../pages/dashboardui/admin/Analytics"));
const AddFlightPage = lazy(() => import("../pages/dashboardui/admin/AddFlightPage"));

// ✈️ NEW — Check-In Dashboard Page
// const CheckInDashboard = lazy(() => import("../components/CheckIn"));

// 🌀 Suspense Wrapper
const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<LoadingScreen />}>
    <ErrorBoundary>{element}</ErrorBoundary>
  </Suspense>
);



// 🧩 Router Configuration
const router = createBrowserRouter([
  // 🌍 Public + User Pages
  {
    path: "/",
    element: <MainLayout />,
    errorElement: withSuspense(<NotFound />),
    children: [
      { index: true, element: withSuspense(<Home />) },
      { path: "flights", element: withSuspense(<Flights />) },
      { path: "flights/:id", element: withSuspense(<FlightDetails />) },
      { path: "our-heroes", element: withSuspense(<OurHeroes />) },


      // ✈️ Static Seat Map
      { path: "seatmap", element: withSuspense(<FlightDetails />) },

      // ✈️ NEW Check-In Dashboard (user must be logged in)
      // {
      //   path: "checkin-dashboard",
      //   element: withSuspense(
      //     <ProtectedRoute allowedRoles={["user"]}>
      //       {/* <CheckInDashboard /> */}
      //     </ProtectedRoute>
      //   ),
      // },

      // OLD Check-In Page (used after booking confirmation)
      { path: "checkin", element: withSuspense(<CheckIn />) },

      // { path: "tracking", element: withSuspense(<Tracking />) },
      { path: "profile", element: withSuspense(<Profile />) },

      // 🔐 Auth Pages
      { path: "login", element: withSuspense(<Login />) },
      { path: "signup", element: withSuspense(<Signup />) },
      { path: "admin/login", element: withSuspense(<AdminLogin />) },
      { path: "admin/signup", element: withSuspense(<AdminSignup />) },

      // 🧾 Booking Flow
      {
        path: "booking",
        children: [
          {
            index: true,
            element: withSuspense(
              <ProtectedRoute allowedRoles={["user"]}>
                <Booking />
              </ProtectedRoute>
            ),
          },
          {
            path: "seat-selection",
            element: withSuspense(
              <ProtectedRoute allowedRoles={["user"]}>
                <SeatSelection />
              </ProtectedRoute>
            ),
          },
          {
            path: "form",
            element: withSuspense(
              <ProtectedRoute allowedRoles={["user"]}>
                <PassengerForm />
              </ProtectedRoute>
            ),
          },
          {
            path: "payment",
            element: withSuspense(
              <ProtectedRoute allowedRoles={["user"]}>
                <Payment />
              </ProtectedRoute>
            ),
          },
          {
            path: "confirmation",
            element: withSuspense(
              <ProtectedRoute allowedRoles={["user"]}>
                <Confirmation />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },

  // 👤 User Dashboard
  {
    path: "/dashboard/user",
    element: withSuspense(
      <ProtectedRoute allowedRoles={["user"]}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: withSuspense(<UserDashboard />) }],
  },

  // 🛠 Admin Dashboard
  {
    path: "/dashboard/admin",
    element: withSuspense(
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/bookings",
    element: withSuspense(
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout>
          <BookingsList />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
  path: "/dashboard/flightlist",
  element: withSuspense(
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminLayout>
        <FlightListPage />
      </AdminLayout>
    </ProtectedRoute>
  ),
},

  // {
  //   path: "/dashboard/analytics",
  //   element: withSuspense(
  //     <ProtectedRoute allowedRoles={["admin"]}>
  //       <AdminLayout>
  //         <Analytics />
  //       </AdminLayout>
  //     </ProtectedRoute>
  //   ),
  // },
  {
    path: "/dashboard/addflight",
    element: withSuspense(
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout>
          <AddFlightPage />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },

  // 🚫 404
  { path: "*", element: withSuspense(<NotFound />) },
]);

export default router;
console.log("✅ Router exported successfully");
