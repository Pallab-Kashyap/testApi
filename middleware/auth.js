const pool = require('../config/db')
const { findAuthTokenQuery } = require('../dbQuery/user')
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {

    console.log('ent auth');
    const {authorization} = req.headers;

    if(authorization && authorization.startsWith('Bearer')){
            try{
                let token = authorization.split(' ')[1];
                
    
                const { username }  = jwt.verify(token, process.env.JWT_SECRET_KEY)
    
                 if(username){
                    console.log('USERNAME: ', username);
                    const user = await pool.query(`
                        SELECT * FROM usertoken
                        WHERE value = $1
                        `,[token])
                    
                    if(!(user.rows.length > 0)) return res.send({status: false, message: 'user not registered'})
                    const authToken = await pool.query(findAuthTokenQuery, [username])

                    if(authToken.rows.length > 0){
                        const exp = authToken.rows[0].time_expired
                        const currentTime = new Date();
                        req.authToken = authToken.rows[0].value
                        req.deviceToken = token
                        req.username = username

                        if(exp < currentTime){
                            return res.send({status: false, message: 'auth_token expired'})
                        }
                    }
                    else{
                      return res.send({status: false, message: 'auth token invalid'})
                    }
                 }
                 
                 console.log('ext auth');
                next()
            }
            catch(error){
                console.log(error);
                res.send({status: false, message: error})
            }
        }
        else{
            res.send({status: false, message: 'no token'})
        }
    }


module.exports = auth;