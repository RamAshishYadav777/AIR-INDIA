import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../services/logger.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        logger.info("✅ Database Connected Successfully");
    } catch (error) {
        logger.error(`❌ Database Connection Error: ${error.message}`);
    }
};

export default connectDB;
