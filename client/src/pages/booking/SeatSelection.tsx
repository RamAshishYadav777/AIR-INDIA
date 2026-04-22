import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { setSeatNumber, setFlightId, setPrice, setBasePrice, setSeatAddon } from "../../hooks/redux/slices/bookingSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Info, Armchair, ChevronRight, Plane } from "lucide-react";
import { motion } from "framer-motion";

interface Seat {
  id: string;
  type: "window" | "aisle" | "middle";
  class: "Business" | "Economy";
  price: number;
  isOccupied?: boolean;
}

const SeatSelection: React.FC = () => {
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const flightId = params.get("flight");
  const initialPrice = params.get("price") ? Number(params.get("price")) : 0;

  const [flightPrice, setFlightPrice] = useState<number>(initialPrice);
  const [fetching, setFetching] = useState<boolean>(!!flightId);

  useEffect(() => {
    const fetchFlight = async () => {
      if (!flightId || flightId === 'undefined') {
        setFetching(false);
        return;
      }

      setFetching(true);
      dispatch(setFlightId(flightId));

      try {
        const { data } = await api.get(`/flights/${flightId}`);
        if (data && data.price) {
          setFlightPrice(data.price);
        }
      } catch (err) {
        console.error("Error fetching flight price:", err);
      } finally {
        setFetching(false);
        // If price is still 0 after fetch, use the fallback
        setFlightPrice(prev => prev || 1500);
      }
    };

    fetchFlight();
  }, [flightId, dispatch]);

  const seatsPerRow = ["A", "B", "C", "D", "E", "F"];
  const businessRows = 2;
  const economyRows = 10;

  const generateSeats = (rows: number, seatClass: "Business" | "Economy", startRow: number) => {
    const seatList: Seat[] = [];

    for (let row = 0; row < rows; row++) {
      const rowNumber = startRow + row;
      seatsPerRow.forEach((letter) => {
        const type: Seat["type"] = (letter === "A" || letter === "F") ? "window" : (letter === "C" || letter === "D") ? "aisle" : "middle";

        // ADDON LOGIC: 
        // 1. Upgrade fee for Business
        const classUpgrade = seatClass === "Business" ? Math.round(flightPrice * 1.5) : 0;
        // 2. Convenience fee for preferred seats
        const preferredFee = type === "window" ? 500 : type === "aisle" ? 300 : 0;

        const addon = classUpgrade + preferredFee;

        seatList.push({
          id: `${rowNumber}${letter}`,
          type,
          class: seatClass,
          price: addon, // Price here will be the ADDON fee
          isOccupied: Math.random() < 0.15,
        });
      });
    }
    return seatList;
  };

  const businessSeats = useMemo(() => generateSeats(businessRows, "Business", 1), [flightPrice]);
  const economySeats = useMemo(() => generateSeats(economyRows, "Economy", businessRows + 1), [flightPrice]);

  const selectedSeat = useMemo(() => {
    if (!selectedSeatId) return null;
    return businessSeats.find(s => s.id === selectedSeatId) ||
      economySeats.find(s => s.id === selectedSeatId) || null;
  }, [selectedSeatId, businessSeats, economySeats]);

  const handleSelectSeat = (seat: Seat) => {
    if (seat.isOccupied) return;
    setSelectedSeatId(seat.id === selectedSeatId ? null : seat.id);
  };

  const handleContinue = () => {
    if (!selectedSeat) return;

    if (flightPrice <= 0) {
      alert("Flight details are still loading. Please wait a moment or refresh the page.");
      return;
    }

    dispatch(setSeatNumber(selectedSeat.id));
    dispatch(setBasePrice(flightPrice));
    dispatch(setSeatAddon(selectedSeat.price));
    dispatch(setPrice(flightPrice + selectedSeat.price));
    navigate("/booking/baggage", {
      state: {
        seatClass: selectedSeat.class,
        seatPrice: flightPrice + selectedSeat.price // Pass total so far
      }
    });
  };

  const renderSeatMap = (seats: Seat[], title: string) => (
    <div className="mb-10">
      <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
        <div className={`w-2 h-6 rounded-full ${title === 'Business' ? 'bg-indigo-600' : 'bg-blue-500'}`}></div>
        {title} Class
      </h3>
      <div className="flex flex-col gap-3">
        {Array.from(new Set(seats.map(s => s.id.replace(/[A-F]/, "")))).map(rowNum => (
          <div key={rowNum} className="flex items-center justify-center gap-2 sm:gap-4">
            <span className="w-6 text-xs font-bold text-slate-400">{rowNum}</span>
            <div className="flex gap-2">
              {["A", "B", "C"].map(letter => {
                const seat = seats.find(s => s.id === `${rowNum}${letter}`);
                return seat ? (
                  <button
                    key={seat.id}
                    disabled={seat.isOccupied}
                    onClick={() => handleSelectSeat(seat)}
                    className={`w-9 h-10 sm:w-11 sm:h-12 rounded-lg flex items-center justify-center transition-all duration-200 border-2 ${seat.isOccupied
                      ? "bg-slate-200 border-slate-200 cursor-not-allowed opacity-50"
                      : selectedSeat?.id === seat.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110 z-10"
                        : seat.class === 'Business'
                          ? "bg-indigo-50 border-indigo-100 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-100"
                          : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                  >
                    <Armchair className={`w-5 h-5 ${selectedSeat?.id === seat.id ? 'fill-white' : ''}`} />
                  </button>
                ) : null;
              })}
            </div>
            <div className="w-6"></div> {/* Aisle */}
            <div className="flex gap-2">
              {["D", "E", "F"].map(letter => {
                const seat = seats.find(s => s.id === `${rowNum}${letter}`);
                return seat ? (
                  <button
                    key={seat.id}
                    disabled={seat.isOccupied}
                    onClick={() => handleSelectSeat(seat)}
                    className={`w-9 h-10 sm:w-11 sm:h-12 rounded-lg flex items-center justify-center transition-all duration-200 border-2 ${seat.isOccupied
                      ? "bg-slate-200 border-slate-200 cursor-not-allowed opacity-50"
                      : selectedSeat?.id === seat.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110 z-10"
                        : seat.class === 'Business'
                          ? "bg-indigo-50 border-indigo-100 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-100"
                          : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                  >
                    <Armchair className={`w-5 h-5 ${selectedSeat?.id === seat.id ? 'fill-white' : ''}`} />
                  </button>
                ) : null;
              })}
            </div>
            <span className="w-6 text-xs font-bold text-slate-400 text-right">{rowNum}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 xl:px-0">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Seat Map */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl font-black">Boeing 787-9 Dreamliner</CardTitle>
                  <p className="text-slate-400 mt-2">
                    {fetching ? "Loading flight details..." : "Select your preferred seat for a comfortable journey"}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                    <Plane className="w-10 h-10 text-blue-400 rotate-45" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-10">
              <div className="flex justify-center gap-6 mb-12 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-50 border-2 border-indigo-100"></div>
                  <span className="text-sm font-medium text-slate-600">Business</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white border-2 border-slate-200"></div>
                  <span className="text-sm font-medium text-slate-600">Economy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-600"></div>
                  <span className="text-sm font-medium text-slate-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-200 opacity-50"></div>
                  <span className="text-sm font-medium text-slate-600">Occupied</span>
                </div>
              </div>

              <div className="relative">
                {/* Visual plane body effect */}
                <div className="absolute inset-x-0 top-0 bottom-0 bg-slate-50/50 rounded-[100px] border-x-[20px] border-slate-100 -z-10"></div>

                {renderSeatMap(businessSeats, "Business")}
                <div className="h-px bg-slate-200 my-12 relative">
                  <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Exit Row</span>
                </div>
                {renderSeatMap(economySeats, "Economy")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-3xl overflow-hidden mb-6">
              <CardHeader className="border-b border-white/10 pb-6">
                <CardTitle className="text-xl font-bold">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {selectedSeat ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Seat Number</span>
                      <span className="text-2xl font-black text-blue-400">{selectedSeat.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Class</span>
                      <span className="font-bold">{selectedSeat.class}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Type</span>
                      <span className="font-bold flex items-center gap-2 capitalize">
                        {selectedSeat.type} Side
                      </span>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Base Flight Fare</span>
                          <span className="font-bold text-white">
                            {fetching && !flightPrice ? "Loading..." : `₹${flightPrice.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Seat Selection Fee</span>
                          <span className="font-bold text-white">₹{selectedSeat.price.toLocaleString()}</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                          <span className="text-slate-400 font-bold">Total Price</span>
                          <div className="text-right">
                            <p className="text-3xl font-black text-blue-400">
                              {fetching && !flightPrice ? "Calculating..." : `₹${(flightPrice + selectedSeat.price).toLocaleString()}`}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">+ Baggage & Taxes</p>

                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                      <Armchair className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-slate-400">Please select a seat to see the pricing details</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-white/5 p-6">
                <Button
                  disabled={!selectedSeat}
                  onClick={handleContinue}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 rounded-2xl font-bold text-lg transition-all group"
                >
                  Confirm & Continue
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-none bg-blue-50/50 p-6 rounded-3xl">
              <div className="flex gap-4">
                <Info className="w-6 h-6 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800 leading-relaxed">
                  <strong>Travel Notice:</strong> Window seats provide the best views during takeoff and landing. Aisle seats offer easy access to the cabin.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
