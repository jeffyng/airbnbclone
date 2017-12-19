const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cassandra = require('cassandra-driver');
const client = new cassandra.Client({ contactPoints: ['localhost'] });

const PORT = 3000;
const app = express();
var id = 10000000;
app.listen(3000, function() {
  console.log('listening on port 3000!');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Incoming GET request for all new listings:
	// Objects with properties city, availability (t/f), isinterior(t/f)
app.get('/getall', (req, res) => {
	res.sendFile(path.resolve('./listings.csv'), function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Sent listings.csv');
    }
  });
});

// Incoming POST request for new listings: 
	// Object with properties city, availability (t/f), isinterior(t/f)
// Response to POST request:
	// Save new listing to database
app.post('/newlisting', (req, res) => {
	const city = req.body.city;
	const availability = req.body.availability;
	const isinterior = req.body.isinterior;
	id = id + 1;
	client.execute(`insert into listings.listing2 (id, availability, isinterior, city) values (${id}, ${availability}, ${isinterior}, '${city}');`, function (err, result) {
	  if (err) throw err;
	  // console.log(result);
	});
	res.send('Saved new listing to database');
});

// Incoming PATCH request:
	// ListingID, Listing properties to change
// Response to PATCH request:
	// Update listing in database
app.patch('/updatelisting', (req, res) => {
	client.execute(`update listings.listing2 set ${(req.body.city === undefined) ? '' : `city = '${req.body.city}'`} ${ (req.body.availability === undefined) ? '' : `, availability = ${req.body.availability}`} ${ (req.body.isinterior === undefined) ? '' : `,isinterior = ${req.body.isinterior}`}  where id = ${req.body.id};`, function (err, result) {
	  if (err) throw err;
	  // console.log(result);
	});
	res.send('Updated listing');
});

module.exports = app;