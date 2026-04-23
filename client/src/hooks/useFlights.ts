import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

export interface Flight {
    id: string; // Mongo ID or mapped
    flight_number: string;
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
    price: number;
    status: string;
}

interface FlightSearchParams {
    origin?: string;
    destination?: string;
    date?: string;
}

const fetchFlights = async (params?: FlightSearchParams): Promise<Flight[]> => {
    try {
        const targetUrl = '/flights';
        console.log(`🌐 Fetching flights from: ${api.defaults.baseURL}${targetUrl}`);
        
        const response = await api.get(targetUrl, { params });
        
        console.log("📦 API Response Status:", response.status);
        console.log("📦 API Data Received:", response.data);

        // Handle both { success: true, data: [...] } and raw [...] responses
        let flightData = [];
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
            flightData = response.data.data;
        } else if (Array.isArray(response.data)) {
            flightData = response.data;
        } else if (response.data && Array.isArray(response.data.flights)) {
            flightData = response.data.flights;
        }

        console.log(`✅ Parsed ${flightData.length} flights.`);

        return flightData.map((f: any) => ({
            ...f,
            id: f._id || f.id
        }));
    } catch (error: any) {
        console.error("❌ fetchFlights ERROR:", error.message);
        if (error.response) {
            console.error("❌ Server Error Data:", error.response.data);
        }
        return [];
    }
};

export const useFlights = (params?: FlightSearchParams) => {
    return useQuery({
        queryKey: ["flights", params],
        queryFn: () => fetchFlights(params),
        // If params provided, maybe enabled only if valid?
        // But for all flights list (no params), it should run.
    });
};
