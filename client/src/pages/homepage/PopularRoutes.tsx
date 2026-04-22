import React from "react";
import { motion } from "framer-motion";
import delhi from "../../assets/delhi.jpg";
import MumbaiImg from "../../assets/mumbai.jpg";
import LondonImg from "../../assets/london.jpg";
import NewYorkImg from "../../assets/newyork.jpg";
import singaporeImg from "../../assets/singaporeImg.jpg";
import dubaiimg from "../../assets/dubaiimg.jpg";
import { ArrowUpRight } from "lucide-react";

interface Route {
  city: string;
  image: string;
  url: string;
}

const routes: Route[] = [
  {
    city: "Delhi",
    image: delhi,
    url: "https://delhitourism.gov.in/aboutus/index.html",
  },
  {
    city: "Mumbai",
    image: MumbaiImg,
    url: "https://mumbaicity.gov.in/en/about-district/",
  },
  { city: "London", image: LondonImg, url: "https://www.visitlondon.com/" },
  { city: "New York", image: NewYorkImg, url: "https://www.nyctourism.com/" },
  {
    city: "Singapore",
    image: singaporeImg,
    url: "https://www.visitsingapore.com/travel-tips/travelling-to-singapore/",
  },
  { city: "Dubai", image: dubaiimg, url: "https://www.visitdubai.com/en/" },
];

const PopularRoutes: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {routes.map((route, index) => (
        <motion.a
          key={index}
          href={route.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="group block"
        >
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 group-hover:-translate-y-3 group-hover:shadow-[0_40px_80px_-20px_rgba(212,27,45,0.2)]">
            {/* Background Image */}
            <img
              src={route.image}
              alt={route.city}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent"></div>
            <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* Content */}
            <div className="absolute inset-0 p-10 flex flex-col justify-end items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Premium Destination</span>
              </div>

              <div className="flex justify-between items-center w-full">
                <h3 className="text-3xl md:text-4xl font-playfair font-black text-white tracking-tight">
                  {route.city}
                </h3>
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="w-0 h-[2px] bg-red-600 transition-all duration-700 group-hover:w-full"></div>
            </div>
          </div>
        </motion.a>
      ))}
    </div>
  );
};

export default PopularRoutes;
