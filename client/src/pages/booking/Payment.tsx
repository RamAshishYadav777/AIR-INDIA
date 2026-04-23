import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import { setPaymentStatus, setBookingId } from "../../hooks/redux/slices/bookingSlice";
import type { RootState } from "../../hooks/redux/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, Loader2, Plane, Lock, AlertCircle, Luggage, Armchair } from "lucide-react";
import airindiaLogo from "../../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

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

  const amountToPay = booking.price || 0;
  const baggageFees = booking.baggage.reduce((acc, curr) => acc + curr.price, 0);
  const seatAddon = booking.seatAddon || 0;
  const baseFlightFare = booking.basePrice || 0;


  const handlePaymentSuccess = async (response: any) => {
    setLoading(true);
    if (!user) {
      alert("User not found. Please login again.");
      navigate("/login");
      return;
    }

    try {
      // 1. Verify Payment
      const verifyPayload = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      };

      const { data: verifyRes } = await api.post("/payments/verify-payment", verifyPayload);
      // const verifyData = verifyRes.data; // removed unused

      if (!verifyRes.success) {
        alert("Payment verification failed! Please contact support.");
        setLoading(false);
        return;
      }

      // 2. Create Booking
      const userId = (user as any).id || (user as any)._id; // Support both naming conventions

      const bookingData = {
        user_id: userId,
        flight_id: booking.flightId,
        booking_id: response.razorpay_order_id,
        total_amount: amountToPay,
        payment_status: "completed",
        razorpay_payment_id: response.razorpay_payment_id,
        passengers: booking.passengers.map(p => ({
          name: p.name,
          age: p.age,
          gender: p.gender,
          phone: p.phone,
          seat_number: booking.seatNumber || "Unassigned",
          baggage: {
            items: booking.baggage.map(b => ({
              bag_type: b.name,
              weight: b.weight,
              tag_id: `AI-BAG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            })),
            counter_processed: false
          }
        }))
      };

      console.log("Creating booking with data:", bookingData);
      const { data: bookingRes } = await api.post("/bookings", bookingData);
      const bookingResponse = bookingRes.data;

      dispatch(setPaymentStatus("success"));
      dispatch(setBookingId(bookingResponse._id));

      setTimeout(() => {
        navigate("/booking/confirmation", {
          state: {
            bookingId: bookingResponse._id,
            totalPrice: amountToPay,
            date: new Date().toLocaleDateString(),
          },
        });
      }, 500);
    } catch (err: any) {
      console.error("Booking Creation Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      alert(`Error processing booking: ${errorMsg}`);
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      if (!window.Razorpay) {
        alert("Payment gateway is not currently available. Please check your internet connection and refresh the page.");
        setLoading(false);
        return;
      }

      // Ensure amount is a clean integer
      const cleanAmount = Math.round(amountToPay);

      const { data: orderRes } = await api.post("/payments/create-order", { amount: cleanAmount });
      const order = orderRes.data;
      console.log("Order created:", order);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Air India Booking",
        description: `Flight Booking - ${booking.flightId}`,
        order_id: order.id,
        handler: handlePaymentSuccess,
        prefill: {
          name: user.fullName || user.email,
          email: user.email,
        },
        theme: { color: "#e11d48" },
      };


      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        dispatch(setPaymentStatus("failed"));
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error("Razorpay Initialization Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Initialization failed";
      alert(`Something went wrong initializing payment: ${errorMsg}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center justify-center">
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div className="relative">
              <img src={airindiaLogo} alt="Air India" className="w-40 mb-12 animate-pulse" />
              <div className="absolute -bottom-4 -right-4 bg-rose-600 p-2 rounded-full">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-8 tracking-tight">Confirming Your Flight</h2>
            <p className="text-slate-500 mt-2 font-medium">Please do not close this window...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="flex justify-center mb-8">
          <img src={airindiaLogo} alt="Air India" className="h-12" />
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-10 pb-20">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-black">Checkout</CardTitle>
                <CardDescription className="text-slate-400">Complete your payment securely</CardDescription>
              </div>
              <div className="bg-rose-500/20 p-4 rounded-3xl border border-rose-500/30">
                <Lock className="w-8 h-8 text-rose-500" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-10 -mt-10">
            <div className="bg-white rounded-[2rem] shadow-xl p-8 space-y-8 border border-slate-100">
              <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-slate-400">
                <span>Flight Summary</span>
                <span className="text-rose-600 px-3 py-1 bg-rose-50 rounded-full">Secure</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Plane className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Base Flight Fare</p>
                      <p className="text-xs text-slate-500">Flight {booking.flightId}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">₹{baseFlightFare.toLocaleString()}</span>
                </div>

                {seatAddon > 0 && (
                  <div className="flex justify-between items-center text-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg opacity-60">
                        <Armchair className="w-5 h-5 text-slate-600" />
                      </div>
                      <p className="font-medium text-sm">Seat Preference (Seat {booking.seatNumber})</p>
                    </div>
                    <span className="font-bold">₹{seatAddon.toLocaleString()}</span>
                  </div>
                )}

                {baggageFees > 0 && (
                  <div className="flex justify-between items-center text-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg opacity-60">
                        <Luggage className="w-5 h-5 text-slate-600" />
                      </div>
                      <p className="font-medium text-sm">Additional Baggage</p>
                    </div>
                    <span className="font-bold">₹{baggageFees.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-500 font-medium">Total Payable Amount</span>
                  <span className="text-4xl font-black text-rose-600 tracking-tight">₹{amountToPay.toLocaleString()}</span>
                </div>


                <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 border border-amber-100">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-snug">
                    By clicking "Pay Now", you agree to our terms of carriage and refund policies.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-10 pt-0">
            <Button
              disabled={loading}
              onClick={handlePayment}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white h-20 rounded-[1.5rem] font-black text-xl shadow-lg shadow-rose-200 transition-all flex gap-3 group"
            >
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-7 h-7 group-hover:scale-110 transition-transform" />
                  Pay Now with Razorpay
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 flex justify-center items-center gap-6 opacity-40 grayscale">
          <ShieldCheck className="w-10 h-10" />
          <div className="h-6 w-px bg-slate-300"></div>
          <span className="text-xs font-bold uppercase tracking-widest">PCI-DSS Compliant</span>
          <div className="h-6 w-px bg-slate-300"></div>
          <span className="text-xs font-bold uppercase tracking-widest">256-bit SSL</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Payment;
