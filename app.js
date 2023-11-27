// ========== IMPORTS ========== //
import express from "express";
import cors from "cors";
import dbConnection from "./db-connect.js";

// ========== APP SETUP ========== //
const app = express();
const port = process.env.SERVER_PORT || 3333;
app.use(express.json()); // to parse JSON bodies
app.use(cors());

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
});

// ========== REST ENDPOINTS ========== //

// GET Endpoint "/"
app.get("/", (request, response) => {
    response.send("Node Express Musicbase REST API");
});

// GET Endpoint "/artists" - get all artists
app.get("/artists", (request, response) => {
    const queryString = /*sql*/ `
    SELECT * 
    FROM artists ORDER BY name;`;

    dbConnection.query(queryString, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            response.json(results);
        }
    });
});

// GET Endpoint "/artists/search?q=taylor" - get all artists
app.get("/artists/search", (request, response) => {
    const query = request.query.q.toLocaleLowerCase();
    const queryString = /*sql*/ `
    SELECT * 
    FROM artists
    WHERE name LIKE ?
    ORDER BY name`;
    const values = [`%${query}%`];
    dbConnection.query(queryString, values, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            response.json(results);
        }
    });
});

// GET Endpoint "/artists/:id" - get one artist
app.get("/artists/:id", (request, response) => {
    const id = request.params.id;
    const queryString = /*sql*/ `
    SELECT * 
    FROM artists WHERE id=?;`; // sql query
    const values = [id];

    dbConnection.query(queryString, values, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            response.json(results[0]);
        }
    });
});

// GET Endpoint "/artists/:id" - get one artist
app.get("/artists/:id/albums", (request, response) => {
    const id = request.params.id;

    const queryString = /*sql*/ `
    SELECT * FROM artists, albums 
    WHERE artist_id=? AND
    albums.artist_id = artists.id
    ORDER BY albums.title;`; // sql query

    const values = [id];

    dbConnection.query(queryString, values, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            response.json(results);
        }
    });
});

// GET Endpoint "/songs" - get all songs
app.get("/songs", (request, response) => {
    const queryString = /*sql*/ `
        SELECT * FROM artists, songs
        WHERE songs.artist_id = artists.id
        ORDER BY artists.name;`;

    dbConnection.query(queryString, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            response.json(results);
        }
    });
});

// GET Endpoint "/songs/:id" - get one song
app.get("/songs/:id", (request, response) => {
    const id = request.params.id;
    const queryString = /*sql*/ `
        SELECT * FROM artists, songs
            WHERE songs.artist_id = artists.id
            && songs.id=?;`; // sql query
    const values = [id];

    dbConnection.query(queryString, values, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            response.json(results[0]);
        }
    });
});

// GET Endpoint "/albums" - get all albums
app.get("/albums", (request, response) => {
    const queryString = /*sql*/ `
        SELECT * FROM artists, albums
        WHERE albums.artist_id = artists.id
        ORDER BY albums.title;
    `;
    dbConnection.query(queryString, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            response.json(results);
        }
    });
});

// GET Endpoint "/albums/:id" - get one album with songs
app.get("/albums/:id", (request, response) => {
    const id = request.params.id;
    const queryString = /*sql*/ `
        SELECT
            albums.title AS albumTitle,
            songs.id AS songId,
            songs.title AS songTitle,
            songs.length,
            songs.release_date AS releaseDate,
            songs_on_albums.position
        FROM albums
        JOIN songs_on_albums
            ON albums.id = songs_on_albums.album_id
        JOIN songs
            ON songs.id = songs_on_albums.song_id
        WHERE albums.id = ?
        ORDER BY albums.title, songs_on_albums.position;`;
    const values = [id];

    dbConnection.query(queryString, values, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            if (results[0]) {
                const album = {
                    title: results[0].albumTitle,
                    songs: results.map(song => {
                        return {
                            id: song.songId,
                            title: song.songTitle,
                            length: song.length,
                            releaseDate: song.releaseDate,
                            position: song.position
                        };
                    })
                };
                response.json(album);
            } else {
                response.json({ message: "No album found" });
            }
        }
    });
});
