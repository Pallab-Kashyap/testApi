const checkServerToken = (req, res, next) => {
    // const {Authorization} = req.headers

    // const server_token = abc;
    // if(Authorization && Authorization.startsWith('token')){
    //     const serverToken = Authorization.split(' ')[1];

    //     if(serverToken){
    //         if(serverToken === server_token){
    //             next();
    //         }
    //         else{
    //             res.send({status: false, message: 'wrong server token'})
    //         }
    //     }else{
    //         res.send({status: false, message: 'server_token needed'})
    //     }
    // }else{
    //     return res.send({status: false, message: 'server_token needed'})
    // }


    next()
}

module.exports = checkServerToken