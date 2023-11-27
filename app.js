// ========== IMPORTS ========== //
import cors from "cors";
import express from "express";
import { getDatabase } from "./db-connect.js";

// ========== APP SETUP ========== //
const app = express();
const port = process.env.SERVER_PORT || 3333;
app.use(express.json()); // to parse JSON bodies
app.use(cors()); // to allow Cross-Origin Resource Sharing (CORS)
const db = await getDatabase(); // Connect to the database

// GET Endpoint "/"
app.get("/", (request, response) => {
    response.send("Node Express Musicbase REST API");
});

app.listen(port, async () => {
    console.log(`App listening on http://localhost:${port}`);
});

// GET Endpoint "/artists" - get all artists
app.get("/artists", async (request, response) => {
    const artists = await db.collection("artists").find().toArray(); // Use toArray() to retrieve documents as an array
    response.json(artists);
});

// GET Endpoint "/artists/:id" - get one artist
app.get("/artists/:id", async (request, response) => {
    // ...
});

// GET Endpoint "/artists/:id/albums" - get all albums for one artist
app.get("/artists/:id/albums", async (request, response) => {
    // ...
});

// GET Endpoint "/albums" - get all albums
app.get("/albums", async (request, response) => {
    // ...
});

// GET Endpoint "/songs" - get all songs
app.get("/songs", async (request, response) => {
    // ...
});
