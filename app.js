const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const convertDbObjectToResponse = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor=
  };
};

const getDirectorFromDirectorTable=(dbObject)=>{
  return {
      directorId:dbObject.director_id,
      directorName:dbObject.director_name
  }
}

//GET list of all movie Names
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name
    FROM movie ;`;
  const movies = await db.all(getMoviesQuery);
  response.send(movies.map((movie) => convertDbObjectToResponseObject(movie)));
});

//POST a movie data
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
  INSERT INTO 
  movie (director_id,movie_name,lead_actor)
  VALUES
  (${directorId},'${movieName}','${leadActor}')`;

  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//GET movie by ID
app.get("/movies/:movieId/",async(request,response)=>{
    const {movieId}=request.params
    const getMovieByIdQuery=`
    SELECT *
    FROM movie
    WHERE movie_id=${movieId};`;
    const movie=await db.get(getMovieByIdQuery)
    response.send(convertDbObjectToResponse(movie))
});

//PUT method to update movie details
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
  UPDATE movie
  SET 
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE movie_id=${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete movie by ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie
    WHERE movie_id=${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//GET list of all directors
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT *
    FROM director ;`;
  const directors = await db.all(getDirectorQuery);
  response.send(directors.map((director) => getDirectorFromDirectorTable(director)));
});

// GET movie names of specific director
app.get("/directors/:directorId/movies/",async(request,response)=>{
    const {directorId}=request.params;
    const getMoviesOfDirectorQuery=`
    SELECT movie_name
    FROM director INNER JOIN movie
    WHERE director_id = ${directorId};`;
    const moviesNames=await db.all(getMoviesOfDirectorQuery);
    response.send(moviesNames)
});

module.exports=app