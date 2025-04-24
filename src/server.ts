import './models/index';
import sequelize from './config/database';
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;
async function startServer() {
  try {
    await sequelize.sync();
    console.log('Database is connected successfuly...');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}...`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();
