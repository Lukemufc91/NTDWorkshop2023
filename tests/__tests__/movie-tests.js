const {expect, describe, test} = require('@jest/globals')
const request = require("supertest")
const movies = require("../test_data/movies.json")

let baseUri = process.env.BASE_URI ?? "http://localhost"
let port = process.env.PORT ?? 3000

let testUri = port ? `${baseUri}:${port}` : baseUri

module.exports = {
	testEnvironment: "node",
}

describe("Movie API endpoint tests", () => {

    test("GET /api/movies", (done) => {
        request(testUri)
            .get('/api/movies')
            .expect(200)
            .expect((res) => {
                expect(res.body.length).toBeGreaterThan(1)
                expect(res.body).toEqual(movies)
            })
            .end((err, res) => {
                if (err) return done(err);
                return done();
            })
    })

    test("GET /api/movies/title/:title", (done) => {
        let title = "Lord of the Rings: The Two Towers"
        request(testUri)
            .get('/api/movies/title/' + encodeURI(title))
            .expect(200)
            .expect((res) => {
                expect(res.body.title).toBe(title)
                expect(res.body.rating).toBe(10)
                expect(res.body.certificate).toBe("12")
                expect(res.body.release_date).toBe(2002)
                expect(res.body.directed_by).toBe("Peter Jackson")
            })
            .end((err, res) => {
                if (err) return done(err);
                return done();
            })
    })

    test("GET /api/movies/director/:director", (done) => {
        let director = "Peter Jackson"
        request(testUri)
            .get("/api/movies/director/" + encodeURI(director))
            .expect(200)
            .expect((res) => {
                expect(res.body.length).toBe(3)
            })
            .end((err, res) => {
                if (err) return done(err);
                return done();
            })
    })

    test("GET /api/movies/rating/:method/:rating", (done) => {
        let method = "moreThanOrEqual"
        let rating = 8
        request(testUri)
            .get(`/api/movies/rating/${method}/${rating}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.length).toBe(7)
            })
            .end((err, res) => {
                if (err) return done(err);
                return done();
            })
    })
})
