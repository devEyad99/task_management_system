//
import bodyParser from 'body-parser';
import express from 'express';
import userRouter from './routes/user.routes';
import taskRouter from './routes/task.routes';
import authRouter from './routes/authroutes';

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes here
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/tasks', taskRouter);

export default app;
