// ========== IMPORTS ========== //
import cors from "cors";
import express from "express";
import { initMongoose } from "./db-connect.js";
import mongoose from "mongoose";

// ========== APP SETUP ========== //
const app = express();
const port = process.env.SERVER_PORT || 3333;
app.use(express.json()); // to parse JSON bodies
app.use(cors());
initMongoose();

// ========== SCHEMAS & MODELS ========== //

const artistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    genre: String,
    image: String,
    birthdate: { type: Date, default: Date.now },
    gender: String
});

const Artist = mongoose.model("Artist", artistSchema);

// ========== CREATE TEST DATA ========== //

const adele = new Artist({
    name: "Adele",
    genre: "Pop",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Adele_2016.jpg/220px-Adele_2016.jpg",
    birthdate: new Date("1988-05-05"),
    gender: "Female"
});
await adele.save();

const beyonce = new Artist({
    name: "Beyoncé",
    genre: "Pop",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Beyonce_-_The_Formation_World_Tour%2C_2016_%28cropped%29.jpg/220px-Beyonce_-_The_Formation_World_Tour%2C_2016_%28cropped%29.jpg",
    birthdate: new Date("1981-09-04"),
    gender: "Female"
});
await beyonce.save();

// ========== ENDPOINTS ========== //
// GET Endpoint "/"
app.get("/", (request, response) => {
    response.send("Node Express Musicbase REST API");
});

app.listen(port, async () => {
    console.log(`App listening on http://localhost:${port}`);
});

// GET Endpoint "/artists" - get all artists
app.get("/artists", async (request, response) => {
    const artists = await Artist.find();
    response.json(artists);
});

// GET Endpoint "/artists/:id" - get one artist
app.get("/artists/:id", async (request, response) => {
    const artist = await Artist.findById(request.params.id);
    response.json(artist);
});

// POST Endpoint "/artists" - create one artist
app.post("/artists", async (request, response) => {
    const artist = new Artist(request.body);
    const result = await artist.save();
    response.json(result);
});

// PUT Endpoint "/artists/:id" - update one artist
app.put("/artists/:id", async (request, response) => {
    const artist = await Artist.findById(request.params.id);
    artist.set(request.body);
    const result = await artist.save();
    response.json(result);
});

// DELETE Endpoint "/artists/:id" - delete one artist
app.delete("/artists/:id", async (request, response) => {
    const result = await Artist.deleteOne({ _id: request.params.id });
    response.json(result);
});
