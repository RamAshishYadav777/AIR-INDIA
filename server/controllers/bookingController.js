import moment from 'moment';
import Booking from '../models/Booking.js';
import Flight from '../models/Flight.js';

class BookingController {
    
    // @desc    Create a new booking
    // @route   POST /api/bookings
    async createBooking(req, res) {
        try {
            const newBooking = new Booking(req.body);
            const savedBooking = await newBooking.save();

            // Emit real-time notification via Socket.IO
            if (req.io && savedBooking.user_id) {
                const room = savedBooking.user_id.toString();
                req.io.to(room).emit("notification", {
                    type: "BOOKING_SUCCESS",
                    title: "Booking Confirmed! ✈️",
                    message: `Your booking (ID: ${savedBooking.booking_id}) has been successfully processed.`,
                    data: savedBooking
                });
            }

            res.status(201).json({ 
                success: true, 
                message: 'Booking created successfully', 
                data: this.formatBooking(savedBooking) 
            });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    // @desc    Get all bookings (Admin)
    // @route   GET /api/bookings
    async getAllBookings(req, res) {
        try {
            const bookings = await Booking.find().populate('flight_id').populate('user_id').sort({ createdAt: -1 });
            const data = bookings.map(b => this.formatBooking(b));
            
            res.json({ success: true, count: bookings.length, data });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Get booking by ID
    // @route   GET /api/bookings/:id
    async getBookingById(req, res) {
        try {
            const booking = await Booking.findById(req.params.id).populate('flight_id').populate('user_id');
            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            res.json({ success: true, data: this.formatBooking(booking) });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Get booking by Custom ID (booking_id or pnr string)
    // @route   GET /api/bookings/code/:bookingId
    async getBookingByCustomId(req, res) {
        try {
            const query = req.params.bookingId;
            const booking = await Booking.findOne({
                $or: [
                    { booking_id: query },
                    { pnr: query.toUpperCase() }
                ]
            }).populate('flight_id').populate('user_id');

            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            res.json({ success: true, data: this.formatBooking(booking) });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Get bookings by User ID
    // @route   GET /api/bookings/user/:userId
    async getBookingsByUser(req, res) {
        try {
            const bookings = await Booking.find({ user_id: req.params.userId }).populate('flight_id').sort({ createdAt: -1 });
            const data = bookings.map(b => this.formatBooking(b));
            res.json({ success: true, count: bookings.length, data });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Get bookings by Flight ID
    // @route   GET /api/bookings/flight/:flightId
    async getBookingsByFlight(req, res) {
        try {
            const bookings = await Booking.find({ flight_id: req.params.flightId }).populate('user_id');
            const data = bookings.map(b => this.formatBooking(b));
            res.json({ success: true, count: bookings.length, data });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Delete a booking
    // @route   DELETE /api/bookings/:id
    async deleteBooking(req, res) {
        try {
            const booking = await Booking.findById(req.params.id);
            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }

            await booking.deleteOne();
            res.json({ success: true, message: 'Booking deleted successfully' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Check-in a passenger
    // @route   PUT /api/bookings/:id/checkin
    async checkInPassenger(req, res) {
        try {
            const { passengerId } = req.body;
            const booking = await Booking.findById(req.params.id);

            if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

            const passenger = booking.passengers.id(passengerId) || booking.passengers.find(p => p._id.toString() === passengerId.toString());
            if (!passenger) {
                return res.status(404).json({ success: false, message: 'Passenger not found' });
            }

            passenger.checked_in = true;
            const savedBooking = await booking.save();

            // Emit real-time notification
            if (req.io && savedBooking.user_id) {
                const room = savedBooking.user_id.toString();
                req.io.to(room).emit("notification", {
                    type: "CHECKIN_SUCCESS",
                    title: "Check-in Successful! ✅",
                    message: `Passenger ${passenger.name} has checked in for flight.`,
                    data: savedBooking
                });
            }

            res.json({ success: true, message: 'Check-in successful', data: this.formatBooking(savedBooking) });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Process baggage at counter
    // @route   PUT /api/bookings/:id/baggage
    async processBaggage(req, res) {
        try {
            const { passengerId, baggageDetails } = req.body;
            const booking = await Booking.findById(req.params.id);

            if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

            const passenger = booking.passengers.id(passengerId) || booking.passengers.find(p => p._id.toString() === passengerId.toString());
            if (!passenger) return res.status(404).json({ success: false, message: 'Passenger not found' });

            passenger.baggage.counter_processed = true;
            if (baggageDetails) {
                passenger.baggage.items = baggageDetails;
            }

            const savedBooking = await booking.save();

            // Emit real-time notification
            if (req.io && savedBooking.user_id) {
                const room = savedBooking.user_id.toString();
                req.io.to(room).emit("notification", {
                    type: "BAGGAGE_PROCESSED",
                    title: "Baggage Verified! 🧳",
                    message: `Baggage for ${passenger.name} has been verified and processed at the counter.`,
                    data: savedBooking
                });
            }

            res.json({ success: true, message: 'Baggage processed successfully', data: this.formatBooking(savedBooking) });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Get admin statistics (Revenue, Bookings, etc.)
    // @route   GET /api/bookings/admin/stats
    async getAdminStats(req, res) {
        try {
            const bookings = await Booking.find();

            const totalRevenue = bookings.reduce((acc, b) => acc + (b.total_amount || 0), 0);
            const bookingCount = bookings.length;

            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            const revenueByDay = last7Days.map(date => {
                const dailyRevenue = bookings
                    .filter(b => b.createdAt && b.createdAt.toISOString().split('T')[0] === date)
                    .reduce((acc, b) => acc + (b.total_amount || 0), 0);

                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                return { name: dayName, revenue: dailyRevenue };
            });

            res.json({
                success: true,
                data: {
                    totalRevenue,
                    bookingCount,
                    revenueByDay
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Get revenue by destination for heatmap
    // @route   GET /api/bookings/admin/route-revenue
    async getRouteRevenue(req, res) {
        try {
            const bookings = await Booking.find().populate('flight_id');

            const routeData = bookings.reduce((acc, b) => {
                if (b.flight_id && b.flight_id.destination) {
                    const dest = b.flight_id.destination;
                    acc[dest] = (acc[dest] || 0) + (b.total_amount || 0);
                }
                return acc;
            }, {});

            const result = Object.entries(routeData).map(([city, revenue]) => ({
                city,
                revenue
            }));

            res.json({ success: true, data: result });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    formatBooking(booking) {
        const obj = booking.toObject ? booking.toObject() : { ...booking._doc };
        
        obj.createdAtFormatted = moment(obj.createdAt).format('MMMM Do YYYY, h:mm a');
        
        if (obj.updatedAt && new Date(obj.createdAt).getTime() !== new Date(obj.updatedAt).getTime()) {
            obj.updatedAtFormatted = moment(obj.updatedAt).format('MMMM Do YYYY, h:mm a');
        }

        delete obj.createdAt;
        delete obj.updatedAt;
        delete obj.__v;
        
        return obj;
    }
}

const bookingController = new BookingController();

export const createBooking = bookingController.createBooking.bind(bookingController);
export const getAllBookings = bookingController.getAllBookings.bind(bookingController);
export const getBookingById = bookingController.getBookingById.bind(bookingController);
export const getBookingByCustomId = bookingController.getBookingByCustomId.bind(bookingController);
export const getBookingsByUser = bookingController.getBookingsByUser.bind(bookingController);
export const getBookingsByFlight = bookingController.getBookingsByFlight.bind(bookingController);
export const deleteBooking = bookingController.deleteBooking.bind(bookingController);
export const checkInPassenger = bookingController.checkInPassenger.bind(bookingController);
export const processBaggage = bookingController.processBaggage.bind(bookingController);
export const getAdminStats = bookingController.getAdminStats.bind(bookingController);
export const getRouteRevenue = bookingController.getRouteRevenue.bind(bookingController);

export default bookingController;
