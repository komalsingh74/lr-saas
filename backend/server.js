import "./config/env.js"; 
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/connectDB.js';
import errorHandler from './middleware/errorHandler.js';


const app = express();

app.use(
  cors({
    origin:"http://localhost:3000", // 👈 exact frontend URL
    credentials: true, // 👈 IMPORTANT
  })
);

// Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Routes
import routes from "./routes/index.js";
app.use("/api", routes);

// Global error handler (LAST middleware)
app.use(errorHandler);

// console.log('PORT=', process.env.PORT);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

