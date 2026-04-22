// // src/pages/dashboardui/BRoute.tsx
// import React, { useState } from "react";
// import { Box, Button } from "@mui/material";
// // import AddFlightDialog from "../../../components/AddFlightDialog";
// import FlightTable from "./FlightTable";

// const BRoute: React.FC = () => {
//   const [open, setOpen] = useState(false);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   const handleAddFlight = () => setOpen(true);
//   const handleClose = () => setOpen(false);

//   const handleFlightAdded = () => {
//     setRefreshTrigger((prev) => prev + 1);
//   };

//   return (
//     <Box>
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={handleAddFlight}
//         sx={{ mb: 2 }}
//       >
//         Add Flight
//       </Button>

//       <AddFlightDialog
//         open={open}
//         onClose={handleClose}
//         onFlightAdded={handleFlightAdded}
//       />

//       {/* ✅ Pass refreshTrigger as prop */}
//       <FlightTable refreshTrigger={refreshTrigger} />
//     </Box>
//   );
// };

// export default BRoute;
