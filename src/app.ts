// //
import bodyParser from 'body-parser';
import express from 'express';
import { AppRouter } from './AppRouter';

import './controllers/auth.controller';
import './user/controller/user.controller';
import './task/controller/task.controller';
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(AppRouter.getInstance());

export default app;
