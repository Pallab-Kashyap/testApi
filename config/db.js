// const { Pool } = require('pg')

// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'postgres',
//     password: 'postgresql',
//     port: 5432,
// })

// module.exports = pool;

const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres_nzy6_user',
    host: 'dpg-cqr45rrqf0us7394fes0-a.oregon-postgres.render.com',
    database: 'postgres_nzy6',
    password: 'GP9f2JP6q5m1DA0tONxPH6GhVcgv9Jb8',
    port: 5432,
})

// const connect = async() => {
//     await pool.connect()
//     .then( d => console.log('connectd'))
//     .catch(err => console.log(err))
// }
// connect()
module.exports = pool;