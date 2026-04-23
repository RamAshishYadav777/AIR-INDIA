import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import api from "../lib/axios";
import airIndiaLogo from "../assets/logo.png";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Download,
  Printer,
  CheckCircle2,
  User,
  Calendar,
  Clock,
  ChevronLeft,
  Hash,
  Info,
  QrCode,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Passenger {
  id: number | string;
  name: string;
  age: number;
  gender: string;
  seatNumber: string;
  checkedIn: boolean;
  bookingId?: string;
  baggage?: {
    items: { bag_type: string; weight: number; tag_id: string }[];
    counter_processed: boolean;
  };
}

interface LocationState {
  bookingId?: string;
  date?: string;
  passengers?: Passenger[];
}

interface Flight {
  flight_number: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  arrival_time: string;
}

const CheckIn: React.FC = () => {
  const { state, search } = useLocation() as { state?: LocationState; search: string };
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(search);
  const pnrFromQuery = searchParams.get("pnr");

  const bookingId = state?.bookingId || pnrFromQuery;
  const providedPassengers = state?.passengers || [];
  const date = state?.date || new Date().toLocaleDateString();

  const [passengers, setPassengers] = useState<Passenger[]>(providedPassengers);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | string | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const [fetchedBookingId, setFetchedBookingId] = useState<string | null>(null);
  const [fetchedPnr, setFetchedPnr] = useState<string | null>(null);

  const mapDbToPassenger = (p: any, bId: string): Passenger => ({
    id: p._id,
    name: p.name,
    age: p.age,
    gender: p.gender,
    seatNumber: p.seat_number,
    checkedIn: !!p.checked_in,
    bookingId: bId,
    baggage: p.baggage
  });

  const fetchBookingDetails = async () => {
    if (!bookingId) return;
    try {
      setFetching(true);

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(bookingId);
      const endpoint = isMongoId ? `/bookings/${bookingId}` : `/bookings/code/${bookingId}`;

      const response = await api.get(endpoint);
      const booking = response.data.data;

      if (booking) {
        setFetchedBookingId(booking._id);
        setFetchedPnr(booking.pnr);
        const flightInfo = booking.flight_id;

        if (booking.passengers) {
          setPassengers(booking.passengers.map((row: any) => mapDbToPassenger(row, booking.booking_id)));
        }

        if (flightInfo) {
          setFlight({
            flight_number: flightInfo.flight_number,
            from_city: flightInfo.origin,
            to_city: flightInfo.destination,
            departure_time: flightInfo.departure_time,
            arrival_time: flightInfo.arrival_time,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setFetching(false), 800);
    }
  };

  useEffect(() => {
    if (!providedPassengers.length && bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const handleCheckInPassenger = async (passengerId: number | string) => {
    try {
      setActionLoadingId(passengerId);

      const targetBookingId = fetchedBookingId || (state?.bookingId && /^[0-9a-fA-F]{24}$/.test(state.bookingId) ? state.bookingId : null);

      console.log("Debug Check-in:", { targetBookingId, passengerId });

      if (!targetBookingId || !passengerId) {
        alert("Boarding session expired or missing ID. Please refresh.");
        return;
      }

      const { data } = await api.put(`/bookings/${targetBookingId}/checkin`, { passengerId });

      setPassengers(prev => prev.map(p => p.id === passengerId ? { ...p, checkedIn: true } : p));
      console.log("Check-in successful:", data);
    } catch (err: any) {
      console.error("Check-in Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      alert(`Check-in failed: ${errorMsg}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePrintBoardingPass = (passengerId: number | string) => {
    const element = document.getElementById(`boarding-pass-${passengerId}`);
    if (!element) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Air India Boarding Pass</title>
          <style>
            body { margin: 0; padding: 0; }
            @page { size: landscape; margin: 0; }
          </style>
          <link rel="stylesheet" href="${window.location.origin}/src/index.css">
        </head>
        <body>
          ${element.innerHTML}
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadBoardingPass = async (passengerId: number | string) => {
    const element = document.getElementById(`boarding-pass-${passengerId}`);
    if (!element) {
      alert("Boarding pass element not found.");
      return;
    }

    try {
      setActionLoadingId(passengerId);

      // Temporarily make visible for capture
      const originalStyle = element.style.display;
      element.style.display = 'flex';
      element.style.position = 'fixed';
      element.style.top = '-10000px';

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      element.style.display = originalStyle;
      element.style.position = '';
      element.style.top = '';

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85, 220]
      });

      pdf.addImage(imgData, "PNG", 0, 0, 220, 85);
      const p = passengers.find(p => p.id === passengerId);
      pdf.save(`AI_BoardingPass_${p?.name?.replace(/\s+/g, '_') || passengerId}.pdf`);
    } catch (err: any) {
      console.error("PDF Generation Error:", err);
      alert("Failed to generate PDF. Please try again or use Print.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Retrieving Boarding Data</p>
    </div>
  );

  const allChecked = passengers.length > 0 && passengers.every(p => p.checkedIn);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Online Check-In</h1>
            <p className="text-slate-500 font-medium">Verify your details and get your boarding pass</p>
          </div>
          <Card className="border-none shadow-sm flex items-center px-6 py-3 rounded-2xl bg-white">
            <Hash className="w-5 h-5 text-blue-500 mr-3" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">PNR / Ref</p>
              <p className="font-bold text-slate-900">{fetchedPnr || bookingId || "—"}</p>
            </div>
          </Card>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {passengers.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={`border-none shadow-md overflow-hidden transition-all duration-300 ${p.checkedIn ? 'bg-white' : 'bg-white'}`}>
                    <CardContent className="p-8 flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${p.checkedIn ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                          <User className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                            {p.checkedIn ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-0.5 rounded-full flex gap-1 items-center">
                                <CheckCircle2 className="w-3 h-3" />
                                Ready
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-0.5 rounded-full">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm font-medium">{p.gender} • {p.age} Years • Seat {p.seatNumber}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 w-full md:w-auto">
                        {!p.checkedIn ? (
                          <Button
                            onClick={() => handleCheckInPassenger(p.id)}
                            disabled={actionLoadingId === p.id}
                            className="w-full md:w-auto px-8 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-100 transition-all"
                          >
                            {actionLoadingId === p.id ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Check-In"}
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => handleDownloadBoardingPass(p.id)}
                              className="flex-1 md:flex-none h-12 rounded-xl border-2 hover:bg-slate-50 transition-all flex gap-2 font-bold"
                            >
                              <Download className="w-4 h-4" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handlePrintBoardingPass(p.id)}
                              className="flex-1 md:flex-none h-12 rounded-xl border-2 hover:bg-slate-50 transition-all flex gap-2 font-bold"
                            >
                              <Printer className="w-4 h-4" />
                              Print
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Sidebar / Boarding Pass Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-12 space-y-6">
              <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-white p-1 pb-0"></CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Boarding From</p>
                      <p className="text-3xl font-black">{flight?.from_city || "DEL"}</p>
                    </div>
                    <Plane className="w-8 h-8 text-blue-500 rotate-90" />
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Arriving At</p>
                      <p className="text-3xl font-black">{flight?.to_city || "BOM"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <Calendar className="w-3 h-3" /> Date
                      </div>
                      <p className="font-bold">{date}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest justify-end">
                        <Clock className="w-3 h-3" /> Flight
                      </div>
                      <p className="font-bold text-blue-400">{flight?.flight_number || "AI-Express"}</p>
                    </div>
                  </div>

                  <div className="pt-10 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-3xl mb-4">
                      <QrCode className="w-32 h-32 text-slate-900" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Digital Boarding Pass Token</p>
                  </div>
                </CardContent>
                <CardFooter className="bg-blue-600/10 p-6 flex flex-col gap-3">
                  <div className="flex items-start gap-3 w-full">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-200 font-medium leading-relaxed uppercase tracking-tighter text-justify">
                      Carry a valid photo ID and report to the gate at least 45 minutes before departure.
                    </p>
                  </div>
                  {passengers.some(p => p.baggage && p.baggage.items.length > 0 && !p.baggage.counter_processed) && (
                    <div className="w-full bg-amber-500/20 p-3 rounded-xl border border-amber-500/30">
                      <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest text-center leading-tight">
                        ⚠️ Baggage Verification Required at Counter
                      </p>
                    </div>
                  )}
                </CardFooter>
              </Card>

              {allChecked && (
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="w-full h-14 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 font-bold transition-all"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Return to Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Boarding Pass elements for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {passengers.map(p => {
          const departure = flight?.departure_time ? new Date(flight.departure_time) : new Date();
          const boarding = new Date(departure.getTime() - 45 * 60000);
          const flightDate = departure.toLocaleDateString("en-IN", {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          return (
            <div
              key={p.id}
              id={`boarding-pass-${p.id}`}
              className="w-[220mm] h-[85mm] bg-white text-slate-900 font-sans p-0 m-0 border border-slate-200 flex rounded-3xl overflow-hidden relative shadow-2xl"
            >
              {/* Branding Strip */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>

              <div className="w-[155mm] h-full flex flex-col relative overflow-hidden bg-white border-r-2 border-dashed border-slate-300">
                {/* Header */}
                <div className="h-[16mm] bg-[#ed1c24] flex items-center justify-between px-10 text-white shrink-0">
                  <div className="flex items-center gap-4">
                    <p className="font-black text-xl tracking-widest uppercase">Air India Express</p>
                  </div>
                  <p className="font-black text-base tracking-widest uppercase opacity-80 italic">Economy</p>
                </div>

                <div className="flex-grow flex p-6 py-3 gap-6 relative overflow-hidden">
                  {/* Background Airplane and Logo Silhouette */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none flex flex-col items-center gap-8">
                    <img src={airIndiaLogo} alt="" className="w-[80mm] grayscale brightness-0 invert-0" />
                    <Plane className="w-[60mm] h-[60mm] rotate-[-15deg]" fill="currentColor" />
                  </div>

                  {/* Vertical Barcode */}
                  <div className="w-[18mm] h-full flex flex-col items-center justify-center gap-[1px] opacity-80 shrink-0">
                    {[...Array(40)].map((_, i) => (
                      <div key={i} className={`w-full bg-slate-900`} style={{ height: Math.random() > 0.5 ? '4px' : '1px' }}></div>
                    ))}
                  </div>

                  {/* Information Grid */}
                  <div className="flex-grow flex flex-col justify-between py-1 relative z-10">
                    <div className="flex flex-col">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Passenger Name</p>
                      <p className="font-black text-2xl uppercase text-slate-900 leading-tight pb-1">{p.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">From</p>
                        <p className="font-black text-2xl uppercase text-slate-900 leading-none">{flight?.from_city || "DEL"}</p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Flight No.</p>
                        <p className="font-black text-2xl uppercase text-red-600 leading-none">{flight?.flight_number || "AI-101"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">To</p>
                        <p className="font-black text-2xl uppercase text-slate-900 leading-none">{flight?.to_city || "BOM"}</p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Departure Date</p>
                        <p className="font-black text-xl uppercase text-slate-900 leading-none whitespace-nowrap">{flightDate}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="bg-slate-50 p-2 rounded-xl flex flex-col text-center">
                        <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-1">Gate</p>
                        <p className="font-black text-2xl uppercase text-slate-900 leading-none">03</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl flex flex-col text-center">
                        <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-1">Boarding</p>
                        <p className="font-black text-2xl uppercase text-slate-900 leading-none">
                          {boarding.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="bg-[#ed1c24] p-2 rounded-xl flex flex-col text-center text-white shadow-lg shadow-red-50">
                        <p className="text-[9px] font-black uppercase text-white/70 leading-none mb-1">Seat No.</p>
                        <p className="font-black text-2xl uppercase text-white leading-none">{p.seatNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Warning */}
                <div className="h-[8mm] border-t border-slate-50 flex items-center px-10 shrink-0 bg-white">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] text-center w-full">
                    Gate closes 20 minutes prior to departure
                  </p>
                </div>

                {/* Striped Pattern */}
                <div className="h-1.5 w-full bg-[#ed1c24] flex gap-2 overflow-hidden px-1 shrink-0 mt-auto">
                  {[...Array(60)].map((_, i) => (
                    <div key={i} className="h-full w-4 bg-[#fdbd10] skew-x-[-30deg]"></div>
                  ))}
                </div>
              </div>

              {/* Stub Part */}
              <div className="w-[65mm] h-full bg-[#fcfdfe] flex flex-col relative overflow-hidden">
                {/* Stub Header */}
                <div className="h-[20mm] bg-[#ed1c24] flex items-center justify-center text-white relative shrink-0">
                  <p className="font-black text-lg tracking-widest uppercase">Boarding Pass</p>
                </div>

                <div className="flex-grow flex flex-col justify-between p-5 overflow-hidden">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                      <p className="text-[8px] font-black uppercase text-slate-400">Name</p>
                      <p className="text-[10px] font-black uppercase text-slate-900 text-right leading-tight break-words pl-4">{p.name}</p>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                      <p className="text-[8px] font-black uppercase text-slate-400">Route</p>
                      <p className="text-[10px] font-black uppercase text-slate-900 leading-tight">
                        {flight?.from_city || "DEL"} → {flight?.to_city || "BOM"}
                      </p>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-50 pb-1.5 -mt-1">
                      <p className="text-[8px] font-black uppercase text-slate-400">Flight</p>
                      <p className="text-[10px] font-black uppercase text-red-600 leading-tight bg-red-50/50 px-1.5 py-0.5 rounded">{flight?.flight_number || "AI-101"}</p>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                      <p className="text-[8px] font-black uppercase text-slate-400">Date</p>
                      <p className="text-[10px] font-black uppercase text-slate-900 leading-tight whitespace-nowrap">{flightDate}</p>
                    </div>
                    {p.baggage?.counter_processed && p.baggage.items.length > 0 && (
                      <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                        <p className="text-[8px] font-black uppercase text-red-600">Baggage</p>
                        <p className="text-[10px] font-black uppercase text-red-600 leading-tight">
                          {p.baggage.items.length}P / {p.baggage.items.reduce((acc, curr) => acc + curr.weight, 0)}KG
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1 py-2">
                    <div className="text-center bg-slate-50/80 p-1.5 rounded-lg">
                      <p className="text-[7px] font-black uppercase text-slate-400 leading-none mb-0.5">Gate</p>
                      <p className="font-black text-base uppercase text-slate-900 leading-none">03</p>
                    </div>
                    <div className="text-center bg-slate-50/80 p-1.5 rounded-lg border border-red-50">
                      <p className="text-[7px] font-black uppercase text-red-400 leading-none mb-0.5">Time</p>
                      <p className="font-black text-base uppercase text-slate-900 leading-none">
                        {boarding.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-center bg-slate-900 p-1.5 rounded-lg text-white">
                      <p className="text-[7px] font-black uppercase text-white/50 leading-none mb-0.5">Seat</p>
                      <p className="font-black text-base uppercase text-white leading-none">{p.seatNumber}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center pt-2 relative">
                    <div className="absolute opacity-0 pointer-events-none">
                      <QRCodeCanvas
                        value={JSON.stringify({ bid: bookingId, pid: p.id, seat: p.seatNumber })}
                        size={40}
                      />
                    </div>
                    <div className="h-[10mm] w-full flex items-center justify-center gap-[1px] opacity-90 overflow-hidden mb-1">
                      {[...Array(60)].map((_, i) => (
                        <div key={i} className={`h-full bg-slate-950 shrink-0`} style={{ width: Math.random() > 0.6 ? '2px' : '1px' }}></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Striped Pattern */}
                <div className="mt-auto">
                  <div className="h-2 w-full bg-[#ed1c24] flex gap-2 overflow-hidden px-1">
                    {[...Array(30)].map((_, i) => (
                      <div key={i} className="h-full w-4 bg-[#fdbd10] skew-x-[-30deg]"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckIn;
