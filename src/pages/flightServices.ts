import { supabase } from "../lib/supabase";

export const addFlight = async (flightData: any) => {
  const { data, error } = await supabase
    .from("flights")
    .insert([
      {
        flight_number: flightData.flight_number,
        origin: flightData.origin,
        destination: flightData.destination,
        departure_time: flightData.departure_time,
        arrival_time: flightData.arrival_time,
        price: flightData.price,
        status: flightData.status || "On Time",
      },
    ]);

  if (error) {
    console.error("Error inserting flight:", error);
    throw error;
  }

  return data;
};

export const fetchFlights = async () => {
  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .order("departure_time", { ascending: true });

  if (error) {
    console.error("Error fetching flights:", error);
    return [];
  }

  return data;
};
