const dotenv = require('dotenv')
dotenv.config()

const checkServerToken = (req, res, next) => {
    // const { server_token } = req.body;

    // if(!server_token) return res.status(400).send({message: 'server token required'})

    // if(server_token != process.env.SERVER_TOKEN) return res.send({status: false, message: 'invalid server token'})
    next()
}

module.exports = checkServerToken