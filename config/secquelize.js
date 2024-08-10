const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgresql://postgres_nzy6_user:GP9f2JP6q5m1DA0tONxPH6GhVcgv9Jb8@dpg-cqr45rrqf0us7394fes0-a.oregon-postgres.render.com/postgres_nzy6') // Example for postgres

const checkConnection = async() => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}

// checkConnection();
// Option 1: Passing a connection URI
// const sequelize = new Sequelize('sqlite::memory:') // Example for sqlite

// // Option 2: Passing parameters separately (sqlite)
// const sequelize = new Sequelize({
    //   dialect: 'sqlite',
    //   storage: 'path/to/database.sqlite'
    // });
    
    // // Option 3: Passing parameters separately (other dialects)
    // const sequelize = new Sequelize('database', 'username', 'password', {
        //   host: 'localhost',
        //   dialect: /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
        // });

// const sequelize = new Sequelize('postgres_nzy6', 'postgres_nzy6_user', 'GP9f2JP6q5m1DA0tONxPH6GhVcgv9Jb8', {
//     host: 'dpg-cqr45rrqf0us7394fes0-a.oregon-postgres.render.com',
//     dialect: 'postgres',
//     port: 5432
//   });


// const { Client } = require('pg');

// const client = new Client({
//   host: 'dpg-cqr45rrqf0us7394fes0-a',
//   port: 5432, // default PostgreSQL port
//   user: 'postgres_nzy6_user',
//   password: 'GP9f2JP6q5m1DA0tONxPH6GhVcgv9Jb8',
//   database: 'postgres_nzy6',
// });

// client.connect()
//   .then(() => {
//     console.log('Connected to the database');
//     // return client.query('SELECT 1');
//   })
// //   .then(res => {
// //     console.log('Query result:', res.rows);
// //   })
//   .catch(err => {
//     console.error('Database connection error:', err.stack);
//   })
//   .finally(() => {
//     client.end();
//   });




// https://testapiserver.onrender.com/

const fn = async() => {
 const  res = await fetch('https://testapiserver.onrender.com/', {
    method: 'post',
    headers: {
      "content-type": "application/json",
    },

 })
//  .then(res => res.json())
 .then(res => console.log(res))
 .catch(err => console.log(err))
}

fn();