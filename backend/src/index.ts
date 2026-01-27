import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import hostRoutes from './routes/hosts';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import aiRoutes from './routes/ai';

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1); 

const allowedOrigins = [
    'https://www.upsosh.app',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

console.log('CORS Origins configured:', allowedOrigins);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes); 

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send('upSosh Backend API is running');
});

app.get('/api/debug', (req, res) => {
    const mode = process.env.DODO_PAYMENTS_MODE === 'live' ? 'live_mode' : 'test_mode';
    res.json({
        frontendUrl: process.env.FRONTEND_URL,
        nodeEnv: process.env.NODE_ENV,
        port: PORT,
        dodoApiKey: process.env.DODO_PAYMENTS_API_KEY ? 'SET' : 'NOT SET',
        dodoProductId: process.env.DODO_PRODUCT_ID && process.env.DODO_PRODUCT_ID.trim() !== '' ? 'SET' : 'NOT SET',
        dodoMode: mode,
        jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
        message: 'Debug info'
    });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
