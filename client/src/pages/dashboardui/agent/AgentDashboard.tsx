import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Grid,
    Typography,
    Box,
    Snackbar,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    TextField,
    MenuItem,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    IconButton,
} from "@mui/material";
import StatCard from "../../../components/StatCard";
import api from "../../../lib/axios";

// Icons
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import LuggageIcon from "@mui/icons-material/Luggage";
import PrintIcon from "@mui/icons-material/Print";
import CloseIcon from "@mui/icons-material/Close";

interface Booking {
    _id: string;
    booking_id: string;
    pnr: string;
    flight_id: any;
    passengers: {
        _id: string;
        name: string;
        seat_number: string;
        checked_in?: boolean;
        baggage?: {
            items: { bag_type: string; weight: number; tag_id: string }[];
            counter_processed: boolean;
        };
    }[];
    payment_status: string;
}

interface Flight {
    _id: string;
    flight_number: string;
    origin: string;
    destination: string;
}

const AgentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBookings: 0,
        checkedInCount: 0,
        pendingCheckin: 0,
        totalFlights: 0,
    });
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [flights, setFlights] = useState<Flight[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFlight, setSelectedFlight] = useState("all");

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
        open: false,
        message: "",
        type: "success",
    });

    const [baggageDialog, setBaggageDialog] = useState<{
        open: boolean;
        booking: Booking | null;
        passenger: any | null;
        weight: string;
    }>({
        open: false,
        booking: null,
        passenger: null,
        weight: "",
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: bookingResBody } = await api.get("/bookings");
            const { data: flightResBody } = await api.get("/flights");

            const bookings = bookingResBody.data || [];
            const flightData = flightResBody.data || [];

            setFlights(flightData);

            let checkedIn = 0;
            let pending = 0;

            bookings.forEach((b: Booking) => {
                b.passengers.forEach(p => {
                    if (p.checked_in) checkedIn++;
                    else pending++;
                });
            });

            setStats({
                totalBookings: bookings.length,
                checkedInCount: checkedIn,
                pendingCheckin: pending,
                totalFlights: flightData.length,
            });

            setAllBookings(bookings);
            setFilteredBookings(bookings);
        } catch (err) {
            console.error("Error fetching agent data:", err);
            setSnackbar({ open: true, message: "Failed to load data", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleBaggageSubmit = async () => {
        if (!baggageDialog.booking || !baggageDialog.passenger || !baggageDialog.weight) {
            setSnackbar({ open: true, message: "Please enter baggage weight", type: "error" });
            return;
        }

        try {
            const passengerId = baggageDialog.passenger._id;
            const weight = parseFloat(baggageDialog.weight);

            const baggageDetails = [
                {
                    bag_type: "Check-in",
                    weight: weight,
                    tag_id: `AI-BAG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
                }
            ];

            await api.put(`/bookings/${baggageDialog.booking._id}/baggage`, {
                passengerId,
                baggageDetails
            });

            setSnackbar({ open: true, message: "Baggage processed & Tag generated!", type: "success" });
            setBaggageDialog({ ...baggageDialog, open: false });
            fetchData();
        } catch (err) {
            setSnackbar({ open: true, message: "Failed to process baggage", type: "error" });
        }
    };

    const generateBagTag = (booking: Booking, passenger: any) => {
        const bag = passenger.baggage?.items[0];
        if (!bag) return;

        const tagContent = `
            AIR INDIA EXPRESS
            -----------------
            PNR: ${booking.pnr}
            PAX: ${passenger.name}
            FLT: ${booking.flight_id?.flight_number}
            DES: ${booking.flight_id?.destination}
            WGT: ${bag.weight} KG
            TAG: ${bag.tag_id}
            -----------------
            SECURITY CLEARED
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`<pre style="font-family: monospace; font-size: 20px; padding: 40px; border: 2px solid black; width: 300px;">${tagContent}</pre>`);
            printWindow.document.close();
            printWindow.print();
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let result = allBookings;

        if (selectedFlight !== "all") {
            result = result.filter(b => b.flight_id?._id === selectedFlight);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(b =>
                (b.booking_id && b.booking_id.toLowerCase().includes(query)) ||
                (b.pnr && b.pnr.toLowerCase().includes(query)) ||
                b.passengers.some(p => p.name.toLowerCase().includes(query))
            );
        }

        setFilteredBookings(result);
    }, [searchQuery, selectedFlight, allBookings]);

    if (loading) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height="60vh">
                <Box textAlign="center">
                    <CircularProgress size={60} sx={{ color: '#ed1c24', mb: 2 }} />
                    <Typography color="textSecondary">Fetching manifest data...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box p={4} sx={{ background: '#f8fafc', minHeight: '100vh' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#1e293b' }}>
                        Agent Portal
                    </Typography>
                    <Typography color="textSecondary">
                        Manage flight manifests and passenger check-ins
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<FlightTakeoffIcon />}
                    onClick={fetchData}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Refresh Manifest
                </Button>
            </Box>

            <Grid container spacing={3} mb={5}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Active Flights"
                        value={stats.totalFlights}
                        icon={<FlightTakeoffIcon />}
                        color="#ed1c24"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Manifested"
                        value={stats.totalBookings}
                        icon={<GroupIcon />}
                        color="#fdbd10"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Cleared (Checked In)"
                        value={stats.checkedInCount}
                        icon={<CheckCircleOutlineIcon />}
                        color="#2e7d32"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Awaiting Clearance"
                        value={stats.pendingCheckin}
                        icon={<PendingActionsIcon />}
                        color="#ed1c24"
                    />
                </Grid>
            </Grid>

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 4, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box sx={{ flex: 1, minWidth: 300 }}>
                    <TextField
                        fullWidth
                        placeholder="Search by Booking Reference or Passenger Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#94a3b8' }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3, bgcolor: '#f1f5f9', border: 'none' }
                        }}
                    />
                </Box>

                <Box sx={{ minWidth: 200 }}>
                    <TextField
                        select
                        fullWidth
                        label="Filter by Flight"
                        value={selectedFlight}
                        onChange={(e) => setSelectedFlight(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FilterListIcon sx={{ color: '#94a3b8' }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3 }
                        }}
                    >
                        <MenuItem value="all">All Flights</MenuItem>
                        {flights.map((f) => (
                            <MenuItem key={f._id} value={f._id}>
                                {f.flight_number} ({f.origin} → {f.destination})
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            </Paper>

            <Typography variant="h5" fontWeight={800} mb={2} sx={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                Passenger Manifest
                <Chip label={`${filteredBookings.length} results`} size="small" />
            </Typography>

            <TableContainer component={Paper} sx={{ borderRadius: 5, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#1e293b' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>REF CODE</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>FLIGHT INFO</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>PASSENGERS / SEATS</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>PAYMENT</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>OPERATIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                            <TableRow key={booking._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <Typography fontWeight={900} color="error" sx={{ fontFamily: 'monospace', letterSpacing: 2, fontSize: '1.1rem' }}>
                                        {booking.pnr || '------'}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.6rem' }}>
                                        ID: {booking.booking_id}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="subtitle2" fontWeight={800}>
                                            {booking.flight_id?.flight_number}
                                        </Typography>
                                        <Chip label={booking.flight_id?.origin + '→' + booking.flight_id?.destination} size="small" sx={{ fontSize: '0.65rem' }} />
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" flexDirection="column" gap={1}>
                                        {booking.passengers.map((p, idx) => (
                                            <Box key={idx} display="flex" alignItems="center" justifyContent="space-between" sx={{
                                                p: 1,
                                                borderRadius: 2,
                                                bgcolor: p.checked_in ? '#f0fdf4' : '#fef2f2',
                                                border: `1px solid ${p.checked_in ? '#bcf0da' : '#fecaca'}`
                                            }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {p.name}
                                                </Typography>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Chip label={`Seat ${p.seat_number}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />

                                                    {/* Baggage Action */}
                                                    {p.baggage && p.baggage.counter_processed ? (
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => generateBagTag(booking, p)}
                                                            title="Print Bag Tag"
                                                        >
                                                            <PrintIcon fontSize="small" />
                                                        </IconButton>
                                                    ) : (
                                                        <IconButton
                                                            size="small"
                                                            color="warning"
                                                            onClick={() => setBaggageDialog({ ...baggageDialog, open: true, booking, passenger: p })}
                                                            title="Process Baggage"
                                                        >
                                                            <LuggageIcon fontSize="small" />
                                                        </IconButton>
                                                    )}

                                                    {p.checked_in ? (
                                                        <CheckCircleOutlineIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                                                    ) : (
                                                        <PendingActionsIcon sx={{ color: '#dc2626', fontSize: 18 }} />
                                                    )}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={booking.payment_status.toUpperCase()}
                                        color={booking.payment_status === 'completed' ? 'success' : 'error'}
                                        size="small"
                                        variant="filled"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="error"
                                        onClick={() => navigate(`/checkin?pnr=${booking.pnr || booking.booking_id}`)}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                    >
                                        Go to Check-In
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                    <Typography color="textSecondary">No manifest records matching your criteria.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.type} variant="filled" sx={{ borderRadius: 3 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Baggage Processing Dialog */}
            <Dialog
                open={baggageDialog.open}
                onClose={() => setBaggageDialog({ ...baggageDialog, open: false })}
                PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 400 } }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #f1f5f9', pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800}>Baggage Counter</Typography>
                    <IconButton size="small" onClick={() => setBaggageDialog({ ...baggageDialog, open: false })}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Passenger</Typography>
                            <Typography variant="body1" fontWeight={700}>{baggageDialog.passenger?.name}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>PNR / REF</Typography>
                            <Typography variant="body1" fontWeight={700} color="error">{baggageDialog.booking?.pnr}</Typography>
                        </Box>
                        <TextField
                            fullWidth
                            label="Baggage Weight (KG)"
                            type="number"
                            value={baggageDialog.weight}
                            onChange={(e) => setBaggageDialog({ ...baggageDialog, weight: e.target.value })}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">KG</InputAdornment>,
                                sx: { borderRadius: 3 }
                            }}
                            autoFocus
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<LuggageIcon />}
                        onClick={handleBaggageSubmit}
                        sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold' }}
                    >
                        Generate Bag Tag
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AgentDashboard;
