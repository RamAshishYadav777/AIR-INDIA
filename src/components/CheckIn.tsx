// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   CircularProgress,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// interface PassengerBooking {
//   booking_id: string;
//   seat_number: string;
//   passenger_name: string;
//   checked_in: boolean;
//   flights: {
//     flight_number: string;
//     from_city: string;
//     to_city: string;
//     flight_date: string;
//     departure_time: string;
//     arrival_time: string;
//   }[];
// }

// const CheckInDashboard: React.FC = () => {
//   const navigate = useNavigate();
//   const [userId, setUserId] = useState<string | null>(null);
//   const [records, setRecords] = useState<PassengerBooking[]>([]);
//   const [loading, setLoading] = useState(true);

//   // 🔥 Step 1 — get logged-in user
//   useEffect(() => {
//     const fetchUser = async () => {
//       const { data } = await supabase.auth.getUser();
//       if (!data.user) {
//         navigate("/login");
//         return;
//       }
//       setUserId(data.user.id);
//     };
//     fetchUser();
//   }, []);

//   // 🔥 Step 2 — Fetch bookings for this user
//   useEffect(() => {
//     if (!userId) return;

//     const fetchBookings = async () => {
//       try {
//         setLoading(true);

//         const { data, error } = await supabase
//           .from("passengers")
//           .select(`
//             booking_id,
//             seat_number,
//             passenger_name,
//             checked_in,
//             flights (
//               flight_number,
//               from_city,
//               to_city,
//               flight_date,
//               departure_time,
//               arrival_time
//             )
//           `)
//           .eq("user_id", userId);

//         if (error) throw error;
//         setRecords((data as PassengerBooking[]) || []);
//       } catch (e) {
//         console.error("❌ Error loading check-in:", e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [userId]);

//   if (loading) {
//     return (
//       <Box textAlign="center" mt={10}>
//         <CircularProgress />
//         <Typography mt={2}>Loading Check-In Details...</Typography>
//       </Box>
//     );
//   }

//   if (!records.length) {
//     return (
//       <Box textAlign="center" mt={10}>
//         <Typography variant="h5">No upcoming flights found</Typography>
//         <Button variant="contained" onClick={() => navigate("/")}>
//           Back to Home
//         </Button>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ px: 3, py: 5 }}>
//       <Typography variant="h4" textAlign="center" mb={4}>
//         ✈ Your Flight Check-In
//       </Typography>

//       {records.map((r, i) => (
//         <Card key={i} sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
//           <CardContent>
//             <Typography variant="h6">
//               Flight {r.flights.flight_number} — {r.flights.from_city} →{" "}
//               {r.flights.to_city}
//             </Typography>

//             <Typography>Date: {r.flights.flight_date}</Typography>
//             <Typography>
//               Time: {r.flights.departure_time} → {r.flights.arrival_time}
//             </Typography>

//             <Box mt={2}>
//               <Typography>
//                 Passenger: <strong>{r.passenger_name}</strong>
//               </Typography>
//               <Typography>
//                 Seat: <strong>{r.seat_number}</strong>
//               </Typography>
//               <Typography>
//                 Booking ID: <strong>{r.booking_id}</strong>
//               </Typography>
//             </Box>

//             {/* Buttons */}
//             {!r.checked_in ? (
//               <Button
//                 variant="contained"
//                 color="success"
//                 sx={{ mt: 2 }}
//                 onClick={() =>
//                   navigate("/checkin", {
//                     state: {
//                       passengers: [
//                         {
//                           name: r.passenger_name,
//                           seatNumber: r.seat_number,
//                         },
//                       ],
//                       bookingId: r.booking_id,
//                       date: r.flights.flight_date,
//                     },
//                   })
//                 }
//               >
//                 Continue Check-In
//               </Button>
//             ) : (
//               <Button
//                 variant="contained"
//                 color="primary"
//                 sx={{ mt: 2 }}
//                 onClick={() =>
//                   navigate("/checkin", {
//                     state: {
//                       passengers: [
//                         {
//                           name: r.passenger_name,
//                           seatNumber: r.seat_number,
//                         },
//                       ],
//                       bookingId: r.booking_id,
//                       date: r.flights.flight_date,
//                     },
//                   })
//                 }
//               >
//                 View Boarding Pass
//               </Button>
//             )}
//           </CardContent>
//         </Card>
//       ))}
//     </Box>
//   );
// };

// export default CheckInDashboard;
