import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Flight from './models/Flight.js';

dotenv.config();

const flights = [
    {
        flight_number: 'AI-101',
        origin: 'New York (JFK)',
        destination: 'Mumbai (BOM)',
        departure_time: new Date('2025-05-10T14:30:00Z'),
        arrival_time: new Date('2025-05-11T08:00:00Z'),
        price: 85000,
        status: 'On Time'
    },
    {
        flight_number: 'AI-202',
        origin: 'London (LHR)',
        destination: 'Delhi (DEL)',
        departure_time: new Date('2025-05-12T10:00:00Z'),
        arrival_time: new Date('2025-05-12T23:30:00Z'),
        price: 65000,
        status: 'Delayed'
    },
    {
        flight_number: 'AI-303',
        origin: 'Dubai (DXB)',
        destination: 'Chennai (MAA)',
        departure_time: new Date('2025-05-14T18:00:00Z'),
        arrival_time: new Date('2025-05-14T23:30:00Z'),
        price: 25000,
        status: 'On Time'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        await Flight.deleteMany({});
        console.log('🗑️  Cleared existing flights');

        await Flight.insertMany(flights);
        console.log('✈️  Seeded flights');

        mongoose.connection.close();
        console.log('❌ Disconnected');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDB();
