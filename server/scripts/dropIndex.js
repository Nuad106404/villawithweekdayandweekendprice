import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/villa-booking');
    console.log('Connected to MongoDB');

    const db = mongoose.connection;
    await db.collection('bookings').dropIndex('bookingId_1');
    console.log('Successfully dropped bookingId index');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

dropIndex();
