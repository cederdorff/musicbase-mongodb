// ========== IMPORTS ========== //
import cors from "cors"; // Enable cross-origin resource sharing for API requests
import express from "express"; // Create an Express application for handling HTTP requests
import { ObjectId } from "mongodb"; // Handle MongoDB's unique ObjectID data type
import { getDatabase } from "./db-connect.js"; // Load database connection function

// ========== APP SETUP ========== //
const app = express(); // Create an Express application instance
const port = process.env.SERVER_PORT || 3333; // Set the port if not defined in environment variable

app.use(express.json()); // Parse JSON data from requests
app.use(cors()); // Enable CORS for all routes

const db = await getDatabase(); // Connect to the MongoDB database

// GET Endpoint "/"
app.get("/", (request, response) => {
    response.send("Node Express Musicbase REST API"); // Send a welcome message
});

app.listen(port, async () => {
    console.log(`App listening on http://localhost:${port}`); // Log the application's listening port
});

// GET Endpoint "/artists" - Get all artists
app.get("/artists", async (request, response) => {
    const artists = await db.collection("artists").find().toArray(); // Retrieve all artists from the 'artists' collection
    response.json(artists); // Send the retrieved artists as JSON to the client
});

// GET Endpoint "/artists/:id" - Get one artist by ID
app.get("/artists/:id", async (request, response) => {
    const id = request.params.id; // Extract the artist ID from the URL path
    const artist = await db.collection("artists").findOne({
        _id: new ObjectId(id)
    }); // Retrieve the artist with the specified ID
    response.json(artist); // Send the retrieved artist as JSON to the client
});

// POST Endpoint "/artists" - Create a new artist
app.post("/artists", async (request, response) => {
    const artist = request.body; // Retrieve the artist data from the request body
    const result = await db.collection("artists").insertOne(artist); // Insert the artist document into the 'artists' collection
    response.json(result); // Send the insertion result as JSON to the client
});

// PUT Endpoint "/artists/:id" - Update an artist by ID
app.put("/artists/:id", async (request, response) => {
    const id = request.params.id; // Extract the artist ID from the URL path
    const artist = request.body; // Retrieve the updated artist data from the request body
    const result = await db.collection("artists").updateOne({ _id: new ObjectId(id) }, { $set: artist }); // Update the artist document with the provided data
    response.json(result); // Send the update result as JSON to the client
});

// DELETE Endpoint "/artists/:id" - Delete an artist by ID
app.delete("/artists/:id", async (request, response) => {
    const id = request.params.id; // Extract the artist ID from the URL path
    const result = await db.collection("artists").deleteOne({ _id: new ObjectId(id) }); // Delete the artist document with the specified ID
    response.json(result); // Send the deletion result as JSON to the client
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
    const result = await db.collection("songs").updateOne({ _id: new ObjectId(id) }, { $set: song });
    response.json(result);
});

// DELETE Endpoint "/songs/:id" - delete one song
app.delete("/songs/:id", async (request, response) => {
    const id = request.params.id;
    const result = await db.collection("songs").deleteOne({ _id: new ObjectId(id) });
    response.json(result);
});
