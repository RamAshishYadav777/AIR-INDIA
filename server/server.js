import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import logger from './services/logger.js';
import authRoutes from './routes/authRoutes.js';
import flightRoutes from './routes/flightRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import connectDB from './config/dbcon.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO with broad CORS for local development
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins for troubleshooting
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(helmet()); // Set security HTTP headers
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate limiting: 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests, please try again later." }
});
app.use("/api", limiter);

// Middleware to attach io to req
app.use((req, res, next) => {
    req.io = io;
    next();
});



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
    res.send('Air India Backend is Running');
});

// Socket.IO Connection Handler
io.on("connection", (socket) => {
    logger.info(`⚡ New client connected: ${socket.id}`);

    // Join room based on userId for targeted notifications
    socket.on("join", (userId) => {
        if (userId) {
            socket.join(userId.toString());
            logger.info(`👤 User ${userId} joined room: ${userId.toString()}`);
        }
    });

    socket.on("disconnect", () => {
        logger.info(`❌ Client disconnected: ${socket.id}`);
    });

    // Example event listener
    socket.on("ping", (data) => {
        console.log("Ping received:", data);
        socket.emit("pong", { message: "Pong from server!" });
    });
});


// Start Server
connectDB().then(() => {
    httpServer.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`);
    });
});

