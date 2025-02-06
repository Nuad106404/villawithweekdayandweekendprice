import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/villa-booking');
    console.log('Connected to MongoDB');

    const db = mongoose.connection;
    await db.collection('bookings').dropIndex('reservationId_1');
    console.log('Successfully dropped reservationId index');

    // List remaining indexes
    const indexes = await db.collection('bookings').listIndexes().toArray();
    console.log('Remaining indexes:', indexes);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

dropIndex();
