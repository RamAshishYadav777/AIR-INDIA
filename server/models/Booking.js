import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flight_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    passengers: [{
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, required: true },
        phone: { type: String },
        seat_number: { type: String, required: true },
        checked_in: { type: Boolean, default: false },
        baggage: {
            items: [{
                bag_type: { type: String }, // e.g., 'Check-in', 'Cabin'
                weight: { type: Number },
                tag_id: { type: String }
            }],
            counter_processed: { type: Boolean, default: false }
        }
    }],
    booking_id: { type: String, required: true, unique: true },
    pnr: { type: String, unique: true },
    total_amount: { type: Number, required: true },
    payment_status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    razorpay_payment_id: { type: String }
}, { timestamps: true });

// Pre-save hook to generate 7-character alphanumeric PNR
bookingSchema.pre('save', function (next) {
    if (!this.pnr) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 7; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.pnr = result;
    }
    next();
});

export default mongoose.model('Booking', bookingSchema);
