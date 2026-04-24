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
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO with security middleware
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : "*",
        methods: ["GET", "POST"]
    }
});

// Socket.IO Authentication Middleware
import jwt from 'jsonwebtoken';
io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }
    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid token'));
    }
});

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : "*",
    credentials: true
}));
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

// Serve Static Files in Production
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
    // Check if the request is for API
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, message: "API route not found" });
    }
    // Serve index.html for all other routes to support client-side routing
    res.sendFile(path.join(distPath, 'index.html'));
});

// app.get('/', (req, res) => {
//     res.send('Air India Backend is Running');
// });

// Socket.IO Connection Handler
io.on("connection", (socket) => {
    logger.info(`⚡ New client connected: ${socket.id}`);

    // Join room based on authenticated userId
    socket.on("join", () => {
        if (socket.user && socket.user.id) {
            socket.join(socket.user.id.toString());
            logger.info(`👤 User ${socket.user.id} joined their private room`);
        }
    });

    socket.on("disconnect", () => {
        logger.info(`❌ Client disconnected: ${socket.id}`);
    });

    // Example event listener
    socket.on("ping", (data) => {
        logger.info(`Ping received: ${JSON.stringify(data)}`);
        socket.emit("pong", { message: "Pong from server!" });
    });
});


// Start Server
connectDB().then(() => {
    httpServer.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`);
    });
});

