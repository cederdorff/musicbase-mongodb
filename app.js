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
    const artistsCollection = db.collection("artists");
    const artists = await artistsCollection.find().toArray(); // Use toArray() to retrieve documents as an array
    response.json(artists);
});

app.post("/artists", async (request, response) => {
    const artist = request.body;
    const db = await getDatabase();
    const result = await db.collection("artists").insertOne(artist);
    response.json(result);
});

app.put("/artists/:id", async (request, response) => {
    const id = request.params.id;
    const artist = request.body;
    const db = await getDatabase();
    const result = await db
        .collection("artists")
        .updateOne({ _id: new ObjectId(id) }, { $set: artist });
    response.json(result);
});

app.delete("/artists/:id", async (request, response) => {
    const id = request.params.id;
    const db = await getDatabase();
    const result = await db
        .collection("artists")
        .deleteOne({ _id: new ObjectId(id) });
    response.json(result);
});

app.post("/artists/:id/albums", async (request, response) => {
    const id = request.params.id;
    const album = request.body;
    const db = await getDatabase();
    const result = await db
        .collection("artists")
        .updateOne(
            { _id: new ObjectId(id) },
            { $push: { albums: album } }
        );
    response.json(result);
});

// GET Endpoint "/artists/search?q=taylor" - get all artists
// Ex: http://localhost:3333/artists/search?q=cy
app.get("/artists/search", async (request, response) => {
    const searchString = request.query.q;
    const db = await getDatabase();
    const artistsCollection = db.collection("artists");

    const searchQuery = {
        name: {
            $regex: searchString, // Use the provided search string
            $options: "i" // Case-insensitive search
        }
    };

    const searchResult = await artistsCollection
        .find(searchQuery)
        .toArray();
    response.json(searchResult);
});

// GET Endpoint "/artists/:id" - get one artist
app.get("/artists/:id", async (request, response) => {
    const id = request.params.id;
    const db = await getDatabase();
    const artistsCollection = db.collection("artists");
    const artists = await artistsCollection.findOne({
        _id: new ObjectId(id)
    });
    response.json(artists);
});

// GET Endpoint "/artists/:id" - get one artist
app.get("/artists/:id/albums", async (request, response) => {
    const id = request.params.id;

    const db = await getDatabase();

    const results = await db
        .collection("artists")
        .aggregate([
            { $match: { _id: new ObjectId(id) } },
            { $unwind: "$albums" },
            {
                $project: {
                    _id: 0,
                    artist: "$name",
                    album: "$albums.title",
                    releaseDate: "$albums.releaseDate"
                }
            }
        ])
        .toArray();

    response.json(results);
});

app.get("/albums", async (request, response) => {
    const db = await getDatabase();

    const results = await db
        .collection("artists")
        .aggregate([
            {
                $unwind: "$albums"
            },
            {
                $project: {
                    _id: 0,
                    artist: "$name",
                    title: "$albums.title",
                    releaseDate: "$albums.releaseDate",
                    cover: "$albums.cover",
                    songs: "$albums.songs"
                }
            }
        ])
        .toArray();

    response.json(results);
});

app.get("/songs", async (request, response) => {
    const db = await getDatabase();

    const results = await db
        .collection("artists")
        .aggregate([
            {
                $unwind: "$albums"
            },
            {
                $unwind: "$albums.songs"
            },
            {
                $project: {
                    _id: 0,
                    artist: "$name",
                    albumTitle: "$albums.title",
                    albumCover: "$albums.cover",
                    songTitle: "$albums.songs.title",
                    songReleaseDate: "$albums.songs.releaseDate",
                    songLength: "$albums.songs.length",
                    songPosition: "$albums.songs.position"
                }
            }
        ])
        .toArray();

    response.json(results);
});
