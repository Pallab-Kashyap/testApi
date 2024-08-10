const pool = require('../config/db')
const { findAuthTokenQuery } = require('../dbQuery/user')
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {

    console.log('ent auth');
    const {authorization} = req.headers;

    if(authorization && authorization.startsWith('Bearer')){
            try{
                let token = authorization.split(' ')[1];
                const jwtSecret = 'aofeooieoeowjwoow'
    
                const { username }  = jwt.verify(token, jwtSecret)
    
                 if(username){
                    console.log('USERNAME: ', username);
                    const authToken = await pool.query(findAuthTokenQuery, [username])
                    if(authToken.rows.length > 0){
                        req.authToken = authToken.rows[0].value
                        req.deviceToken = token
                        req.username = username
                    }
                    else{
                      return res.send({message: 'auth token not found'})
                    }
                 }
                 
                 console.log('ext auth');
                next()
            }
            catch(error){
                res.send({status: 'failed', message: 'not a valid user'})
            }
        }
        else{
            res.send({status: 'failed', message: 'no token'})
        }
    }


module.exports = auth;