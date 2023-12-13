// ========== IMPORTS ========== //
import cors from "cors";
import express from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "./db-connect.js";

// ========== APP SETUP ========== //
const app = express();
const port = process.env.SERVER_PORT || 3333;
app.use(express.json()); // to parse JSON bodies
app.use(cors()); // Enable CORS for all routes
const db = await getDatabase(); // Connect to the database

// ========== DATABASE SETUP ========== //
// Reset the existing "artists," "albums," and "songs" collections
// NOTE: This will delete all data in the database
const collections = (await db.listCollections().toArray()).map(collection => collection.name); // Get all collection names
if (collections.includes("artists")) await db.collection("artists").drop(); // Drop the "artists" collection if it exists
if (collections.includes("albums")) await db.collection("albums").drop(); // Drop the "albums" collection if it exists
if (collections.includes("songs")) await db.collection("songs").drop(); // Drop the "songs" collection if it exists

// Create the "artists" collection with a JSON Schema validator, ensuring that the documents adhere to specific constraints.
// MongoDB Schema Validation: https://www.w3schools.com/mongodb/mongodb_schema_validation.php
// https://www.mongodb.com/docs/manual/reference/operator/query/jsonSchema/
await db.createCollection("artists", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "genre", "image", "birthdate", "gender"],
            properties: {
                name: {
                    bsonType: "string",
                    description: "Name of the artist is required and must be a string",
                    minLength: 1,
                    maxLength: 255
                },
                genre: {
                    bsonType: "string",
                    description: "Genre of the artist is required and must be a string",
                    enum: ["Pop", "Rock", "Hip-Hop", "Country", "Other"]
                },
                image: {
                    bsonType: "string",
                    description: "Image of the artist is required and must be a string",
                    pattern: "^https?://[a-zA-Z0-9-._~:/?#[\\]@!$&'()*+,;=]+$"
                },
                birthdate: {
                    bsonType: "date",
                    description: "Birthdate of the artist is required and must be a date"
                },
                gender: {
                    bsonType: "string",
                    description: "Gender of the artist is required and must be a string",
                    enum: ["Male", "Female", "Non-Binary", "Other"]
                }
            }
        }
    }
});

try {
    // Taylor Swift
    const taylorResult = await db.collection("artists").insertOne({
        name: "Taylor Swift",
        genre: "Pop",
        image: "http://example.com/taylor_swift.jpg",
        birthdate: new Date("1989-12-13"),
        gender: "Female"
    });

    // 1989
    const album1989Result = await db.collection("albums").insertOne({
        artistId: taylorResult.insertedId,
        title: "1989",
        releaseDate: new Date("2014-10-27"),
        cover: "https://upload.wikimedia.org/wikipedia/en/f/f6/Taylor_Swift_-_1989.png"
    });

    // Fearless
    const albumFearlessResult = await db.collection("albums").insertOne({
        artistId: taylorResult.insertedId,
        title: "Fearless",
        releaseDate: new Date("2008-11-11"),
        cover: "https://upload.wikimedia.org/wikipedia/en/b/b8/Taylor_Swift_-_Fearless.png"
    });

    // Shake It Off
    db.collection("songs").insertOne({
        artistId: taylorResult.insertedId,
        albumId: album1989Result.insertedId,
        title: "Shake It Off",
        releaseDate: new Date("2014-08-18"),
        length: "00:03:39",
        position: 1
    });

    // Blank Space
    db.collection("songs").insertOne({
        artistId: taylorResult.insertedId,
        albumId: album1989Result.insertedId,
        title: "Blank Space",
        releaseDate: new Date("2014-11-10"),
        length: "00:03:51",
        position: 2
    });

    // Love Story
    db.collection("songs").insertOne({
        artistId: taylorResult.insertedId,
        albumId: albumFearlessResult.insertedId,
        title: "Love Story",
        releaseDate: new Date("2008-09-12"),
        length: "00:03:54",
        position: 1
    });
} catch (error) {
    console.log(JSON.stringify(error, null, 2));
}

// ========== START SERVER ========== //
app.listen(port, async () => {
    console.log(`App listening on http://localhost:${port}`);
});

// ========== ENDPOINTS ========== //

// GET Endpoint "/"
app.get("/", (request, response) => {
    response.send("Node Express Musicbase REST API");
});

// GET Endpoint "/artists" - get all artists
app.get("/artists", async (request, response) => {
    const artistsCollection = db.collection("artists");
    const artists = await artistsCollection.find().toArray(); // Use toArray() to retrieve documents as an array
    response.json(artists);
});

// GET Endpoint "/artists/:id" - get one artist
app.get("/artists/:id", async (request, response) => {
    const id = request.params.id;
    const artistsCollection = db.collection("artists");
    const artists = await artistsCollection.findOne({
        _id: new ObjectId(id)
    });
    response.json(artists);
});

// POST Endpoint "/artists" - create one artist
app.post("/artists", async (request, response) => {
    const artist = request.body;
    const result = await db.collection("artists").insertOne(artist);
    response.json(result);
});

// PUT Endpoint "/artists/:id" - update one artist
app.put("/artists/:id", async (request, response) => {
    const id = request.params.id;
    const artist = request.body;
    const result = await db.collection("artists").updateOne({ _id: new ObjectId(id) }, { $set: artist });
    response.json(result);
});

// DELETE Endpoint "/artists/:id" - delete one artist
app.delete("/artists/:id", async (request, response) => {
    const id = request.params.id;
    const result = await db.collection("artists").deleteOne({ _id: new ObjectId(id) });
    response.json(result);
});

// GET Endpoint "/artists/search?q=taylor" - get all artists
// Ex: http://localhost:3333/artists/search?q=cy
app.get("/artists/search", async (request, response) => {
    const searchString = request.query.q;

    const searchQuery = {
        name: {
            $regex: searchString, // Use the provided search string
            $options: "i" // Case-insensitive search
        }
    };

    const searchResult = await db.collection("artists").find(searchQuery).toArray();
    response.json(searchResult);
});

// GET Endpoint "/artists/:id/albums" - get all albums for one artist
app.get("/artists/:id/albums", async (request, response) => {
    const id = request.params.id;
    const results = await db
        .collection("albums")
        .find({ artistId: new ObjectId(id) })
        .toArray();

    response.json(results);
});

// POST Endpoint "/artists/:id/albums" - create an album for one artist
app.post("/artists/:id/albums", async (request, response) => {
    const id = request.params.id;
    const album = request.body;
    const result = await db.collection("albums").insertOne({ ...album, artistId: new ObjectId(id) });
    response.json(result);
});

// GET Endpoint "/artists/:id/songs" - get all songs for one artist
app.get("/artists/:id/songs", async (request, response) => {
    const id = request.params.id;
    const results = await db
        .collection("songs")
        .find({ artistId: new ObjectId(id) })
        .toArray();

    response.json(results);
});

// POST Endpoint "/artists/:id/songs" - create a song for one artist
app.post("/artists/:id/songs", async (request, response) => {
    const id = request.params.id;
    const song = request.body;
    const result = await db.collection("songs").insertOne({ ...song, artistId: new ObjectId(id) });
    response.json(result);
});

// GET Endpoint "/albums" - get all albums
app.get("/albums", async (request, response) => {
    const results = await db.collection("albums").find().toArray();

    response.json(results);
});

// GET Endpoint "/albums/songs" - get all albums with songs
app.get("/albums/songs", async (request, response) => {
    const results = await db
        .collection("albums")
        .aggregate([
            {
                $lookup: {
                    from: "songs",
                    localField: "_id",
                    foreignField: "albumId",
                    as: "songs"
                }
            }
        ])
        .toArray();

    response.json(results);
});

// GET Endpoint "/songs" - get all songs
app.get("/songs", async (request, response) => {
    const results = await db.collection("songs").find().toArray();
    response.json(results);
});

// GET Endpoint "/songs/artists" - get all songs with artist info
app.get("/songs/artists", async (request, response) => {
    const results = await db
        .collection("songs")
        .aggregate([
            {
                $lookup: {
                    from: "artists",
                    localField: "artistId",
                    foreignField: "_id",
                    as: "artist"
                }
            },
            {
                $unwind: "$artist"
            }
        ])
        .toArray();
    response.json(results);
});

// POST Endpoint "/songs" - create one song
app.post("/songs", async (request, response) => {
    const song = request.body;
    const result = await db.collection("songs").insertOne(song);
    response.json(result);
});

// PUT Endpoint "/songs/:id" - update one song
app.put("/songs/:id", async (request, response) => {
    const id = request.params.id;
    const song = request.body;
    const result = await db.collection("songs").updateOne({ _id: new ObjectId(id) }, { $set: song });
    response.json(result);
});

// DELETE Endpoint "/songs/:id" - delete one song
app.delete("/songs/:id", async (request, response) => {
    const id = request.params.id;
    const result = await db.collection("songs").deleteOne({ _id: new ObjectId(id) });
    response.json(result);
});
