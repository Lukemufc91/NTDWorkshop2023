const express = require('express')
const app = express()
const port = 3000

let { getAllMovies, getMovieByTitle, getMoviesByDirector, getMoviesByRating } = require("./controllers/movieController")

app.get('/api/movies', getAllMovies)
app.get('/api/movies/title/:title', getMovieByTitle)
app.get('/api/movies/director/:director', getMoviesByDirector)
app.get('/api/movies/rating/:method/:rating', getMoviesByRating)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})