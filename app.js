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

// ========== DATABASE SETUP ========== //
// Reset the existing "artists," "albums," and "songs" collections
// NOTE: This will delete all data in the database
// const collections = (await mongoose.connection.db.listCollections().toArray()).map(collection => collection.name); // Get all collection names
await mongoose.connection.dropCollection("artists"); // Drop the "artists" collection if it exists
await mongoose.connection.dropCollection("albums"); // Drop the "albums" collection if it exists
await mongoose.connection.dropCollection("songs"); // Drop the "songs" collection if it exists

// ========== SCHEMAS & MODELS ========== //

// Create a Mongoose schema for the "artists" collection
const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name of the artist is required and must be a string"],
        minlength: [1, "Name must be at least 1 character long"],
        maxlength: [255, "Name cannot exceed 255 characters"]
    },
    genre: {
        type: String,
        required: [true, "Genre of the artist is required and must be a string"],
        enum: {
            values: ["Pop", "Rock", "Hip-Hop", "Country", "Other"],
            message: "Invalid genre. Must be one of: Pop, Rock, Hip-Hop, Country, Other"
        }
    },
    image: {
        type: String,
        required: [true, "Image of the artist is required and must be a string"],
        match: [
            "/^https?://[a-zA-Z0-9-._~:/?#[\\]@!$&'()*+,;=]+$/",
            "Invalid image URL. Must start with http:// or https://"
        ]
    },
    birthdate: {
        type: Date,
        required: [true, "Birthdate of the artist is required and must be a date"]
    },
    gender: {
        type: String,
        required: [true, "Gender of the artist is required and must be a string"],
        enum: {
            values: ["Male", "Female", "Non-Binary", "Other"],
            message: "Invalid gender. Must be one of: Male, Female, Non-Binary, Other"
        }
    }
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

app.delete("/artists/:id", async (request, response) => {
    const result = await Artist.deleteOne({ _id: request.params.id });
    response.json(result);
});
