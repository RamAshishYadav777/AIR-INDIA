import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

export interface Passenger {
    id: string;
    passenger_name: string;
    passenger_age: number;
    passenger_gender: string;
    seat_number: string;
    flight_id: string; // The ID string
    checked_in?: boolean;
    baggage?: {
        items: { bag_type: string; weight: number; tag_id: string }[];
        counter_processed: boolean;
    };
}

export interface FlightDetails {
    id: string;
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
}

interface BookingDetails {
    bookingId: string;
    pnr: string;
    passengers: Passenger[];
    flight: FlightDetails | null;
}

const fetchBookingDetails = async (bookingId: string): Promise<BookingDetails> => {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(bookingId);
    const endpoint = isMongoId ? `/bookings/${bookingId}` : `/bookings/code/${bookingId}`;
    const { data } = await api.get(endpoint);
    console.log("Raw Booking Data from Server:", data);

    let passengers: Passenger[] = [];
    let flight: FlightDetails | null = null;
    let pnr = data?.pnr || bookingId;

    if (data) {
        if (data.passengers) {
            passengers = data.passengers.map((p: any) => ({
                id: p._id,
                passenger_name: p.name,
                passenger_age: p.age,
                passenger_gender: p.gender,
                seat_number: p.seat_number,
                flight_id: data.flight_id?._id || data.flight_id,
                checked_in: p.checked_in,
                baggage: p.baggage
            }));
        }

        if (data.flight_id) {
            const f = data.flight_id;
            flight = {
                id: f._id,
                origin: f.origin,
                destination: f.destination,
                departure_time: f.departure_time,
                arrival_time: f.arrival_time
            };
        }
    }

    return { bookingId, pnr, passengers, flight };
};

export const useBooking = (bookingId: string | undefined) => {
    return useQuery({
        queryKey: ["booking", bookingId],
        queryFn: () => fetchBookingDetails(bookingId!),
        enabled: !!bookingId,
    });
};
