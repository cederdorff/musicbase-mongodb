import "dotenv/config";
import mongoose from "mongoose";

const uri = `${process.env.MONGODB_URI}/${process.env.DATABASE}`;
console.log("Connecting to the database:", uri);

async function initMongoose() {
    try {
        const connection = await mongoose.connect(uri);
        console.log("Connected to the database");
        return connection;
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        throw error;
    }
}

// Automatically close the database connection when the Node.js process exits
process.on("exit", async () => {
    await mongoose.disconnect();
});

// Handle CTRL+C events
process.on("SIGINT", async () => {
    await mongoose.disconnect();
    process.exit();
});

export { initMongoose };
