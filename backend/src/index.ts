import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import hostRoutes from './routes/hosts';
import bookingRoutes from './routes/bookings';


const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1); // Trust first proxy (required for secure cookies on Railway)

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

console.log('CORS Origin configured as:', process.env.FRONTEND_URL || 'http://localhost:3000');

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/bookings', bookingRoutes);

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
