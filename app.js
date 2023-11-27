// ========== IMPORTS ========== //
import cors from "cors";
import express from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "./db-connect.js";

// ========== APP SETUP ========== //
const app = express();
const port = process.env.SERVER_PORT || 3333;
app.use(express.json()); // to parse JSON bodies
app.use(cors());

// GET Endpoint "/"
app.get("/", (request, response) => {
    response.send("Node Express Musicbase REST API");
});

app.listen(port, async () => {
    console.log(`App listening on http://localhost:${port}`);
});

// GET Endpoint "/artists" - get all artists
app.get("/artists", async (request, response) => {
    const db = await getDatabase();
    const artists = await db.collection("artists").find().toArray(); // Use toArray() to retrieve documents as an array
    response.json(artists);
});

// GET Endpoint "/artists/:id" - get one artist
app.get("/artists/:id", async (request, response) => {
    // ...
});

// GET Endpoint "/artists/:id" - get one artist
app.get("/artists/:id/albums", async (request, response) => {
    // ...
});

app.get("/albums", async (request, response) => {
    // ...
});

app.get("/songs", async (request, response) => {
    // ...
});
