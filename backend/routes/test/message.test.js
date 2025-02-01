import request from 'supertest';

// db
import mongoose from 'mongoose';
import connectDB from '../../config/db.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

// channels
import Channel from '../../models/Channel.js';
import Message from '../../models/Message.js';

// Définir le mode test
process.env.NODE_ENV = 'test';

// Charger `server.js` avant `server.js`
import { server } from '../../server.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await connectDB(mongoUri);
});

beforeEach(async () => {
  await Message.deleteMany({});
  await Channel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
  if (server && server.close) {
    server.close();
  }
});

describe('Message API Tests', () => {
  it('should add a message to a channel and store it in the messages collection', async () => {
    await new Channel({ name: 'general' }).save();

    const res = await request(server)
      .post('/api/messages')
      .send({ sender: 'Alice', text: 'Hello world', channel: 'general' });

    expect(res.status).toBe(201);
    expect(res.body.sender).toBe('Alice');
    expect(res.body.text).toBe('Hello world');
    expect(res.body.channel).toBe('general');

    const savedMessage = await Message.findOne({ text: 'Hello world' });
    expect(savedMessage).not.toBeNull();
  });

  it('should store the message in the channel’s messages array', async () => {
    const channel = new Channel({ name: 'general' });
    await channel.save();

    await request(server)
      .post('/api/messages')
      .send({ sender: 'Alice', text: 'New message', channel: 'general' });

    const updatedChannel = await Channel.findOne({ name: 'general' });
    expect(updatedChannel.messages.length).toBe(1);
    expect(updatedChannel.messages[0].sender).toBe('Alice');
    expect(updatedChannel.messages[0].text).toBe('New message');
  });

  it('should list messages for a given channel', async () => {
    await new Message({ sender: 'Bob', text: 'Hey!', channel: 'general' }).save();

    const res = await request(server).get('/api/messages/general');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.some(msg => msg.sender === 'Bob' && msg.text === 'Hey!')).toBeTruthy();
  });

  it('should return an empty array if no messages exist for the channel', async () => {
    const res = await request(server).get('/api/messages/emptyChannel');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return 400 if message creation request is invalid', async () => {
    const res = await request(server)
      .post('/api/messages')
      .send({ sender: '', text: '', channel: '' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });
});
