import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';


const app = express();
const PORT = process.env.PORT || 5000;

// allow multiple origins
const allowedOrigins = ['http://localhost:5173/'];

(async () => {
  await connectDB();

  // Middleware configuration
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({origin: allowedOrigins, credentials: true}));

  app.get("/", (req, res) => {
      res.send("API is running...");
  })

  app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
  });
})();