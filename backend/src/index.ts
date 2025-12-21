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


const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1); // Trust first proxy (required for secure cookies on Railway)

// Allow both production and development URLs
const allowedOrigins = [
    'https://www.upsosh.app',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
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

// Increase body size limit to handle Base64 image uploads (payment proofs)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
    res.send('upSosh Backend API is running');
});

app.get('/api/debug', (req, res) => {
    res.json({
        frontendUrl: process.env.FRONTEND_URL,
        nodeEnv: process.env.NODE_ENV,
        port: PORT,
        message: 'Debug info'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
