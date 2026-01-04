import connectMongoDB, { getConnectionStatus } from "./mongodb.js";

/**
 * Connect to MongoDB database and initialize
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
  } catch (error) {
    // Error is already logged in mongodb.js
    throw error;
  }
};

export default connectDB;
export { getConnectionStatus };
