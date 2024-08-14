const checkServerToken = (req, res, next) => {
    // const { server_token } = req.body;

    // if(!server_token) return res.status(400).send({message: 'server token required'})

    //verify token
    next()
}

module.exports = checkServerToken