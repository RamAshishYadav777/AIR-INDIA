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
    const { data } = await api.get('/flights', { params });
    // Ensure id mapping if needed
    return data.map((f: any) => ({
        ...f,
        id: f._id || f.id
    }));
};

export const useFlights = (params?: FlightSearchParams) => {
    return useQuery({
        queryKey: ["flights", params],
        queryFn: () => fetchFlights(params),
        // If params provided, maybe enabled only if valid?
        // But for all flights list (no params), it should run.
    });
};
