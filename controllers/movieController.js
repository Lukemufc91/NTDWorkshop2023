const { response } = require("express");
let { fetchAllMovies, fetchMovieByTitle, fetchMoviesByDirector, fetchMoviesByRating } = require("../models/movieModel")

function isEmpty(entity) {
    if (typeof entity === "object")
        return Object.keys(entity).length === 0;
    else if (typeof entity === "array")
        return entity.length === 0;
    else if (entity === null|| entity === undefined)
        return true
}

const getAllMovies = (req, res) => {
    return res.send(fetchAllMovies());
}

const getMovieByTitle = (req, res) => {
    let { title } = req.params   
    let movie = fetchMovieByTitle(title)
    return !isEmpty(movie) ? res.send(movie) : res.status(200).send({error:`No movies exist by the title: ${title}`})
}

const getMoviesByDirector = (req, res) => {
    let { director } = req.params
    let movies = fetchMoviesByDirector(director)

    return !isEmpty(movies) ? res.send(movies) : res.status(200).send({error:`No movies exist by the director: ${director}`})
}

const getMoviesByRating = (req, res) => {
    let { method, rating } = req.params
    let movies = []
    try {
        movies = fetchMoviesByRating(method, rating)
    } catch (error) {
        return res.status(400).send({error: error.message})
    }
    return !isEmpty(movies) ? res.send(movies) : res.status(200).send({error: `No movies exist with a rating ${method} ${rating}`})
}

module.exports = { getAllMovies, getMovieByTitle, getMoviesByDirector, getMoviesByRating }