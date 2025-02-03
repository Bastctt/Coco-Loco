import express from 'express';
const router = express.Router();
import Channel from '../models/Channel.js';
import { io } from '../server.js';

// Create a new channel
router.post('/create', async (req, res) => {
    const { name } = req.body;
    try {
        const channel = new Channel({ name });
        await channel.save();
        io.emit('channelUpdate');
        res.status(201).json(channel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// List all channels
router.get('/', async (req, res) => {
    const { username } = req.query;
  
    try {
      let channels;
      if (username) {
        channels = await Channel.find({
          $or: [
            { isPrivate: false },
            { users: username },
          ],
        });
      } else {
        channels = await Channel.find({ isPrivate: false });
      }
  
      res.json(channels);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
// Delete a channel
router.delete('/delete/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const channel = await Channel.findOne({ name });
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }
        await channel.deleteOne();
        io.emit('channelUpdate');
        res.json({ message: 'Channel deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Join a channel and add the user to the channel's user list
router.post('/join', async (req, res) => {
    const { name, username } = req.body;

    try {
        const channel = await Channel.findOne({ name });

        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        // check for private channel user authorization
        if (channel.isPrivate && !channel.users.includes(username)) {
            return res.status(403).json({ message: 'Access denied: Private channel' });
        }

        if (!channel.users.includes(username)) {
            channel.users.push(username);
            await channel.save();
        }

        res.status(200).json({ message: `Joined channel: ${name}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Quit a channel
router.post('/quit', async (req, res) => {
    const { name, username } = req.body;

    try {
        const channel = await Channel.findOne({ name });

        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        if (!channel.users.includes(username)) {
            return res.status(400).json({ message: 'User is not in this channel' });
        }

        channel.users = channel.users.filter(user => user !== username);

        await channel.save();

        res.status(200).json({ message: `User ${username} quit channel: ${name}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// List available channels, optionally filtering by a search string
router.get('/list/:filter?', async (req, res) => {
    const { filter } = req.params;

    try {
        let query = {};
        if (filter) {
            query = { name: { $regex: filter, $options: 'i' } };
        }

        const channels = await Channel.find(query);
        res.status(200).json(channels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// List users currently in a specific channel
router.get('/users/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const channel = await Channel.findOne({ name });

        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        res.status(200).json({ users: channel.users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
