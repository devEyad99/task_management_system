// //
import bodyParser from 'body-parser';
import express from 'express';
import { AppRouter } from './AppRouter';

import './controllers/auth.controller';
import './user/controller/user.controller';
import './task/controller/task.controller';
import cors from 'cors';
const app = express();

// Enable CORS for all origins and all methods
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'], // Allow headers
};

// Use CORS middleware with permissive configuration
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(AppRouter.getInstance());

export default app;
