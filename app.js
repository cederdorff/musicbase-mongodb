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

// GET Endpoint "/"
app.get("/", (request, response) => {
    response.send("Node Express Musicbase REST API");
});

app.listen(port, async () => {
    console.log(`App listening on http://localhost:${port}`);
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
    const result = await db
        .collection("artists")
        .updateOne({ _id: new ObjectId(id) }, { $set: artist });
    response.json(result);
});

// DELETE Endpoint "/artists/:id" - delete one artist
app.delete("/artists/:id", async (request, response) => {
    const id = request.params.id;
    const result = await db
        .collection("artists")
        .deleteOne({ _id: new ObjectId(id) });
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

    const searchResult = await db
        .collection("artists")
        .find(searchQuery)
        .toArray();
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
    const result = await db
        .collection("albums")
        .insertOne({ ...album, artistId: new ObjectId(id) });
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
    const result = await db
        .collection("songs")
        .insertOne({ ...song, artistId: new ObjectId(id) });
    response.json(result);
});

// GET Endpoint "/albums" - get all albums
app.get("/albums", async (request, response) => {
    const results = await db.collection("albums").find().toArray();

    response.json(results);
});

// GET Endpoint "/albums/albums" - get all albums with songs
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
    const result = await db
        .collection("songs")
        .updateOne({ _id: new ObjectId(id) }, { $set: song });
    response.json(result);
});

// DELETE Endpoint "/songs/:id" - delete one song
app.delete("/songs/:id", async (request, response) => {
    const id = request.params.id;
    const result = await db
        .collection("songs")
        .deleteOne({ _id: new ObjectId(id) });
    response.json(result);
});
