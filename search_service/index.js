// const apm = require('elastic-apm-node').start({
//   appName: 'search-service'
// });
const app = require('express')();
const elasticsearch = require('elasticsearch');
const axios = require('axios');
const bodyParser = require('body-parser');
const client = new elasticsearch.Client({
  host: 'localhost:9200'
});
const redisClient = require('redis').createClient();
const port = process.env.PORT || 3000;
const { 
  postClickToEvents , 
  postListingToEvents, 
  postListingToListings, 
  queue} = require('./requestHelpers/requestHelpers.js');

redisClient.on('error', function(err) {
  console.log('Redis Error: ' + err);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// Gets initial listings of searched city
//const cache = {};
app.get('/listings/search/:city', function(req, res) {
  const city = req.params.city;
  redisClient.get(city + '1', function(err, reply){
    if (err) {
      console.log('Redis get error: ' + err)
    } 
    if (reply) {
      res.json(JSON.parse(reply))
    } else {
      client.search({
        q: city,
        from: 0,
        size: 20
      })
      .then(function (body) {
        const hits = body.hits.hits;
        res.json({
          city: city,
          data: hits
        });
        var cacheValue = JSON.stringify({city: city, data: hits})
        redisClient.set(city + '1', cacheValue, 'EX', 60, function(err, reply){
          if(err) {
            console.log('Redis set erro: ', + err);
          }
        })
      })
      .catch(function (err) {
        console.log(err);
      });
    }
  })

 });

 // Gets listings for subsequent pages of previously searched city
app.get('/listings/search/:city/:pagenum', function(req, res) {
  const city = req.params.city;
  const pageNum = req.params.pagenum - 1;
  redisClient.get(city + pageNum, function(err, reply){
    if (err) {
      console.log('Redis get err: ', err) 
    }
    if (reply) {
      res.json(JSON.parse(reply))
    } else {
      client.search({
        q: city,
        from: pageNum,
        size: 20
      })
      .then(function (body) {
        var hits = body.hits.hits;
        res.json({
          city: city,
          data: hits
        })
        var cacheValue = JSON.stringify({city: city, data: hits});
        redisClient.set(city + pageNum, cacheValue, 'EX', 60, function(err, reply){
          if(err) {
            console.log('Redis set erro: ', + err);
          }
        })
      })
      .catch(function (err) {
        console.log(err);
      });
    }
  })

});

// Record click events and send to Events service
app.post('/listings/clicks', function (req, res) {
  const listingId = req.body.id;
  if (listingId) {
    //sends POST request to Events service
    postClickToEvents(listingId);
    res.sendStatus(204);
  } else {
    res.sendStatus(400);
  }
})

// Gets newly added listings and send to Listings and Events service
app.post('/listings/add', function (req, res) {
  const listingData = req.body;
  if (Object.keys(listingData).length && Object.keys(listingData).includes('id')) {
    // if (true) {
    res.sendStatus(201);
    // postListingToEvents(listingData);
    // postListingToListings(listingData);
    queue.add(listingData);
  } else {
    res.sendStatus(400);
  }
})

// Responding to any unhandled endpoints
app.use(function (req, res) {
  res.status(404).send("This is not the page you are looking for...")
})

// Any errors caught by express will be logged by apm agent 
//app.use(apm.middleware.express());

app.listen(port, function() {
  console.log('Server is running on port:', port);
});

module.exports = app;
