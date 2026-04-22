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
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../hooks/redux/store";
import {
  fetchFlights,
  addFlight,
  deleteFlight,
  updateFlight,
} from "../../../hooks/redux/slices/flightSlice";
import type { Flight } from "../../../hooks/redux/slices/flightSlice";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";

// We use the Flight type from the slice, but DataGrid might sometimes have partials or types that allow null
// so we define FlightRow to be compatible with both Flight and the UI needs.
interface FlightTableProps {
  showTitle?: boolean;
}

const FlightTable: React.FC<FlightTableProps> = ({ showTitle = true }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: flights, loading } = useSelector(
    (state: RootState) => state.flights
  );

  // local UI state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false);

  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [boostOfferText, setBoostOfferText] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // ---------- Handlers: Boost Flight ----------
  const openBoost = (row: Flight) => {
    setSelectedFlight(row);
    setBoostOfferText(row.offer_text || "");
    setBoostOpen(true);
  };

  const handleToggleBoost = async () => {
    if (!selectedFlight) return;
    try {
      await api.put(`/flights/${selectedFlight.id}/boost`, {
        offer_text: boostOfferText
      });
      toast.success(selectedFlight.is_boosted ? "Boost removed" : "Flight boosted!");
      dispatch(fetchFlights());
      setBoostOpen(false);
    } catch (err) {
      toast.error("Failed to update boost status");
    }
  };

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

  // realtime subscription removed - rely on redux state updates
  // useEffect(() => { ... }, []);

  // derived options for origin/destination filters
  const origins = useMemo(() => {
    const set = new Set<string>();
    flights.forEach((f: Flight) => f.origin && set.add(f.origin));
    return Array.from(set).sort();
  }, [flights]);

  const destinations = useMemo(() => {
    const set = new Set<string>();
    flights.forEach((f: Flight) => f.destination && set.add(f.destination));
    return Array.from(set).sort();
  }, [flights]);

  // combined filtered flights for DataGrid
  const filteredFlights = useMemo(() => {
    return flights.filter((f: Flight) => {
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
        flight_number: form.flight_number,
        origin: form.origin,
        destination: form.destination,
        departure_time: departureISO,
        arrival_time: arrivalISO,
        price: Number(form.price),
        status: form.status || "On Time",
      };

      await dispatch(addFlight(newFlight)).unwrap();

      toast.success("Flight added");
      // fetchFlights handled by addFlight fulfillment or called here if needed
      closeAdd();
    } catch (err: any) {
      console.error("Add flight error:", err);
      toast.error(err?.message || "Failed to add flight");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Handlers: Edit Flight ----------
  const openEdit = (row: Flight) => {
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

      const updateData = {
        flight_number: form.flight_number,
        origin: form.origin,
        destination: form.destination,
        departure_time: departureISO,
        arrival_time: arrivalISO,
        price: Number(form.price),
        status: form.status,
      };

      await dispatch(updateFlight({ id: selectedFlight.id, data: updateData })).unwrap();

      toast.success("Flight updated");
      closeEdit();
    } catch (err: any) {
      console.error("Edit flight error:", err);
      toast.error(err?.message || "Failed to update flight");
    } finally {
      setSaving(false);
    }
  };

  // ---------- View bookings ----------
  const openViewBookings = async (row: Flight) => {
    setSelectedFlight(row);
    setBookings([]);
    setBookingsLoading(true);
    setViewOpen(true);

    try {
      const { data } = await api.get(`/bookings/flight/${row.id}`);

      // Flatten passengers from bookings
      const allPassengers = data.flatMap((b: any) =>
        (b.passengers || []).map((p: any) => ({
          ...p,
          id: b._id + "-" + (p._id || p.seat_number), // unique key
          passenger_name: p.name,
          passenger_age: p.age,
          passenger_gender: p.gender,
          seat_number: p.seat_number,
          payment_status: b.payment_status
        }))
      );

      setBookings(allPassengers);
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
        const row = params.row as Flight;
        return (
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              color={row.is_boosted ? "secondary" : "default"}
              onClick={() => openBoost(row)}
            >
              <RocketLaunchIcon />
            </IconButton>

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
    <Box sx={{ p: 2 }}>
      {showTitle && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#333" }}>
            ✈️ Flight Management
          </Typography>
        </Box>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 4,
          border: "1px solid #eee",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
          Filters:
        </Typography>
        <TextField
          size="small"
          placeholder="Search flight / origin / dest"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{ sx: { borderRadius: 3 } }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Origin</InputLabel>
          <Select
            label="Origin"
            value={filterOrigin}
            onChange={(e) => setFilterOrigin(e.target.value)}
            sx={{ borderRadius: 3 }}
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
            sx={{ borderRadius: 3 }}
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
            sx={{ borderRadius: 3 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="On Time">On Time</MenuItem>
            <MenuItem value="Delayed">Delayed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{
            bgcolor: "#000",
            color: "#FFD700",
            fontWeight: "bold",
            borderRadius: "20px",
            "&:hover": { bgcolor: "#333" },
          }}
        >
          Add Flight
        </Button>
      </Paper>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={300}
        >
          <CircularProgress sx={{ color: "#FFD700" }} />
        </Box>
      ) : filteredFlights.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">No flights found.</Typography>
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            height: 520,
            width: "100%",
            borderRadius: 4,
            border: "1px solid #eee",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
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
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#000",
                color: "#FFD700",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #f0f0f0",
              },
            }}
          />
        </Paper>
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

      {/* ---------------- Boost / Offer Modal ---------------- */}
      <Dialog open={boostOpen} onClose={() => setBoostOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RocketLaunchIcon color="secondary" />
          {selectedFlight?.is_boosted ? "Remove Boost" : "Boost Flight Inventory"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {selectedFlight?.is_boosted
              ? "Removing this boost will hide the 'Limited Offer' badge from the homepage."
              : "Boosting this flight will show a 'Limited Offer' badge on the search results and homepage."}
          </Typography>
          <TextField
            fullWidth
            label="Custom Offer Label (optional)"
            placeholder="e.g., 50% OFF, LIMITED DEAL"
            value={boostOfferText}
            onChange={(e) => setBoostOfferText(e.target.value.toUpperCase())}
            sx={{ mt: 1 }}
            helperText="Appears prominently near the flight price."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBoostOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={selectedFlight?.is_boosted ? "error" : "secondary"}
            onClick={handleToggleBoost}
            startIcon={selectedFlight?.is_boosted ? <CloseIcon /> : <RocketLaunchIcon />}
          >
            {selectedFlight?.is_boosted ? "Deactivate Boost" : "Activate Boost"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FlightTable;
