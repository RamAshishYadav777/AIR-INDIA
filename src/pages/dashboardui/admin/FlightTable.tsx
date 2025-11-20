// src/pages/dashboardui/admin/FlightTable.tsx
import React, { useEffect, useMemo, useState } from "react";
import type {
  GridRenderCellParams
} from "@mui/x-data-grid";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../hooks/redux/store";
import {
  fetchFlights,
  deleteFlight,
} from "../../../hooks/redux/slices/flightSlice";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

interface FlightRow {
  id: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string | null;
  arrival_time: string | null;
  price: number | null;
  status: string;
}

const FlightTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: flights, loading } = useSelector(
    (state: RootState) => state.flights
  );

  // local UI state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [selectedFlight, setSelectedFlight] = useState<FlightRow | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // form state (used by both add & edit)
  const emptyForm = {
    flight_number: "",
    origin: "",
    destination: "",
    departure_date: "",
    departure_time: "",
    arrival_date: "",
    arrival_time: "",
    price: "",
    status: "On Time",
  };
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // search / filters
  const [searchText, setSearchText] = useState("");
  const [filterOrigin, setFilterOrigin] = useState("");
  const [filterDestination, setFilterDestination] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // fetch flights on mount
  useEffect(() => {
    dispatch(fetchFlights());
  }, [dispatch]);

  // realtime subscription to refresh flights automatically
  useEffect(() => {
    const channel = supabase
      .channel("realtime-flights-ui")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "flights" },
        () => {
          dispatch(fetchFlights());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dispatch]);

  // derived options for origin/destination filters
  const origins = useMemo(() => {
    const set = new Set<string>();
    flights.forEach((f: any) => f.origin && set.add(f.origin));
    return Array.from(set).sort();
  }, [flights]);

  const destinations = useMemo(() => {
    const set = new Set<string>();
    flights.forEach((f: any) => f.destination && set.add(f.destination));
    return Array.from(set).sort();
  }, [flights]);

  // combined filtered flights for DataGrid
  const filteredFlights = useMemo(() => {
    return flights.filter((f: FlightRow) => {
      const textMatch =
        !searchText ||
        f.flight_number?.toLowerCase().includes(searchText.toLowerCase()) ||
        f.origin?.toLowerCase().includes(searchText.toLowerCase()) ||
        f.destination?.toLowerCase().includes(searchText.toLowerCase());

      const originMatch = !filterOrigin || f.origin === filterOrigin;
      const destinationMatch = !filterDestination || f.destination === filterDestination;
      const statusMatch = !filterStatus || f.status === filterStatus;

      return textMatch && originMatch && destinationMatch && statusMatch;
    });
  }, [flights, searchText, filterOrigin, filterDestination, filterStatus]);

  // ---------- Handlers: Add Flight ----------
  const openAdd = () => {
    setForm({ ...emptyForm });
    setAddOpen(true);
  };
  const closeAdd = () => {
    setAddOpen(false);
    setForm({ ...emptyForm });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validateForm = () => {
    if (!form.flight_number.trim()) {
      toast.error("Flight number is required");
      return false;
    }
    if (!form.origin.trim() || !form.destination.trim()) {
      toast.error("Origin and destination are required");
      return false;
    }
    if (!form.departure_date || !form.departure_time || !form.arrival_date || !form.arrival_time) {
      toast.error("Departure & arrival date/time are required");
      return false;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error("Valid price is required");
      return false;
    }
    return true;
  };

  const handleAddSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setSaving(true);

    try {
      const departureISO = dayjs(`${form.departure_date}T${form.departure_time}`).toISOString();
      const arrivalISO = dayjs(`${form.arrival_date}T${form.arrival_time}`).toISOString();

      const newFlight = {
        id: uuidv4(),
        flight_number: form.flight_number,
        origin: form.origin,
        destination: form.destination,
        departure_time: departureISO,
        arrival_time: arrivalISO,
        price: Number(form.price),
        status: form.status || "On Time",
      };

      const { error } = await supabase.from("flights").insert([newFlight]);
      if (error) throw error;

      toast.success("Flight added");
      dispatch(fetchFlights());
      closeAdd();
    } catch (err: any) {
      console.error("Add flight error:", err);
      toast.error(err?.message || "Failed to add flight");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Handlers: Edit Flight ----------
  const openEdit = (row: FlightRow) => {
    setSelectedFlight(row);
    // prefill form with date/time split
    const dep = row.departure_time ? dayjs(row.departure_time) : null;
    const arr = row.arrival_time ? dayjs(row.arrival_time) : null;

    setForm({
      flight_number: row.flight_number || "",
      origin: row.origin || "",
      destination: row.destination || "",
      departure_date: dep ? dep.format("YYYY-MM-DD") : "",
      departure_time: dep ? dep.format("HH:mm") : "",
      arrival_date: arr ? arr.format("YYYY-MM-DD") : "",
      arrival_time: arr ? arr.format("HH:mm") : "",
      price: row.price?.toString() ?? "",
      status: row.status || "On Time",
    });

    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setSelectedFlight(null);
    setForm({ ...emptyForm });
  };

  const handleEditSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedFlight) return;
    if (!validateForm()) return;

    setSaving(true);
    try {
      const departureISO = dayjs(`${form.departure_date}T${form.departure_time}`).toISOString();
      const arrivalISO = dayjs(`${form.arrival_date}T${form.arrival_time}`).toISOString();

      const { error } = await supabase
        .from("flights")
        .update({
          flight_number: form.flight_number,
          origin: form.origin,
          destination: form.destination,
          departure_time: departureISO,
          arrival_time: arrivalISO,
          price: Number(form.price),
          status: form.status,
        })
        .eq("id", selectedFlight.id);

      if (error) throw error;

      toast.success("Flight updated");
      dispatch(fetchFlights());
      closeEdit();
    } catch (err: any) {
      console.error("Edit flight error:", err);
      toast.error(err?.message || "Failed to update flight");
    } finally {
      setSaving(false);
    }
  };

  // ---------- View bookings ----------
  const openViewBookings = async (row: FlightRow) => {
    setSelectedFlight(row);
    setBookings([]);
    setBookingsLoading(true);
    setViewOpen(true);

    try {
      const { data, error } = await supabase
        .from("passengers")
        .select("*")
        .eq("flight_id", row.id)
        .order("id", { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error("Fetch bookings error:", err);
      toast.error("Failed to fetch bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  const closeView = () => {
    setViewOpen(false);
    setSelectedFlight(null);
    setBookings([]);
  };

  // ---------- Delete ----------
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this flight? This action cannot be undone.")) return;
    try {
      await dispatch(deleteFlight(id)).unwrap();
      toast.success("Flight deleted");
    } catch (err: any) {
      console.error("Delete flight error:", err);
      toast.error(err?.message || "Failed to delete flight");
    }
  };

  // ---------- DataGrid columns ----------
  // const columns = [
  //   { field: "flight_number", headerName: "Flight No.", width: 140 },
  //   { field: "origin", headerName: "Origin", width: 130 },
  //   { field: "destination", headerName: "Destination", width: 130 },
  //   {
  //     field: "departure_time",
  //     headerName: "Departure",
  //     width: 220,
  //     valueGetter: (params: any) => params.row?.departure_time || null,

  //     renderCell: (params: any) => {
  //       const v = params.value;
  //       if (!v) return "—";
  //       const dt = new Date(v);
  //       return dt.toLocaleString("en-IN", {
  //         year: "numeric",
  //         month: "short",
  //         day: "numeric",
  //         hour: "2-digit",
  //         minute: "2-digit",
  //         hour12: true,
  //         timeZone: "Asia/Kolkata",
  //       });
  //     },
  //   },
  //   {
  //     field: "arrival_time",
  //     headerName: "Arrival",
  //     width: 220,
  //     valueGetter: (params: any) => params.row?.arrival_time || null,

  //     renderCell: (params: any) => {
  //       const v = params.value;
  //       if (!v) return "—";
  //       const dt = new Date(v);
  //       return dt.toLocaleString("en-IN", {
  //         year: "numeric",
  //         month: "short",
  //         day: "numeric",
  //         hour: "2-digit",
  //         minute: "2-digit",
  //         hour12: true,
  //         timeZone: "Asia/Kolkata",
  //       });
  //     },
  //   },
  //   {
  //     field: "price",
  //     headerName: "Price (₹)",
  //     width: 120,
  //     valueFormatter: (params) =>
  //       params.value ? `₹${params.value}` : "—",
  //   },
  //   { field: "status", headerName: "Status", width: 130 },
  //   {
  //     field: "actions",
  //     headerName: "Actions",
  //     width: 140,
  //     sortable: false,
  //     filterable: false,
  //     renderCell: (params: any) => {
  //       const row: FlightRow = params.row;
       const columns = [
         { field: "flight_number", headerName: "Flight No.", width: 140 },
         { field: "origin", headerName: "Origin", width: 130 },
         { field: "destination", headerName: "Destination", width: 130 },

         {
           field: "departure_time",
           headerName: "Departure",
           width: 220,
           renderCell: (params: GridRenderCellParams) => {
             const v = params.row?.departure_time;
             if (!v) return "—";
             const dt = new Date(v);
             return dt.toLocaleString("en-IN", {
               year: "numeric",
               month: "short",
               day: "numeric",
               hour: "2-digit",
               minute: "2-digit",
               hour12: true,
               timeZone: "Asia/Kolkata",
             });
           },
         },

         {
           field: "arrival_time",
           headerName: "Arrival",
           width: 220,
           renderCell: (params: GridRenderCellParams) => {
             const v = params.row?.arrival_time;
             if (!v) return "—";
             const dt = new Date(v);
             return dt.toLocaleString("en-IN", {
               year: "numeric",
               month: "short",
               day: "numeric",
               hour: "2-digit",
               minute: "2-digit",
               hour12: true,
               timeZone: "Asia/Kolkata",
             });
           },
         },

         {
           field: "price",
           headerName: "Price (₹)",
           width: 120,
           renderCell: (params: GridRenderCellParams) => {
             const v = Number(params.row?.price);
             return isNaN(v) || v <= 0 ? "—" : `₹${v}`;
           },
         },

         { field: "status", headerName: "Status", width: 130 },

         {
           field: "actions",
           headerName: "Actions",
           width: 140,
           sortable: false,
           filterable: false,
           renderCell: (params: GridRenderCellParams) => {
             const row = params.row as FlightRow;
             return (
               <Stack direction="row" spacing={1}>
                 <IconButton
                   size="small"
                   color="primary"
                   onClick={() => openViewBookings(row)}
                 >
                   <VisibilityIcon />
                 </IconButton>

                 <IconButton
                   size="small"
                   color="info"
                   onClick={() => openEdit(row)}
                 >
                   <EditIcon />
                 </IconButton>

                 <IconButton
                   size="small"
                   color="error"
                   onClick={() => handleDelete(row.id)}
                 >
                   <DeleteIcon />
                 </IconButton>
               </Stack>
             );
           },
         },
       ];


  // ---------- Render ----------
  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        mb={2}
      >
        <Typography variant="h6">✈️ Flights</Typography>

        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search flight / origin / dest"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Origin</InputLabel>
            <Select
              label="Origin"
              value={filterOrigin}
              onChange={(e) => setFilterOrigin(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {origins.map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Destination</InputLabel>
            <Select
              label="Destination"
              value={filterDestination}
              onChange={(e) => setFilterDestination(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {destinations.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="On Time">On Time</MenuItem>
              <MenuItem value="Delayed">Delayed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAdd}
            sx={{ ml: 1 }}
          >
            Add Flight
          </Button>
        </Box>
      </Stack>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={300}
        >
          <CircularProgress />
        </Box>
      ) : filteredFlights.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">No flights found.</Typography>
        </Box>
      ) : (
        <Box sx={{ height: 520, width: "100%" }}>
          <DataGrid
            rows={filteredFlights}
            columns={columns}
            getRowId={(r) => r.id}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
              },
            }}
          />
        </Box>
      )}

      {/* ---------------- Add Flight Modal ---------------- */}
      <Dialog open={addOpen} onClose={closeAdd} fullWidth maxWidth="md">
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <span>Add New Flight</span>
            <IconButton onClick={closeAdd}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box component="form" onSubmit={handleAddSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  name="flight_number"
                  label="Flight Number"
                  fullWidth
                  required
                  value={form.flight_number}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  name="origin"
                  label="Origin"
                  fullWidth
                  required
                  value={form.origin}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  name="destination"
                  label="Destination"
                  fullWidth
                  required
                  value={form.destination}
                  onChange={handleFormChange}
                />
              </Grid>

              {/* Departure row: date + time in same row */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="departure_date"
                  label="Departure Date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={form.departure_date}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="departure_time"
                  label="Departure Time"
                  type="time"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={form.departure_time}
                  onChange={handleFormChange}
                />
              </Grid>

              {/* Arrival row */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="arrival_date"
                  label="Arrival Date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={form.arrival_date}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="arrival_time"
                  label="Arrival Time"
                  type="time"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={form.arrival_time}
                  onChange={handleFormChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="price"
                  label="Price (INR)"
                  type="number"
                  fullWidth
                  required
                  value={form.price}
                  onChange={handleFormChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    label="Status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    <MenuItem value="On Time">On Time</MenuItem>
                    <MenuItem value="Delayed">Delayed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeAdd} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddSubmit}
            startIcon={<SaveIcon />}
            disabled={saving}
          >
            {saving ? "Saving..." : "Add Flight"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------------- Edit Flight Modal ---------------- */}
      <Dialog open={editOpen} onClose={closeEdit} fullWidth maxWidth="md">
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <span>Edit Flight</span>
            <IconButton onClick={closeEdit}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  name="flight_number"
                  label="Flight Number"
                  fullWidth
                  required
                  value={form.flight_number}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  name="origin"
                  label="Origin"
                  fullWidth
                  required
                  value={form.origin}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  name="destination"
                  label="Destination"
                  fullWidth
                  required
                  value={form.destination}
                  onChange={handleFormChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="departure_date"
                  label="Departure Date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={form.departure_date}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="departure_time"
                  label="Departure Time"
                  type="time"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={form.departure_time}
                  onChange={handleFormChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="arrival_date"
                  label="Arrival Date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={form.arrival_date}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="arrival_time"
                  label="Arrival Time"
                  type="time"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={form.arrival_time}
                  onChange={handleFormChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="price"
                  label="Price (INR)"
                  type="number"
                  fullWidth
                  required
                  value={form.price}
                  onChange={handleFormChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    label="Status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    <MenuItem value="On Time">On Time</MenuItem>
                    <MenuItem value="Delayed">Delayed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeEdit} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            startIcon={<SaveIcon />}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------------- View Bookings Modal ---------------- */}
      <Dialog open={viewOpen} onClose={closeView} fullWidth maxWidth="md">
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <span>Bookings for {selectedFlight?.flight_number || ""}</span>
            <IconButton onClick={closeView}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            Flight: {selectedFlight?.origin} → {selectedFlight?.destination}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {bookingsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : bookings.length === 0 ? (
            <Typography color="text.secondary">
              No bookings found for this flight.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Passenger Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Seat</TableCell>
                  <TableCell>Payment Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.passenger_name}</TableCell>
                    <TableCell>{p.passenger_age}</TableCell>
                    <TableCell>{p.passenger_gender}</TableCell>
                    <TableCell>{p.seat_number}</TableCell>
                    <TableCell>
                      <Typography
                        color={
                          p.payment_status === "success"
                            ? "green"
                            : p.payment_status === "failed"
                            ? "red"
                            : "orange"
                        }
                      >
                        {p.payment_status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeView}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FlightTable;
