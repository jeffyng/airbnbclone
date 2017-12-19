var server = require('supertest');
var should = require('chai').should();
var app = require('../Server/index.js');



//Integration tests using Supertest
describe("Post new listing", function() {
    it("should pass", function(done){
        server(app)
        .post('/newlisting', {city: 'London', availability: false, isinterior: false})
        .expect(200)
        .end(function(err, res) {
            if (err) return done(err);
            done();
        });
    });
});

describe("Update existing listing", function() {
    it("should pass", function(done){
        server(app)
        .patch('/updatelisting', {id: 1, city: 'London', availability: false, isinterior: true})
        .expect(200)
        .end(function(err, res) {
            if (err) return done(err);
            done();
        });
    });
});