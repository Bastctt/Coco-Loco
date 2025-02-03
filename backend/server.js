import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import channelRoutes from './routes/channel.js';
import messageRoutes from './routes/message.js';
import Message from './models/Message.js';
import Channel from './models/Channel.js';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
];

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

const users = {};
const userChannels = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('setUsername', ({ username }, callback) => {
    if (!username) return callback({ success: false, message: 'Username is required' });

    if (Object.values(users).includes(username)) {
      return callback({ success: false, message: 'Username already in use' });
    }

    users[socket.id] = username;
    callback({ success: true });
    console.log(`✅ ${username} connected`);
  });

  socket.on('joinChannel', async ({ username, channelName }) => {
    if (!username || !channelName) return;

    socket.join(channelName);
    userChannels[username] = channelName;

    const channel = await Channel.findOne({ name: channelName });
    if (channel && !channel.users.includes(username)) {
      channel.users.push(username);
      await channel.save();
    }

    io.to(channelName).emit('message', {
      sender: 'System',
      text: `${username} has joined the channel`,
    });
  });

  socket.on('leaveChannel', async ({ username, channelName }) => {
    if (!username || !channelName) return;

    socket.leave(channelName);
    delete userChannels[username];

    const channel = await Channel.findOne({ name: channelName });
    if (channel) {
      channel.users = channel.users.filter((user) => user !== username);
      await channel.save();
    }

    io.to(channelName).emit('message', {
      sender: 'System',
      text: `${username} has left the channel`,
    });
  });

  socket.on('sendMessage', async ({ sender, text, channel }) => {
    if (!sender || !text || !channel) return;
    try {
      const newMessage = new Message({ sender, text, channel });
      await newMessage.save();
      io.to(channel).emit('message', { sender, text });
    } catch (error) {
      console.error(`❌ Error sending message: ${error.message}`);
    }
  });

  socket.on('privateMessage', async ({ sender, recipient, text }) => {
    if (!sender || !recipient || !text) return;
  
    const privateChannelName = [sender, recipient].sort().join('-');
  
    let privateChannel = await Channel.findOne({ name: privateChannelName });
    if (!privateChannel) {
      privateChannel = new Channel({ name: privateChannelName, users: [sender, recipient], isPrivate: true, messages: [] });
      await privateChannel.save();
    } else {
      if (!privateChannel.users.includes(sender)) privateChannel.users.push(sender);
      if (!privateChannel.users.includes(recipient)) privateChannel.users.push(recipient);
      await privateChannel.save();
    }
  
    socket.join(privateChannelName);
    const recipientSocketId = Object.keys(users).find((key) => users[key] === recipient);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('joinChannel', { username: recipient, channelName: privateChannelName });
    }
  
    try {
      const newMessage = new Message({ sender, recipient, text, channel: privateChannelName, isPrivate: true });
      await newMessage.save();
  
      privateChannel.messages.push(newMessage._id);
      await privateChannel.save();
  
      io.to(privateChannelName).emit('message', { sender, text, isPrivate: true, channel: privateChannelName });
    } catch (error) {
      console.error(`❌ Error saving private message: ${error.message}`);
    }
  });  
  
  socket.on('disconnect', async () => {
    const username = users[socket.id];
    if (username) {
      const channelName = userChannels[username];
      if (channelName) {
        io.to(channelName).emit('message', { sender: 'System', text: `${username} has disconnected` });
        const channel = await Channel.findOne({ name: channelName });
        if (channel) {
          channel.users = channel.users.filter((user) => user !== username);
          await channel.save();
        }
      }
      delete users[socket.id];
      delete userChannels[username];
      io.emit('userDisconnected', { username });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { server, io };
