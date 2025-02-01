import mongoose from 'mongoose';

// Connexion à MongoDB
const connectDB = async (testUri = null) => {
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected.');
    return;
  }

  const mongoURI = testUri || process.env.MONGO_URI;

  console.log(`🔍 Connexion à MongoDB: ${mongoURI.includes('127.0.0.1') ? 'MongoMemoryServer (TEST)' : 'Base de Production'}`);

  try {
    await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
