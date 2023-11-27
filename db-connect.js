import { MongoClient } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function getDatabase() {
    try {
        await client.connect();
        const db = client.db(process.env.DATABASE);
        return db;
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        throw error;
    }
}

// Automatically close the database connection when the Node.js process exits
process.on("exit", async () => {
    await client.close();
});

// Handle CTRL+C events
process.on("SIGINT", async () => {
    await client.close();
    process.exit();
});

export { getDatabase };
