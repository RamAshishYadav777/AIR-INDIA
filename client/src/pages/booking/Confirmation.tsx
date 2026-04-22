import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Plane, Calendar, User, Hash, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { useBooking } from "../../hooks/useBooking";

interface LocationState {
  bookingId?: string;
  totalPrice?: number;
  date?: string;
}

const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: LocationState };

  const bookingId = state?.bookingId;
  const totalPrice = state?.totalPrice || 0;
  const date = state?.date || new Date().toLocaleDateString();
  const pdfRef = useRef<HTMLDivElement>(null);

  const { data, isLoading: loading } = useBooking(bookingId);
  const passengers = data?.passengers || [];
  const flight = data?.flight || null;

  const handleDownloadPDF = async () => {
    const input = pdfRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`AirIndia_Ticket_${bookingId || "Booking"}.pdf`);
  };

  const handleCheckIn = () => {
    if (!passengers.length) return;
    const formattedPassengers = passengers.map((p) => ({
      id: p.id,
      name: p.passenger_name,
      age: p.passenger_age,
      gender: p.passenger_gender,
      seatNumber: p.seat_number,
      checkedIn: !!p.checked_in,
    }));

    navigate("/checkin", {
      state: {
        passengers: formattedPassengers,
        bookingId,
        date,
        flight,
        totalPrice,
      },
    });
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Booking Confirmed!</h1>
          <p className="text-lg text-slate-500 font-medium">Your journey with Air India starts here.</p>
        </motion.div>

        <Card ref={pdfRef} className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-10 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-block px-4 py-2 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest text-blue-400 border border-white/10">
                  Confirmed Booking
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                  <div>
                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start mb-2">
                      <Hash className="w-4 h-4" />
                      Booking ID
                    </CardTitle>
                    <p className="text-xl font-black tracking-tighter opacity-70">{bookingId}</p>
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-blue-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      PNR NO
                    </CardTitle>
                    <p className="text-3xl font-black tracking-widest text-white">{data?.pnr || "------"}</p>
                  </div>
                </div>
              </div>

              {flight && (
                <div className="flex items-center gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-400">Origin</p>
                    <p className="text-2xl font-black uppercase">{flight.origin}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Plane className="w-6 h-6 text-blue-400 rotate-90" />
                    <div className="w-16 h-px bg-slate-700"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-400">Destination</p>
                    <p className="text-2xl font-black uppercase">{flight.destination}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Visual ticket notch effects */}
            <div className="absolute left-0 bottom-0 translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-slate-50 rounded-full"></div>
            <div className="absolute right-0 bottom-0 translate-y-1/2 translate-x-1/2 w-8 h-8 bg-slate-50 rounded-full"></div>
          </CardHeader>

          <CardContent className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Details
                </h3>
                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 mt-1">Departure</span>
                    <div className="text-right">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">
                        {flight?.departure_time ? new Date(flight.departure_time).toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short' }) : ''}
                      </p>
                      <p className="font-black text-slate-900 text-lg">
                        {flight?.departure_time ? new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Check Ticket'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 mt-1">Arrival</span>
                    <div className="text-right">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">
                        {flight?.arrival_time ? new Date(flight.arrival_time).toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short' }) : ''}
                      </p>
                      <p className="font-black text-slate-900 text-lg">
                        {flight?.arrival_time ? new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Check Ticket'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Date</span>
                    <span className="font-bold text-slate-900">
                      {flight?.departure_time
                        ? new Date(flight.departure_time).toLocaleDateString("en-IN", {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                        : (date || new Date().toLocaleDateString("en-IN"))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Passenger List
                </h3>
                <div className="space-y-4">
                  {passengers.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <div>
                        <p className="font-bold text-slate-900">{p.passenger_name}</p>
                        <p className="text-xs text-slate-500">{p.passenger_age} Years • {p.passenger_gender}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-blue-600 mb-1">SEAT</p>
                        <p className="font-black text-slate-900 text-xl">{p.seat_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-dashed border-slate-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                  <p className="text-4xl font-black text-slate-900">₹{totalPrice}</p>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleDownloadPDF}
                    className="h-14 px-6 rounded-2xl font-bold border-2 hover:bg-slate-50 transition-all flex gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Save PDF
                  </Button>
                  <Button
                    onClick={handleCheckIn}
                    className="h-14 px-8 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex gap-2"
                  >
                    Web Check-in
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 p-6 flex justify-center">
            <Button
              variant="link"
              onClick={() => navigate("/")}
              className="text-slate-500 font-bold hover:text-slate-900"
            >
              Return to Flight Search
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center">
          <p className="text-slate-400 text-sm">
            A confirmation email has been sent to your registered address.
            <br />Thank you for choosing Air India.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
