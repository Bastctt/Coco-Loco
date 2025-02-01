import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import connectDB from '../../config/db.js';
import Channel from '../../models/Channel.js';

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
  await Channel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
  if (server && server.close) {
    server.close();
  }
});

describe('Channel API Tests', () => {
  it('should create a new channel', async () => {
    const res = await request(server).post('/api/channels/create').send({ name: 'general' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('general');
  });

  it('should list all channels', async () => {
    await new Channel({ name: 'random' }).save();
    const res = await request(server).get('/api/channels');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should delete a channel', async () => {
    const channel = new Channel({ name: 'toDelete' });
    await channel.save();

    const res = await request(server).delete(`/api/channels/delete/${channel.name}`);
    expect(res.status).toBe(200);
  });

  it('should return 404 if channel to delete does not exist', async () => {
    const res = await request(server).delete('/api/channels/delete/doesNotExist');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Channel not found');
  });

  it('should allow a user to join a channel', async () => {
    await new Channel({ name: 'dev' }).save();

    const res = await request(server).post('/api/channels/join').send({ name: 'dev', username: 'Alice' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Joined channel: dev');

    const channel = await Channel.findOne({ name: 'dev' });
    expect(channel.users).toContain('Alice');
  });

  it('should return 404 when joining a non-existing channel', async () => {
    const res = await request(server).post('/api/channels/join').send({ name: 'nonexistent', username: 'Bob' });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Channel not found');
  });

  it('should allow a user to quit a channel', async () => {
    const channel = new Channel({ name: 'news', users: ['Alice'] });
    await channel.save();

    const res = await request(server).post('/api/channels/quit').send({ name: 'news', username: 'Alice' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User Alice quit channel: news');

    const updatedChannel = await Channel.findOne({ name: 'news' });
    expect(updatedChannel.users).not.toContain('Alice');
  });

  it('should return 404 if channel does not exist when quitting', async () => {
    const res = await request(server).post('/api/channels/quit').send({ name: 'doesNotExist', username: 'Bob' });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Channel not found');
  });

  it('should return 400 if user is not in the channel when quitting', async () => {
    const channel = new Channel({ name: 'random', users: [] });
    await channel.save();

    const res = await request(server).post('/api/channels/quit').send({ name: 'random', username: 'Bob' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User is not in this channel');
  });

  it('should list channels filtered by name', async () => {
    await new Channel({ name: 'dev-talk' }).save();
    await new Channel({ name: 'random-chat' }).save();

    const res = await request(server).get('/api/channels/list/dev');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('dev-talk');
  });

  it('should list users in a specific channel', async () => {
    const channel = new Channel({ name: 'general', users: ['Alice', 'Bob'] });
    await channel.save();

    const res = await request(server).get('/api/channels/users/general');
    expect(res.status).toBe(200);
    expect(res.body.users).toContain('Alice');
    expect(res.body.users).toContain('Bob');
});

it('should return 404 if channel does not exist when listing users', async () => {
    const res = await request(server).get('/api/channels/users/doesNotExist');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Channel not found');
});
});
