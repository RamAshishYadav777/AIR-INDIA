import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

export interface Booking {
    id: string;
    booking_id: string;
    pnr: string;
    flight_id: string;
    seat_number: string;
    passenger_name: string;
    passenger_age: number;
    passenger_gender: string;
    checked_in?: boolean;
    payment_status: "success" | "failed" | "pending";
    flights?: {
        flight_number: string;
        origin: string;
        destination: string;
        departure_time: string;
        arrival_time: string;
    };
}

const fetchUserBookings = async (userId: string) => {
    const { data: response } = await api.get(`/bookings/user/${userId}`);
    const tickets: Booking[] = [];
    const data = response.data; // Unified response format
    if (data && Array.isArray(data)) {
        data.forEach((b: any) => {
            if (b.passengers) {
                b.passengers.forEach((p: any) => {
                    tickets.push({
                        id: b._id,
                        booking_id: b.booking_id,
                        pnr: b.pnr,
                        flight_id: b.flight_id?._id,
                        seat_number: p.seat_number,
                        passenger_name: p.name,
                        passenger_age: p.age,
                        passenger_gender: p.gender,
                        checked_in: !!p.checked_in,
                        payment_status: b.payment_status || "success",
                        flights: b.flight_id ? {
                            flight_number: b.flight_id.flight_number,
                            origin: b.flight_id.origin,
                            destination: b.flight_id.destination,
                            departure_time: b.flight_id.departure_time,
                            arrival_time: b.flight_id.arrival_time
                        } : undefined
                    });
                });
            }
        });
    }
    return tickets;
};

export const useUserBookings = (userId: string | undefined) => {
    return useQuery({
        queryKey: ["user-bookings", userId],
        queryFn: () => fetchUserBookings(userId!),
        enabled: !!userId,
    });
};
