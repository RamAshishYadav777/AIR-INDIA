// import React from "react";
// import { Box, Drawer, List, ListItemButton, ListItemText, Toolbar } from "@mui/material";
// import { Outlet, Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../../hooks/redux/store";

// const drawerWidth = 220;

// const DashboardLayout: React.FC = () => {
//   const user = useSelector((state: RootState) => state.auth.user);
//   const role = user?.user_metadata?.role;

//   if (role === "user") {
//     return (
//       <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
//         <Toolbar />
//         <Outlet />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ display: "flex" }}>
//       <Drawer
//         variant="permanent"
//         sx={{
//           width: drawerWidth,
//           flexShrink: 0,
//           [`& .MuiDrawer-paper`]: {
//             width: drawerWidth,
//             boxSizing: "border-box",
//           },
//         }}
//       >
//         <Toolbar />
//         <List>
//           <ListItemButton component={Link} to="/dashboard/user">
//             <ListItemText primary="User Dashboard" />
//           </ListItemButton>
//           <ListItemButton component={Link} to="/dashboard/admin">
//             <ListItemText primary="Admin Dashboard" />
//           </ListItemButton>
//           <ListItemButton component={Link} to="/dashboard/bookings">
//             <ListItemText primary="Bookings" />
//           </ListItemButton>
//           <ListItemButton component={Link} to="/dashboard/analytics">
//             <ListItemText primary="Analytics" />
//           </ListItemButton>
//         </List>
//       </Drawer>

//       <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
//         <Toolbar />
//         <Outlet />
//       </Box>
//     </Box>
//   );
// };

// export default DashboardLayout;
