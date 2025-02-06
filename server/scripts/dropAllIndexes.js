import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function dropAllIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/villa-booking');
    console.log('Connected to MongoDB');

    const db = mongoose.connection;
    
    // Drop all indexes except _id
    await db.collection('bookings').dropIndexes();
    console.log('Successfully dropped all indexes');

    // Create only the indexes we need
    await db.collection('bookings').createIndex({ 'customerInfo.email': 1 });
    await db.collection('bookings').createIndex({ status: 1 });
    console.log('Created new indexes');

    // List remaining indexes
    const indexes = await db.collection('bookings').listIndexes().toArray();
    console.log('Current indexes:', indexes);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

dropAllIndexes();
