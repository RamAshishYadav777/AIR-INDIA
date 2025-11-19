// src/pages/booking/Payment.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Fade,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../hooks/redux/store";
import { supabase } from "../../lib/supabase";
import {
  setPaymentStatus,
  setBookingId,
} from "../../hooks/redux/slices/bookingSlice";
import { useNavigate } from "react-router-dom";

// ⭐ Import Air India local logo
import airindiaLogo from "../../assets/logo.png";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Payment: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const booking = useSelector((state: RootState) => state.booking);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const amountToPay = booking.price ? booking.price : 5000;

  // ======================================================
  //   FULLSCREEN LOADER (LOCAL AIR INDIA LOGO)
  // ======================================================
  const LoaderOverlay = () => (
    <Fade in={loading}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          bgcolor: "rgba(255, 255, 255, 0.96)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          gap: 3,
        }}
      >
        {/* LOCAL LOGO ALWAYS VISIBLE */}
        <img
          src={airindiaLogo}
          alt="Air India Logo"
          style={{
            width: 150,
            height: "auto",
            objectFit: "contain",
            marginBottom: "10px",
          }}
        />

        {/* ROTATING SPINNER */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "6px solid #d32f2f",
            borderTop: "6px solid transparent",
            animation: "spin 1s linear infinite",
          }}
        />

        <Typography variant="h6" sx={{ color: "#d32f2f", fontWeight: 600 }}>
          Processing your payment...
        </Typography>

        <style>
          {`
          @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
          }
        `}
        </style>
      </Box>
    </Fade>
  );

  // ======================================================
  //   HANDLE PAYMENT SUCCESS (VERIFY + INSERT DATA)
  // ======================================================
  // const handlePaymentSuccess = async (response: any) => {
  //   setLoading(true); // Keep loader ON

  //   try {
  //     const session = (await supabase.auth.getSession()).data.session;

  //     const verifyPayload = {
  //       razorpay_order_id: response.razorpay_order_id,
  //       razorpay_payment_id: response.razorpay_payment_id,
  //       razorpay_signature: response.razorpay_signature,
  //       bookingData: {
  //         user_id: user.id,
  //         flight_id: booking.flightId,
  //         seat_number: booking.seatNumber,
  //         payment_status: "success",
  //       },
  //     };


  const handlePaymentSuccess = async (response: any) => {
    setLoading(true);

    if (!user) {
      alert("User not found. Please login again.");
      navigate("/login");
      return;
    }

    try {
      const session = (await supabase.auth.getSession()).data.session;

      const verifyPayload = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        bookingData: {
          user_id: user.id, // ✅ NOW TYPE-SAFE
          flight_id: booking.flightId,
          seat_number: booking.seatNumber,
          payment_status: "success",
        },
      };

      // Verify payment using edge function
      const { data, error } = await supabase.functions.invoke(
        "verify-razorpay-payment",
        {
          body: verifyPayload,
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );

      if (error || !data?.success) {
        alert("Payment verification failed!");
        return;
      }

      // Save status in Redux
      dispatch(setPaymentStatus("success"));
      dispatch(setBookingId(data.data[0].id));

      // Insert passenger records
      const passengerRecords = booking.passengers.map((p) => ({
        user_id: user.id,
        flight_id: booking.flightId,
        seat_number: booking.seatNumber,
        passenger_name: p.name,
        passenger_age: p.age,
        passenger_gender: p.gender,
        booking_id: data.data[0].id,
        payment_status: "success",
      }));

      await supabase.from("passengers").insert(passengerRecords);

      // Insert payment entry
      await supabase.from("payments").insert([
        {
          booking_id: data.data[0].id,
          razorpay_payment_id: response.razorpay_payment_id,
          amount: amountToPay,
          status: "success",
          payment_status: "success",
        },
      ]);

      // ⭐ Navigate smoothly without flicker
      setTimeout(() => {
        navigate("/booking/confirmation", {
          state: {
            bookingId: data.data[0].id,
            totalPrice: amountToPay,
            date: new Date().toLocaleDateString(),
          },
        });
      }, 200);
    } catch (err) {
      console.error(err);
      alert("Error verifying payment.");
    }
  };

  // ======================================================
  //   START PAYMENT
  // ======================================================
  const handlePayment = async () => {
    if (!user) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const { data: order, error } = await supabase.functions.invoke(
        "create-razorpay-order",
        { body: { amount: amountToPay * 100 } }
      );

      if (error || !order) {
        alert("Failed to create order");
        setLoading(false);
        return;
      }

      // Razorpay Checkout Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Air India Booking",
        description: `Flight Booking - ${booking.flightId}`,
        order_id: order.id,

        // ⭐ Loader stays ON until confirmation loads
        handler: async (response: any) => {
          setLoading(true);
          await handlePaymentSuccess(response);
        },

        prefill: {
          name: user.email,
          email: user.email,
        },
        theme: { color: "#b71c1c" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", () => {
        dispatch(setPaymentStatus("failed"));
        alert("Payment failed");
        setLoading(false);
      });
    } catch (err) {
      alert("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <Box textAlign="center" mt={5}>
      <LoaderOverlay />

      <Typography variant="h5" mb={3}>
        Payment Gateway
      </Typography>

      <Typography mb={2}>
        Confirm your booking and proceed to payment.
      </Typography>

      <Button
        variant="contained"
        color="error"
        disabled={loading}
        onClick={handlePayment}
        sx={{ px: 4, py: 1.5, fontSize: "1.1rem" }}
      >
        {loading ? "Processing..." : `Pay ₹${amountToPay} with Razorpay`}
      </Button>
    </Box>
  );
};

export default Payment;
