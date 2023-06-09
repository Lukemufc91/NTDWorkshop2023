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
})