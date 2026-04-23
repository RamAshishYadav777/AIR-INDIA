import React from "react";
import HomeBanner from "../components/HomeBanner";
import SearchFlights from "./SearchFlights";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ShieldCheck,
  Globe,
  Clock,
  Star,
  Plane,
  ArrowRight
} from "lucide-react";
import { Flight, useFlights } from "../hooks/useFlights";

const CITY_IMAGES: Record<string, string> = {
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=600",
  "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=600",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=600",
  "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600",
  "Mumbai": "https://images.unsplash.com/photo-1570160841280-7772714c1143?auto=format&fit=crop&q=80&w=600",
  "Delhi": "https://images.unsplash.com/photo-1587474260584-13657452cdd5?auto=format&fit=crop&q=80&w=600",
  "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=600",
  "Tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=600",
  "Singapore": "https://images.unsplash.com/photo-1525596662741-e94ff9f26de1?auto=format&fit=crop&q=80&w=600",
  "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600"
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=600";

const Home: React.FC = () => {
  const { data: flights = [] } = useFlights();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  // Filter for boosted flights or top 3 if none boosted
  const boostedFlights = flights.filter((f: any) => (f as any).is_boosted).slice(0, 3);
  const displayFlights = boostedFlights.length > 0 ? boostedFlights : flights.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 overflow-x-hidden selection:bg-red-600/10">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/[0.03] blur-[160px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/[0.04] blur-[140px] rounded-full translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <motion.section
        style={{ opacity }}
        className="relative z-10"
      >
        <div className="relative h-[85vh] overflow-hidden">
          <HomeBanner />
        </div>
      </motion.section>

      <div className="relative z-20 w-full px-4 md:px-8 lg:px-12 xl:px-20 pt-4">
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full"
          >
            <div className="px-1">
              <SearchFlights />
            </div>
          </motion.div>
        </section>

        <section className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6"
          >
            <div className="space-y-2">
              <h2 className="text-5xl font-black text-slate-800 tracking-tighter">
                Exclusive Global <span className="text-red-600 italic">Offers</span>
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Curated premium deals for you</p>
              </div>
            </div>
            <p className="text-slate-400 font-bold text-xs max-w-xs text-right hidden lg:block">
              Experience world-class hospitality at exceptional values on our most popular global routes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayFlights.map((flight: any, i: number) => (
              <motion.div
                key={flight._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative h-[450px] rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 cursor-pointer"
              >
                <img 
                  src={CITY_IMAGES[flight.destination] || DEFAULT_IMAGE} 
                  alt={flight.destination} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>

                <div className="absolute top-8 right-8">
                  <div className="px-5 py-2 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                    {flight.offer_text || (flight.is_boosted ? "LIMITED DEAL" : "POPULAR")}
                  </div>
                </div>

                <div className="absolute bottom-10 left-10 right-10 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-white text-3xl font-black">{flight.origin.substring(0, 3).toUpperCase()}</span>
                    <div className="flex-grow h-[2px] bg-red-600/50 relative">
                      <Plane className="w-4 h-4 text-red-600 absolute left-1/2 -top-2 -translate-x-1/2 rotate-90" />
                    </div>
                    <span className="text-white text-3xl font-black">{flight.destination.substring(0, 3).toUpperCase()}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Starting from</p>
                      <p className="text-white text-4xl font-black italic tracking-tighter">₹{flight.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:bg-red-600 transition-colors duration-500">
                      <ArrowRight className="w-5 h-5 text-red-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-40">
          {[
            { icon: ShieldCheck, label: "Trust & Safety", desc: "Global Safety Protocols", color: "text-red-600" },
            { icon: Globe, label: "Fly Globally", desc: "Connecting 80+ Cities", color: "text-amber-600" },
            { icon: Clock, label: "Punctuality", desc: "Reliable On-Time Flights", color: "text-red-600" },
            { icon: Star, label: "Royal Service", desc: "Award-winning Comfort", color: "text-amber-600" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 border border-slate-50">
                <item.icon className={`w-6 h-6 ${item.color} group-hover:text-white transition-colors`} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-slate-800">{item.label}</p>
                <p className="text-[11px] text-slate-400 font-bold">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </section>



      </div>
    </div >
  );
};

export default Home;
