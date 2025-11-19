// import React, { useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Grid,
//   TextField,
//   Typography,
//   MenuItem,
// } from "@mui/material";
// import toast from "react-hot-toast";
// import { supabase } from "../lib/supabase";

// const PassengerForm: React.FC = () => {
//   const [params] = useSearchParams();
//   const bookingId = params.get("booking");
//   const [passenger, setPassenger] = useState({
//     name: "",
//     age: "",
//     gender: "",
//   });
//   const navigate = useNavigate();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setPassenger({ ...passenger, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     if (!bookingId) {
//       toast.error("Invalid booking reference!");
//       return;
//     }

//     if (!passenger.name || !passenger.age || !passenger.gender) {
//       toast.error("Please fill all fields!");
//       return;
//     }

//     const { error } = await supabase.from("passengers").insert([
//       {
//         booking_id: bookingId,
//         name: passenger.name,
//         age: parseInt(passenger.age),
//         gender: passenger.gender,
//       },
//     ]);

//     if (error) {
//       toast.error("Failed to save passenger info: " + error.message);
//     } else {
//       toast.success("Passenger info saved!");
//       navigate(`/booking/payment?booking=${bookingId}`);
//     }
//   };

//   return (
//     <Box>
//       <Typography variant="h5" fontWeight="bold" mb={2}>
//         👤 Passenger Information
//       </Typography>

//       <Card sx={{ borderRadius: 3, boxShadow: 3, p: 3 }}>
//         <CardContent>
//           <Grid container spacing={3}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Full Name"
//                 name="name"
//                 value={passenger.name}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//               />
//             </Grid>
//             <Grid item xs={12} sm={3}>
//               <TextField
//                 label="Age"
//                 name="age"
//                 value={passenger.age}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//                 type="number"
//               />
//             </Grid>
//             <Grid item xs={12} sm={3}>
//               <TextField
//                 select
//                 label="Gender"
//                 name="gender"
//                 value={passenger.gender}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//               >
//                 <MenuItem value="Male">Male</MenuItem>
//                 <MenuItem value="Female">Female</MenuItem>
//                 <MenuItem value="Other">Other</MenuItem>
//               </TextField>
//             </Grid>
//           </Grid>

//           <Box mt={3}>
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={handleSubmit}
//               size="large"
//             >
//               Continue to Payment
//             </Button>
//           </Box>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// export default PassengerForm;
