require('newrelic');

var apm = require('elastic-apm-node').start({
  appName: 'Listings',
});

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const knex = require('../Database/generate.js');

const app = express();
const app1 = express();
const app2 = express();

// Add this to the VERY top of the first file loaded in your app

app.listen(3000, function() {
  console.log('listening on port 3000!');
});
app1.listen(3001, function() {
  console.log('listening on port 3001!');
});

app.use(apm.middleware.express());
// app.use(function (err, req, res, next) {
//   console.log('Error', err);
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app1.use(bodyParser.json());
app1.use(bodyParser.urlencoded({ extended: false }));

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

var rows1 = [];
var chunkSize = 1000;

app1.post('/newlisting', (req, res) => {
//Inserting posts every 500 ms
	rows.push({city: req.body.city, availability: req.body.availability, isinterior: req.body.isinterior});
	res.send('Saved new listing to database');
	setTimeout(function(){
		knex.transaction(function(tr) {
		  return knex.batchInsert('listings3', rows1, chunkSize)
		    .transacting(tr)
		  })
		  .then(function() {
		  	// console.log('Completed adding of 100,000 rows in App1');
		  	rows1 = [];
		  })
		  .catch(function(error) { console.log(error); });
	}, 1000);
});


var rows = [];
// Incoming POST request for new listings: 
	// Object with properties city, availability (t/f), isinterior(t/f)
// Response to POST request:
	// Save new listing to database
app.post('/newlisting', (req, res) => {

//Inserting posts in batches of 100,000 when average post/ second is pretty evenly distributed
	// if(rows.length < 100000) {
	// 	rows.push({city: req.body.city, availability: req.body.availability, isinterior: req.body.isinterior});
	// };

	// res.send('Saved new listing to database');
	// var chunkSize = 1000;
	// if(rows.length === 100000) {
	// 	knex.transaction(function(tr) {
	// 	  return knex.batchInsert('listings', rows, chunkSize)
	// 	    .transacting(tr)
	// 	  })
	// 	  .then(function() {
	// 	  	// console.log('Completed adding of 100,000 rows');
	// 	  	rows = [];
	// 	  })
	// 	  .catch(function(error) { console.log(error); });
	// }

//Inserting posts every 500 ms
	rows.push({city: req.body.city, availability: req.body.availability, isinterior: req.body.isinterior});
	res.send('Saved new listing to database');
	setTimeout(function(){
		knex.transaction(function(tr) {
		  return knex.batchInsert('listings3', rows, chunkSize)
		    .transacting(tr)
		  })
		  .then(function() {
			// console.log('Completed adding of 100,000 rows in App');
		  	rows = [];
		  })
		  .catch(function(error) { console.log(error); });
	}, 1000);

//Inserting post one by one
	// knex('listings3').insert({
	// 	'city': req.body.city,
	// 	'availability': req.body.availability,
	// 	'isinterior': req.body.isinterior,
	// })
	// .then(results => {
	// 	console.log(results);
	// })
	// .catch(err => {
	// 	console.log(err);
	// })
	// res.send('Saved new listing to database');
});

// Incoming PATCH request:
	// ListingID, Available(T/F)
// Response to PATCH request:
	// Update listing in database
app.patch('/updatelisting', (req, res) => {
	var obj = {};
	if (req.body.city) {
		obj.city = req.body.city;
	}
	if (req.body.availability) {
		obj.availability = req.body.availability;
	}
	if (req.body.isinterior) {
		obj.isinterior = req.body.isinterior;
	}
	knex('listings')
	.where('id', req.body.id)
	.update(obj)
	.then(results => {
		// console.log(results);
	});
	res.send('Updated listings in database');
});

module.exports = app;