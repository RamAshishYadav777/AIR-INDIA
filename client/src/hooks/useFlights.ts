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
        
        let flightData = [];
        const data = response.data.data;

        if (Array.isArray(data)) {
            flightData = data;
        } else if (response.data.flights) {
            flightData = response.data.flights;
        } else if (Array.isArray(response.data)) {
            flightData = response.data;
        }

        return flightData.map((f: any) => ({
            ...f,
            id: f._id || f.id
        }));
    } catch (error: any) {
        console.error("Flight fetch error:", error.message);
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
