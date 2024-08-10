const { addUserQuery,findUserQuery,userSyncInfoQuery,deviceQuery,userTokenQuery,remoteUserTokenQuery } = require('../dbQuery/user')
const pool = require('../config/db')
const jwt = require('jsonwebtoken');


const get_device_token = async (req, res) => {
    const client = await pool.connect();

    try{
    const { username, password, deviceId } = req.body;

    const credentials = `${username}:${password}`;

    const base64EncodedCredentials = Buffer.from(credentials).toString('base64');
    const authHeader = `Basic ${base64EncodedCredentials}`;
    
    // const axios = require('axios');
    
    // axios.get('api endpoint', {
    //   headers: {
    //     'Authorization': authHeader
    //   }
    // })
    // .then(async (response) => {
    // })
    // .catch(error => {
    //   console.error(error);
    // });

    const auth_token = 'authToken'
        

    const jwtSecret = 'aofeooieoeowjwoow'
    const deviceToken =  jwt.sign({username}, jwtSecret, {expiresIn: '7d'})

   const registerUserInfo = async () => {
    await client.query('BEGIN');

    const time = new Date().toISOString();
    const id = Math.floor(Math.random()*1000)

        //storing device
        await client.query(deviceQuery, [deviceId, 12, time, username]);
        console.log('1');
    //storing deviceToken(device_token)
    await client.query(userTokenQuery, [deviceToken, username, time, time, deviceId]);
    console.log('1');
    //storing remoteUserToken(auth_token)
    await client.query(remoteUserTokenQuery, [auth_token, time, username]);
    console.log('1');

    //storing userSyncInfo
    await client.query(userSyncInfoQuery, [id,time, username]);
    console.log('1');
    await client.query('COMMIT');
    console.log('Data updated successfully.');

    res.status(200).json({deviceToken: deviceToken})
   
   }


   if(auth_token){
    const user = await pool.query(findUserQuery, [username])
    if(user.rows.length > 0){
        registerUserInfo();
    }else{
        const user = await pool.query(addUserQuery, [username])
        if(user.rows.length === 0) return res.send({message: 'user already exist'})
        registerUserInfo();
    }
}


}catch(error){
    res.status(400).json({message: 'something went wrong'})
    console.log(error);
    // throw error
}finally {
    client.release(); 
  }
}

const logout = async (req, res) => {
    const client = await pool.connect()
    console.log('ent logout, connected client');

    const deviceToken = req.deviceToken
    const username = req.username


    try{
      console.log('ent try');
        await client.query('BEGIN');


    const userDevice = await client.query(`
    SELECT d.id AS device_id, u.value AS user_token_value, r.id AS remote_user_token_id
    FROM usertoken u
    JOIN device d ON d.id = u.device_name
    JOIN RemoteUserToken r ON r.username = u.username
    WHERE u.value = $1
    ORDER BY d.register_time ASC
    LIMIT 1
    `, [deviceToken]);

    console.log(userDeviceRes.rows);
    if (userDevice.rows.length === 0) {
       return res.send({message: 'device not found'})
    }

    const { device_id, remote_user_token_id } = userDevice.rows[0];


    // Delete from UserToken
    await client.query(`
      DELETE FROM UserToken
      WHERE value = $1
    `, [deviceToken]);

    //Delete from Device
    await client.query(`
      DELETE FROM Device
      WHERE id = $1
    `, [device_id]);


    //Delete from RemoteUserToken if no other devices
    
      await client.query(`
        DELETE FROM RemoteUserToken
        WHERE id = $1
      `, [remote_user_token_id]);
    

    // Clean up UserSyncInfo
    // await client.query(`
    //   DELETE FROM UserSyncInfo
    //   WHERE device_id = $1
    // `, [device_id]);

    await client.query('COMMIT');
    console.log('sent res success');
    res.json({message: `${username} with device ${device_id} logout`})

    }catch(error){
        console.log(error);
        res.send({message: 'something went wrong'})
        console.log('error');
    }
    finally{
        console.log('ext logout');
        client.release()
    }
}

module.exports = {
    get_device_token,
    logout
}