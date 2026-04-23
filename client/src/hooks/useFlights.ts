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
        const response = await api.get('/flights', { params });
        
        // Handle both { success: true, data: [...] } and raw [...] responses
        let flightData = [];
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
            flightData = response.data.data;
        } else if (Array.isArray(response.data)) {
            flightData = response.data;
        } else if (response.data && Array.isArray(response.data.flights)) {
            flightData = response.data.flights;
        }

        return flightData.map((f: any) => ({
            ...f,
            id: f._id || f.id
        }));
    } catch (error) {
        console.error("fetchFlights error:", error);
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
