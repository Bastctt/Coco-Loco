import express from 'express';
const router = express.Router();
import Message from '../models/Message.js';
import Channel from '../models/Channel.js';

// get message of a channel
router.get('/:channelName', async (req, res) => {
  const { channelName } = req.params;
  try {
    const messages = await Message.find({ channel: channelName }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// send a message to a channel
router.post('/', async (req, res) => {
  const { sender, text, channel } = req.body;

  try {
    const message = new Message({ sender, text, channel });
    await message.save();

    const channelDoc = await Channel.findOne({ name: channel });
    if (channelDoc) {
        channelDoc.messages.push({ sender, text, timestamp: new Date() });
        await channelDoc.save();
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
