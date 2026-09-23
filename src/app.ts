import express from 'express';
import cors from 'cors';
import path from 'path';
import router from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
const app = express();

const configuredOrigins = process.env.CORS_ORIGIN?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOrigin =
  configuredOrigins && configuredOrigins.length > 0
    ? configuredOrigins
    : process.env.NODE_ENV === 'production'
      ? false
      : '*';

app.disable('x-powered-by');
app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', router);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
