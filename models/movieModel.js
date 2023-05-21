const movieData = require("../data/movies.json");

const fetchAllMovies = () => movieData

const fetchMovieByTitle = (movieTitle) => {
    return movieData.find((movie) => movie.title === movieTitle)
}

const fetchMoviesByRating = (method, rating) => {
    switch(method) {
        case "lessThanOrEqual":
            return movieData.filter((movie) => {
                return movie.rating <= rating
            })
        case "moreThanOrEqual":
            return movieData.filter((movie) => {
                return movie.rating >= rating
            })
        case "equalTo":
            return movieData.filter((movie) => {
                return movie.rating === rating
            })
        default:
            throw new Error(`${method} is not one the the accepted methods: [lessThanOrEqual, moreThanOrEqual, equalTo]`)
    }
}

const fetchMoviesByDirector = (directed_by) => {
    return movieData.filter((movie) => {
        return movie.directed_by === directed_by
    })
}

module.exports = { fetchAllMovies, fetchMovieByTitle, fetchMoviesByDirector, fetchMoviesByRating }