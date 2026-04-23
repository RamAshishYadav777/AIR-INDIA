import React from "react";
import { motion } from "framer-motion";
import FlightIcon from "@mui/icons-material/Flight";
import WorkIcon from "@mui/icons-material/Work";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LiveTvIcon from "@mui/icons-material/LiveTv";

interface Service {
  title: string;
  desc: string;
  icon: any;
  link: string;
}

const services: Service[] = [
  {
    title: "In-Flight Meals",
    desc: "Delicious meals curated by Air India chefs, served with warmth and care.",
    icon: RestaurantIcon,
    link: "https://www.airindia.com/in/en/experience/in-air/whats-on-my-ai/dining-experience.html",
  },
  {
    title: "Baggage Allowance",
    desc: "Carry what you need — Air India offers generous baggage policies.",
    icon: WorkIcon,
    link: "https://www.airindia.com/in/en/travel-information/baggage-guidelines/checked-baggage-allowance.html",
  },
  {
    title: "Flight Status",
    desc: "Track live flight updates and schedules directly from Air India.",
    icon: FlightIcon,
    link: "https://www.airindia.com/in/en/manage/flight-status.html",
  },
  {
    title: "In-Flight Entertainment",
    desc: "Sit back and enjoy Air India’s latest movies, music, and TV shows onboard.",
    icon: LiveTvIcon,
    link: "https://www.airindia.com/in/en/experience/in-air/whats-on-my-ai/inflight-entertainment.html",
  },
];

const Services: React.FC = () => {
  return (
    <div className="py-20 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <motion.a
              key={index}
              href={service.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group block"
            >
              <div className="relative h-full bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-red-900/10 hover:-translate-y-2 overflow-hidden">
                {/* Card Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.02] rounded-full translate-x-12 -translate-y-12 transition-transform duration-700 group-hover:scale-150"></div>

                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center transition-colors duration-500 group-hover:bg-red-600">
                    <Icon className="text-red-600 group-hover:text-white transition-colors duration-500 !text-3xl" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-playfair font-black text-slate-900 tracking-tight group-hover:text-red-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      {service.desc}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    Explore Details
                    <div className="w-4 h-[1px] bg-red-600"></div>
                  </div>
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
};

export default Services;
