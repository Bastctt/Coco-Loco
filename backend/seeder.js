import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Channel from './models/Channel.js';
import Message from './models/Message.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('🛠 Suppression des anciennes données...');
    await Channel.deleteMany();
    await Message.deleteMany();

    console.log('✅ Ajout des nouveaux channels...');
    const channels = await Channel.insertMany([
      { name: 'general' },
    ]);

    console.log('✅ Ajout des messages...');
    await Message.insertMany([
      { sender: 'Alice', text: 'Hello everyone!', channel: channels[0]._id  },
      { sender: 'Bob', text: 'Welcome!', channel: channels[0]._id  },
      { sender: 'Charlie', text: 'Any updates?', channel: channels[0]._id  },
    ]);

    console.log('🎉 Données insérées avec succès !');
    process.exit();
  } catch (error) {
    console.error(`❌ Erreur lors de l’insertion des données : ${error.message}`);
    process.exit(1);
  }
};

seedData();
