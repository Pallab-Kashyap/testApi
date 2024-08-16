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
const dotenv = require('dotenv')
dotenv.config()

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
})




// pool.connect()
//     .then(() => console.log('connected pg'))
//     .catch((err) => console.log(err))

// const connect = async() => {
//     await pool.connect()
//     .then( d => console.log('connectd'))
//     .catch(err => console.log(err))
// }
// connect()
module.exports = pool;