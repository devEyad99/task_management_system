// //
import bodyParser from 'body-parser';
import express from 'express';
import { AppRouter } from './AppRouter';

// import './(auth)/auth.controller';
import './(user)/user.controller';
import './(task)/task.controller';
import cors from 'cors';
import path from 'path';
import router from './routes';
const app = express();


const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'], 
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// console.log('Uploads directory:', path.join(__dirname, '../uploads'));
app.use('/api', router);
app.use(AppRouter.getInstance());

export default app;
