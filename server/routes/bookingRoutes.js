import express from 'express';
import auth, { adminAuth } from '../middleware/auth.js';
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

router.get('/admin/stats', adminAuth, getAdminStats);
router.get('/admin/route-revenue', adminAuth, getRouteRevenue);

router.post('/', auth, createBooking);
router.get('/', adminAuth, getAllBookings);
router.get('/:id', auth, getBookingById);
router.get('/code/:bookingId', getBookingByCustomId); // Public check-in check? Keep or protect? 
router.get('/user/:userId', auth, getBookingsByUser);
router.get('/flight/:flightId', adminAuth, getBookingsByFlight);
router.delete('/:id', adminAuth, deleteBooking);
router.put('/:id/checkin', auth, checkInPassenger);
router.put('/:id/baggage', adminAuth, processBaggage);

export default router;
