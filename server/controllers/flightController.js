import moment from 'moment';
import Flight from '../models/Flight.js';

class FlightController {
    
    // @desc    Get all flights
    // @route   GET /api/flights
    async getFlights(req, res) {
        try {
            const { origin, destination, date } = req.query;
            let query = {};

            if (origin) query.origin = new RegExp(origin, 'i');
            if (destination) query.destination = new RegExp(destination, 'i');

            if (date) {
                const start = new Date(date);
                const end = new Date(date);
                end.setDate(end.getDate() + 1);
                query.departure_time = { $gte: start, $lt: end };
            }

            const flights = await Flight.find(query).sort({ departure_time: 1 });
            const data = flights.map(f => this.formatFlight(f));

            res.json({ 
                success: true, 
                count: flights.length, 
                data 
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Get single flight by ID
    // @route   GET /api/flights/:id
    async getFlightById(req, res) {
        try {
            const flight = await Flight.findById(req.params.id);
            if (!flight) {
                return res.status(404).json({ success: false, message: 'Flight not found' });
            }
            res.json({ success: true, data: this.formatFlight(flight) });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Create a new flight
    // @route   POST /api/flights
    async createFlight(req, res) {
        try {
            const flight = new Flight(req.body);
            const newFlight = await flight.save();
            res.status(201).json({ 
                success: true, 
                message: 'Flight created successfully', 
                data: this.formatFlight(newFlight) 
            });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    // @desc    Update a flight
    // @route   PUT /api/flights/:id
    async updateFlight(req, res) {
        try {
            const flight = await Flight.findById(req.params.id);
            if (!flight) {
                return res.status(404).json({ success: false, message: 'Flight not found' });
            }

            Object.assign(flight, req.body);
            const updatedFlight = await flight.save();
            res.json({ 
                success: true, 
                message: 'Flight updated successfully', 
                data: this.formatFlight(updatedFlight) 
            });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    // @desc    Delete a flight
    // @route   DELETE /api/flights/:id
    async deleteFlight(req, res) {
        try {
            const flight = await Flight.findById(req.params.id);
            if (!flight) {
                return res.status(404).json({ success: false, message: 'Flight not found' });
            }

            await flight.deleteOne();
            res.json({ success: true, message: 'Flight deleted successfully' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // @desc    Toggle flight boost for "Limited Offer"
    // @route   PUT /api/flights/:id/boost
    async toggleFlightBoost(req, res) {
        try {
            const flight = await Flight.findById(req.params.id);
            if (!flight) {
                return res.status(404).json({ success: false, message: 'Flight not found' });
            }

            flight.is_boosted = !flight.is_boosted;
            if (req.body.offer_text !== undefined) {
                flight.offer_text = req.body.offer_text;
            }

            const updatedFlight = await flight.save();
            res.json({ 
                success: true, 
                message: 'Flight boost toggled', 
                data: this.formatFlight(updatedFlight) 
            });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    formatFlight(flight) {
        const obj = flight.toObject ? flight.toObject() : { ...flight._doc };
        
        obj.departureFormatted = moment(obj.departure_time).format('MMMM Do YYYY, h:mm a');
        obj.arrivalFormatted = moment(obj.arrival_time).format('MMMM Do YYYY, h:mm a');
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

const flightController = new FlightController();

export const getFlights = flightController.getFlights.bind(flightController);
export const getFlightById = flightController.getFlightById.bind(flightController);
export const createFlight = flightController.createFlight.bind(flightController);
export const updateFlight = flightController.updateFlight.bind(flightController);
export const deleteFlight = flightController.deleteFlight.bind(flightController);
export const toggleFlightBoost = flightController.toggleFlightBoost.bind(flightController);

export default flightController;
