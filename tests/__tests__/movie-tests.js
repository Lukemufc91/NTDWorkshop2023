const {expect, describe, test} = require('@jest/globals')
const request = require("supertest")
const movies = require("../test_data/movies.json")

let baseUri = process.env.BASE_URI ?? "http://localhost"
let port = process.env.PORT

let testUri = port ? `${baseUri}:${port}` : baseUri

console.log(`BaseUri: ${baseUri}, Port: ${port}, TestUri:${testUri}`)

module.exports = {
	testEnvironment: "node",
}

describe("Movie API endpoint tests", () => {

    test("GET /api/movies", () => {
        request(testUri)
            .get('/api/movies')
            .end((err, res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.length).toBeGreaterThan(1)
                expect(res.body).toEqual(movies)
            })
    })

    test("GET /api/movies/title/:title", () => {
        let title = "Lord of the Rings: The Two Towers"
        request(testUri)
            .get('/api/movies/title/' + encodeURI(title))
            .end((err, res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.title).toBe(title)
                expect(res.body.rating).toBe(10)
                expect(res.body.certificate).toBe("12")
                expect(res.body.release_date).toBe(2002)
                expect(res.body.directed_by).toBe("Peter Jackson")
            })
    })

    test("GET /api/movies/director/:director", () => {
        let director = "Peter Jackson"
        request(testUri)
            .get("/api/movies/director/" + encodeURI(director))
            .end((err, res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.length).toBe(3)
            })
    })

    test("GET /api/movies/rating/:method/:rating", () => {
        let method = "moreThanOrEqual"
        let rating = 8
        request(testUri)
            .get(`/api/movies/rating/${method}/${rating}`)
            .end((err, res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.length).toBe(7)
            })
    })
})
