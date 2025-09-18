// server.js

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Added: For cookie parsing
const morgan = require('morgan'); // Added: For request logging
const connectDB = require("./db"); // Renamed and moved to config folder
require('dotenv').config();

// --- Import Routers ---
const authRouter = require("./routes/auth.routes.js");
const organizationRouter = require("./routes/organization.routes.js"); // Renamed for consistency
const userRouter = require("./routes/user.routes.js");

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI;

// --- Essential Configuration Checks ---
if (!mongoURI) {
    console.error("FATAL ERROR: MONGODB_URI is not defined in environment variables.");
    process.exit(1); // Exit process if critical variable is missing
}

// --- Middleware ---
app.use(cors({
    origin: process.env.CLIENT_URL || '*', 
    credentials: true, 
}));

app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data
app.use(cookieParser()); // Parses cookies attached to the request
app.use(morgan('dev')); // HTTP request logger (e.g., outputs 'GET /api/users 200 5ms - 100b')

// --- API Routes ---
const API_PREFIX = '/api'; // Define a common API prefix for cleaner routes

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/orgs`, organizationRouter); 
app.use(`${API_PREFIX}/users`, userRouter);

// --- Basic Root Route ---
app.get('/', (req, res) => {
    res.send('Task Manager API is running!');
});

// --- Centralized Error Handling Middleware (MUST be after all routes) ---
app.use((err, req, res, next) => {
    console.error('Caught by error middleware:', err.stack); // Log the full stack trace for debugging
    const statusCode = err.status || 500;
    const message = err.message || 'An unexpected error occurred on the server.';

    // Send a more detailed error in development, less in production
    res.status(statusCode).json({
        message,
        error: process.env.NODE_ENV === 'production' ? {} : err.stack // Avoid sending stack in prod
    });
});

// --- Database Connection and Server Start ---
// Connect to DB, then start the server
connectDB(mongoURI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to the database. Server not started.", err);
        process.exit(1); // Exit if DB connection fails
    });