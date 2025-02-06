import express from 'express';
import Villa from '../models/Villa.js';

const router = express.Router();

// Get villa rooms
router.get('/rooms', async (req, res) => {
  try {
    const villa = await Villa.findOne();
    if (!villa) {
      return res.status(404).json({ message: 'Villa not found' });
    }
    res.json({ rooms: villa.rooms });
  } catch (error) {
    console.error('Error fetching villa rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
});

export default router;
