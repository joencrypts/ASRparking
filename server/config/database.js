import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`📁 MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // User indexes
    await mongoose.connection.collection('users').createIndex(
      { email: 1 }, 
      { unique: true, background: true }
    );
    await mongoose.connection.collection('users').createIndex(
      { phone: 1 },
      { background: true }
    );
    
    // Vehicle entries indexes
    await mongoose.connection.collection('vehicleentries').createIndex(
      { vehicleNumber: 1 },
      { background: true }
    );
    await mongoose.connection.collection('vehicleentries').createIndex(
      { entryTime: -1 },
      { background: true }
    );
    await mongoose.connection.collection('vehicleentries').createIndex(
      { tokenNumber: 1 },
      { sparse: true, background: true }
    );
    
    // Prebookings indexes
    await mongoose.connection.collection('prebookings').createIndex(
      { tokenNumber: 1 },
      { unique: true, sparse: true, background: true }
    );
    await mongoose.connection.collection('prebookings').createIndex(
      { userId: 1 },
      { background: true }
    );
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    if (error.code === 85) { // Index already exists
      console.log('ℹ️ Some indexes already exist, skipping...');
    } else {
      console.log('⚠️ Index creation warning:', error.message);
    }
  }
};

export default connectDB;