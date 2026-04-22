import React, { useState, useMemo } from "react";
// import { supabase } from "../lib/supabase"; // Removed
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import airportsRaw from "../data/airports.json";
import {
  Container,
  Autocomplete,
  TextField as MuiTextField,
  CircularProgress
} from "@mui/material";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane, ArrowRightLeft, ArrowRight, Clock, ShieldCheck, Star, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

interface Flight {
  id: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  is_boosted?: boolean;
  offer_text?: string;
}

const allAirports: Airport[] = Object.values(airportsRaw as any).map((a: any) => ({
  iata: a.iata,
  name: a.name,
  city: a.city,
  country: a.country,
}));

const SearchFlights: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  // loading state removed, using mutation status
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const navigate = useNavigate();

  const filteredAirports = useMemo(() => {
    const uniqueMap = new Map();
    allAirports.forEach((a) => {
      if (a.iata && a.city) {
        uniqueMap.set(a.iata, {
          label: `${a.city} (${a.iata})`,
          iata: a.iata,
        });
      }
    });
    return Array.from(uniqueMap.values());
  }, []);

  const searchMutation = useMutation({
    mutationFn: async (params: any) => {
      const { data } = await api.get('/flights', { params });
      return data.map((f: any) => ({ ...f, id: f._id || f.id }));
    },
    onSuccess: (data) => {
      setFlights(data);
    },
    onError: (err) => {
      console.error(err);
    }
  });

  const handleSearch = () => {
    if (!origin || !destination) return;
    const params: any = { origin, destination };
    if (departureDate) params.date = departureDate;

    setFlights([]);
    searchMutation.mutate(params);
  };

  const loading = searchMutation.isPending;

  const swapRoute = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <div className="w-full bg-[#FDFCFB] py-12 relative overflow-hidden">
      {/* Decorative Brand Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/[0.03] blur-[160px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/[0.04] blur-[140px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4"></div>

      <Container maxWidth={false} className="space-y-12 relative z-10" sx={{ px: { xs: 2, md: 6, lg: 10 } }}>
        {/* Search Engine Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <div className="mb-8 px-1">
            <h2 className="text-5xl font-black text-slate-800 tracking-tighter">
              Search <span className="text-red-600 italic">Flights</span>
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Premium Booking Experience
              </p>
            </div>
          </div>

          {/* Top Row: Trip Types & Stats */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-3 px-1">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${tripType === 'oneway' ? 'border-red-600' : 'border-slate-300'}`}>
                  {tripType === 'oneway' && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                </div>
                <input type="radio" className="hidden" checked={tripType === 'oneway'} onChange={() => setTripType('oneway')} />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">One Way</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${tripType === 'roundtrip' ? 'border-red-600' : 'border-slate-300'}`}>
                  {tripType === 'roundtrip' && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                </div>
                <input type="radio" className="hidden" checked={tripType === 'roundtrip'} onChange={() => setTripType('roundtrip')} />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Round Trip</span>
              </label>
            </div>

            <div className="flex items-center gap-8">
              <div className="hidden xl:flex items-center gap-2">
                <span className="text-red-700 font-extrabold text-xl">1,67,238</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trips Booked Yesterday</span>
              </div>
            </div>
          </div>

          {/* Main Search Bar: Precision Horizontal Layout */}
          <div className="w-full bg-white border border-slate-300 flex flex-col xl:flex-row items-stretch shadow-sm">

            {/* FROM & TO SECTION */}
            <div className="flex-[1.2] border-b xl:border-b-0 xl:border-r border-slate-300 flex items-center relative">
              <div className="flex-1 p-4 border-r border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-[20px] font-black text-slate-400 uppercase leading-none block">FROM</span>
                  <Autocomplete
                    options={filteredAirports}
                    getOptionLabel={(option) => option.iata}
                    onChange={(_, newValue) => setOrigin(newValue?.iata || "")}
                    sx={{ '& .MuiOutlinedInput-root': { p: 0, '& fieldset': { border: 'none' } } }}
                    renderInput={(params) => (
                      <MuiTextField
                        {...params}
                        placeholder="Origin"
                        variant="outlined"
                        sx={{
                          '& input': {
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#475569',
                            p: '0 !important',
                            textTransform: 'uppercase'
                          }
                        }}
                      />
                    )}
                  />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{origin ? filteredAirports.find(a => a.iata === origin)?.label?.split(' (')[0] : "Select City"}</p>
                </div>
              </div>

              <div className="absolute left-[47.5%] top-1/2 -translate-y-1/2 z-10">
                <button onClick={swapRoute} className="p-1 bg-white border border-slate-100 rounded-sm hover:bg-slate-50 shadow-sm transition-all group">
                  <ArrowRightLeft className="w-4 h-4 text-red-600 transition-transform duration-500 group-hover:rotate-180" />
                </button>
              </div>

              <div className="flex-1 p-4 pl-8">
                <div className="space-y-0.5">
                  <span className="text-[20px] font-black text-slate-400 uppercase leading-none block">TO</span>
                  <Autocomplete
                    options={filteredAirports}
                    getOptionLabel={(option) => option.iata}
                    onChange={(_, newValue) => setDestination(newValue?.iata || "")}
                    sx={{ '& .MuiOutlinedInput-root': { p: 0, '& fieldset': { border: 'none' } } }}
                    renderInput={(params) => (
                      <MuiTextField
                        {...params}
                        placeholder="Destination"
                        variant="outlined"
                        sx={{
                          '& input': {
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#475569',
                            p: '0 !important',
                            textTransform: 'uppercase'
                          }
                        }}
                      />
                    )}
                  />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{destination ? filteredAirports.find(a => a.iata === destination)?.label?.split(' (')[0] : "Select City"}</p>
                </div>
              </div>
            </div>

            {/* DATES SECTION */}
            <div className="flex-1 border-b xl:border-b-0 xl:border-r border-slate-300 flex">
              <div className="flex-1 p-4 border-r border-slate-200">
                <label className="text-[10px] font-black text-slate-400 uppercase block tracking-wider mb-1">Depart</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full text-sm font-black text-slate-800 bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer"
                />
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Select Date</p>
              </div>
              <div className={`flex-1 p-4 ${tripType !== 'roundtrip' && 'opacity-30 pointer-events-none'}`}>
                <label className="text-[10px] font-black text-slate-400 uppercase block tracking-wider mb-1">Return</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full text-sm font-black text-slate-800 bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer"
                />
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Select Date</p>
              </div>
            </div>


            {/* SEARCH ACTION */}
            <div className="xl:w-60 flex items-center justify-center p-3 xl:p-0">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full h-14 xl:h-full transition-all duration-300 flex items-center justify-center text-white font-black uppercase tracking-[0.2em] text-sm bg-[#FAD3D7] hover:bg-[#ED5B6A] hover:shadow-xl hover:-translate-y-1 transform active:scale-95"
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Search"}
              </button>
            </div>
          </div>

          {/* Quick Select Chips */}
          <div className="flex flex-wrap items-center gap-3 px-2">
            <div className="flex items-center gap-2 mr-4">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trending Now:</span>
            </div>
            {[
              { label: "Delhi → Mumbai", from: "DEL", to: "BOM", hot: true },
              { label: "Mumbai → Dubai", from: "BOM", to: "DXB" },
              { label: "London → New York", from: "LHR", to: "JFK", hot: true },
            ].map((route, i) => (
              <button
                key={i}
                onClick={() => { setOrigin(route.from); setDestination(route.to); }}
                className="relative px-6 py-2.5 rounded-2xl bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest hover:border-red-600 hover:text-red-600 transition-all shadow-sm border border-slate-100 group/chip"
              >
                <div className="flex items-center gap-2">
                  {route.label}
                  {route.hot && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>}
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-12 px-4 py-8 border-t border-slate-50 text-slate-400">
            {[
              { icon: ShieldCheck, text: "Air India Assurance", color: "text-red-600" },
              { icon: Clock, text: "Real-time Tracking", color: "text-amber-600" },
              { icon: Star, text: "Signature Lounge", color: "text-red-600" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{feature.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Results Section */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-40 w-full rounded-[3rem] shadow-sm" />
                ))}
              </motion.div>
            ) : flights.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row items-center justify-between px-6 gap-6">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-1.5 bg-red-600 rounded-full"></div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight font-playfair italic">Premium Journeys Found</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Discover {flights.length} curated flight options</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Sort by:</span>
                    <button className="px-6 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-200">Value Fare</button>
                    <button className="px-6 py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors">Fastest</button>
                  </div>
                </div>

                {flights.map((flight) => (
                  <Card key={flight.id} className="border-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_100px_-20px_rgba(212,27,45,0.08)] transition-all duration-700 rounded-[3rem] overflow-hidden group bg-white/70 backdrop-blur-md">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row items-stretch">
                        <div className="p-10 lg:flex-grow flex flex-col md:flex-row items-center justify-between gap-12">
                          {/* Flight Brand */}
                          <div className="flex items-center gap-8">
                            <div className="bg-slate-50 p-6 rounded-[2.25rem] group-hover:bg-red-600 group-hover:text-white transition-all duration-700 shadow-sm group-hover:shadow-red-200 group-hover:scale-105">
                              <Plane className="w-8 h-8 rotate-45" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {flight.is_boosted && (
                                  <motion.div
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: [0.9, 1.05, 0.9] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1 rounded-full shadow-lg shadow-orange-200"
                                  >
                                    <TrendingUp className="w-3 h-3" />
                                    {flight.offer_text || "LIMITED OFFER"}
                                  </motion.div>
                                )}
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100/50">Classic Choice</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300"># {flight.flight_number}</span>
                              </div>
                              <p className="text-2xl font-black text-slate-900 tracking-tight">Air India Express</p>
                              <p className="text-slate-400 font-bold text-[10px] uppercase mt-1 tracking-[0.15em]">Luxury Economy • Airbus A350</p>
                            </div>
                          </div>

                          {/* Timeline/Route */}
                          <div className="flex items-center gap-10 md:gap-16 w-full md:w-auto">
                            <div className="text-center group-hover:translate-x-[-4px] transition-transform duration-500">
                              <p className="text-3xl font-black text-slate-900 tracking-tighter">{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              <p className="text-[12px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em]">{flight.origin}</p>
                            </div>

                            <div className="flex flex-col items-center gap-3 flex-grow md:flex-grow-0">
                              <div className="text-[9px] font-black uppercase tracking-widest text-slate-300">Non-Stop • 2h 15m</div>
                              <div className="flex items-center gap-3 w-32 md:w-48 relative">
                                <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-200"></div>
                                <div className="flex-grow h-[1px] bg-slate-100 relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600 to-transparent w-full h-[2px] -top-[0.5px] scale-x-0 group-hover:scale-x-100 transition-transform duration-1000"></div>
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-all duration-700 delay-100">
                                  <Plane className="w-4 h-4 text-red-600 rotate-90" />
                                </div>
                                <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_15px_rgba(212,27,45,0.4)]"></div>
                              </div>
                              <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Available</div>
                            </div>

                            <div className="text-center group-hover:translate-x-[4px] transition-transform duration-500">
                              <p className="text-3xl font-black text-slate-900 tracking-tighter">{new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              <p className="text-[12px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em]">{flight.destination}</p>
                            </div>
                          </div>
                        </div>

                        {/* Booking Sidebar of Card */}
                        <div className="bg-slate-50/40 lg:w-80 p-10 flex flex-col justify-center items-center lg:border-l border-slate-100 gap-8">
                          <div className="text-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Experience</span>
                            <div className="flex items-baseline justify-center gap-1 mt-2">
                              <span className="text-red-600 font-black text-xl">₹</span>
                              <span className="text-5xl font-black text-slate-900 tracking-tighter">{flight.price.toLocaleString()}</span>
                            </div>
                            <p className="text-[9px] text-red-600/60 font-black uppercase tracking-[0.2em] mt-3 bg-red-50 p-1 px-3 rounded-full">Exclusive Fare</p>
                          </div>
                          <Button
                            onClick={() => navigate(`/booking/seat-selection?flight=${flight.id}&price=${flight.price}`)}
                            className="w-full bg-red-600 hover:bg-slate-900 text-white rounded-[1.25rem] h-16 font-black text-sm tracking-widest uppercase shadow-xl shadow-red-100 transition-all duration-500 flex gap-3 group/btn"
                          >
                            Reserve Seat
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            ) : (
              origin && destination && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24 text-center space-y-6"
                >
                  <div className="bg-red-50 w-20 h-20 rounded-[2rem] shadow-sm flex items-center justify-center mx-auto mb-6 border border-red-100">
                    <Plane className="w-8 h-8 text-red-600 -rotate-45" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">No flights found <br /><span className="text-red-600 italic">for this route</span></h3>
                    <p className="text-slate-500 font-bold max-w-sm mx-auto text-sm">Try changing your dates or seeking different airports. We fly to over 100 destinations worldwide.</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => { setOrigin(""); setDestination(""); }}
                    className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-xs border-slate-200 hover:bg-slate-900 hover:text-white text-slate-500 transition-all shadow-sm"
                  >
                    Clear Search
                  </Button>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </Container>
    </div>
  );
};

export default SearchFlights;
