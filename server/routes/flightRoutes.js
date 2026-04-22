import express from 'express';
import {
    getFlights,
    getFlightById,
    createFlight,
    updateFlight,
    deleteFlight,
    toggleFlightBoost
} from '../controllers/flightController.js';

const router = express.Router();

router.get('/', getFlights);
router.get('/:id', getFlightById);
router.post('/', createFlight);
router.put('/:id', updateFlight);
router.put('/:id/boost', toggleFlightBoost);
router.delete('/:id', deleteFlight);

export default router;
