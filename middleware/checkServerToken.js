const checkServerToken = (req, res, next) => {
    // const { server_token } = req.body;

    // if(!server_token) return res.status(400).send({message: 'server token required'})

    //verify token
    const serverToken = "masServer864token147";

    // if(server_token != serverToken) return res.send({status: false, message: 'invalid server token'})
    next()
}

module.exports = checkServerToken