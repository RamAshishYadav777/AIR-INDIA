import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/Booking.js';
import Flight from './models/Flight.js';
import User from './models/User.js';
import connectDB from './config/dbcon.js';

dotenv.config();

const cities = ["Delhi", "Mumbai", "London", "Paris", "New York", "Dubai", "Singapore", "Sydney", "Tokyo", "Toronto"];

const seedData = async () => {
    try {
        await connectDB();
        console.log("Connected to DB...");

        // 1. Get an admin user or create one
        let user = await User.findOne({ role: 'admin' });
        if (!user) {
            console.log("Creating admin user...");
            user = await User.create({
                name: "Admin User",
                email: "admin@airindia.com",
                password: "password123",
                role: "admin"
            });
        }

        // 2. Create some flights if none exist
        let flights = await Flight.find();
        if (flights.length < 5) {
            console.log("Seeding flights...");
            const flightData = [
                { flight_number: "AI101", origin: "Delhi", destination: "London", departure_time: new Date(), arrival_time: new Date(), price: 50000, status: "On Time" },
                { flight_number: "AI202", origin: "Mumbai", destination: "Paris", departure_time: new Date(), arrival_time: new Date(), price: 45000, status: "On Time" },
                { flight_number: "AI303", origin: "Delhi", destination: "New York", departure_time: new Date(), arrival_time: new Date(), price: 80000, status: "On Time" },
                { flight_number: "AI404", origin: "Mumbai", destination: "Dubai", departure_time: new Date(), arrival_time: new Date(), price: 25000, status: "On Time" },
                { flight_number: "AI505", origin: "Delhi", destination: "Singapore", departure_time: new Date(), arrival_time: new Date(), price: 30000, status: "On Time" },
                { flight_number: "AI606", origin: "London", destination: "Delhi", departure_time: new Date(), arrival_time: new Date(), price: 55000, status: "On Time" },
                { flight_number: "AI707", origin: "New York", destination: "Mumbai", departure_time: new Date(), arrival_time: new Date(), price: 75000, status: "On Time" },
            ];
            const newFlights = await Flight.insertMany(flightData);
            flights = [...flights, ...newFlights];
        }

        // 3. Create random bookings over the last 14 days
        console.log("Seeding bookings...");
        const bookings = [];
        for (let i = 0; i < 60; i++) {
            const randomFlight = flights[Math.floor(Math.random() * flights.length)];
            const randomDay = Math.floor(Math.random() * 14);
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - randomDay);

            bookings.push({
                user_id: user._id,
                flight_id: randomFlight._id,
                passengers: [{
                    name: "Passenger " + (i + 1),
                    age: Math.floor(Math.random() * 50) + 18,
                    gender: i % 2 === 0 ? "Male" : "Female",
                    seat_number: (i % 30) + "A"
                }],
                booking_id: "BK" + Math.random().toString(36).substr(2, 6).toUpperCase(),
                total_amount: Math.floor(Math.random() * 60000) + 15000,
                payment_status: "completed",
                createdAt: createdAt
            });
        }

        await Booking.insertMany(bookings);
        console.log(`Successfully seeded ${bookings.length} bookings!`);
        console.log("Heatmap data should now be visible.");
        process.exit();
    } catch (err) {
        console.error("Error seeding data:", err.message);
        process.exit(1);
    }
};

seedData();
