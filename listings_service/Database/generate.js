const knex = require('knex')({
    client: 'postgresql',
    connection: {
        database: 'listings',
        // user:     'christinayu',
        // user:     'christinayu',
    },
    debug: false,
})
// // using faker
// const faker = require('faker');
// // const bookshelf = require('bookshelf')(knex);

// knex.raw('CREATE DATABASE listings')

// async function main() {

    //test connection
    // await knex.raw('select 1+1 as result');
    // console.log("valid db connection");

    // delete data
    // await knex('listings').del();
    // const res = await knex('listings');
    // if (res.length === 0) {         
    //     console.log("Content of listings table deleted");
    // } else {
    //     console.log(res);
    // }

    // insert 10 million new entries
    // const dataAmount = 10000000;
    // console.log(`lets insert ${dataAmount} rows of data`);
    // for (let index = 0; index < dataAmount; index++) {
    //     try {
    //         await knex('listings').insert({
    //             id: index+1,
    //             availability: faker.random.boolean(),
    //             isinterior: faker.random.boolean(),
    //             city: faker.address.city()
    //         });
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
    // console.log('Completed');

// }

// main().then().catch(err => console.error(err));

module.exports = knex;