import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
    flight_number: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departure_time: { type: Date, required: true },
    arrival_time: { type: Date, required: true },
    price: { type: Number, required: true },
    is_boosted: { type: Boolean, default: false },
    offer_text: { type: String, default: '' },
    status: { type: String, default: 'On Time' }
}, { timestamps: true });

export default mongoose.model('Flight', flightSchema);
