import express from 'express';
import {
    createBooking,
    getAllBookings,
    getBookingById,
    getBookingByCustomId,
    getBookingsByUser,
    getBookingsByFlight,
    deleteBooking,
    checkInPassenger,
    processBaggage,
    getAdminStats,
    getRouteRevenue
} from '../controllers/bookingController.js';

const router = express.Router();

router.get('/admin/stats', getAdminStats);
router.get('/admin/route-revenue', getRouteRevenue);

router.post('/', createBooking);
router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.get('/code/:bookingId', getBookingByCustomId);
router.get('/user/:userId', getBookingsByUser);
router.get('/flight/:flightId', getBookingsByFlight);
router.delete('/:id', deleteBooking);
router.put('/:id/checkin', checkInPassenger);
router.put('/:id/baggage', processBaggage);

export default router;
