import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Channel from './models/Channel.js';
import Message from './models/Message.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB(); // ✅ Connexion à la base de production

    console.log('🛠 Suppression des anciennes données...');
    await Channel.deleteMany();
    await Message.deleteMany();

    console.log('✅ Ajout des nouveaux channels...');
    const channels = await Channel.insertMany([
      { name: 'general' },
      { name: 'random' },
      { name: 'announcements' },
    ]);

    console.log('✅ Ajout des messages...');
    await Message.insertMany([
      { sender: 'Alice', text: 'Hello everyone!', channel: 'general' },
      { sender: 'Bob', text: 'Welcome!', channel: 'general' },
      { sender: 'Charlie', text: 'Any updates?', channel: 'announcements' },
    ]);

    console.log('🎉 Données insérées avec succès !');
    process.exit();
  } catch (error) {
    console.error(`❌ Erreur lors de l’insertion des données : ${error.message}`);
    process.exit(1);
  }
};

seedData();
