import mongoose from "mongoose";

/**
 * Connect to MongoDB Atlas
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    console.log("\n📡 Initiating MongoDB connection...\n");

    // Debug: Check if environment variables are loaded
    console.log("🔍 Debugging Environment Variables:");
    console.log(`   - PORT: ${process.env.PORT || "NOT SET"}`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || "NOT SET"}`);
    console.log(`   - MONGO_URI exists: ${!!process.env.MONGO_URI}`);
    if (process.env.MONGO_URI) {
      // Show partial URI for security (hide password)
      const uriPreview =
        process.env.MONGO_URI.substring(0, 20) +
        "..." +
        process.env.MONGO_URI.substring(process.env.MONGO_URI.length - 20);
      console.log(`   - MONGO_URI preview: ${uriPreview}`);
    }
    console.log("");

    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(mongoURI, {
      // These options are now handled automatically by Mongoose 6+
      // But we can add them explicitly for clarity
    });

    console.log("✅ MongoDB Connected Successfully\n");
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Host: ${conn.connection.host}\n`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("\n❌ MONGODB CONNECTION ERROR\n");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error(`Error: ${error.message}`);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Provide detailed troubleshooting steps
    if (error.message.includes("MONGO_URI")) {
      console.error("TROUBLESHOOTING:");
      console.error("1. Check .env file exists in project root");
      console.error("2. Verify MONGO_URI is set correctly");
      console.error(
        "3. Format: mongodb+srv://username:password@cluster.mongodb.net/database"
      );
      console.error(
        "4. Get your connection string from MongoDB Atlas Dashboard"
      );
    } else if (error.message.includes("authentication")) {
      console.error("TROUBLESHOOTING:");
      console.error("1. Verify MongoDB Atlas username and password");
      console.error(
        "2. Check if password contains special characters (URL encode them)"
      );
      console.error("3. Ensure database user has proper permissions");
    } else if (
      error.message.includes("network") ||
      error.message.includes("ENOTFOUND")
    ) {
      console.error("TROUBLESHOOTING:");
      console.error("1. Check internet connection");
      console.error("2. Verify MongoDB Atlas cluster is running");
      console.error("3. Check firewall/network settings");
      console.error("4. Ensure IP address is whitelisted in MongoDB Atlas");
    } else {
      console.error("TROUBLESHOOTING:");
      console.error("1. Check .env configuration");
      console.error("2. Verify MongoDB Atlas cluster status");
      console.error("3. Ensure database exists");
      console.error("4. Review application logs for details");
    }

    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(1);
  }
};

/**
 * Get MongoDB connection status
 * @returns {Object} Connection status information
 */
export const getConnectionStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    connected: state === 1,
    state: states[state],
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
};

export default connectDB;
