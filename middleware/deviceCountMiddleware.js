const pool = require('../config/db')
const { deviceCountQuery } = require('../dbQuery/user')



const deleteEarliestDevice = async (username) => {
    const client = await pool.connect();
  
    try {

      await client.query('BEGIN');
  
      // Find the earliest device
      const earliestDevice = await client.query(`
        SELECT d.id AS device_id, u.value AS user_token_value, r.id AS remote_user_token_id
        FROM Device d
        JOIN UserToken u ON u.device_name = d.id
        JOIN RemoteUserToken r ON r.username = d.username
        WHERE d.username = $1
        ORDER BY d.register_time ASC
        LIMIT 1
      `, [username]);
  
      if (earliestDevice.rows.length === 0) {
        return res.send({message: 'hit device limit but no device found'})
      }
  
      const { device_id, user_token_value, remote_user_token_id } = earliestDevice.rows[0];
  
      //Delete from UserToken
      await client.query(`
        DELETE FROM usertoken
        WHERE value = $1
      `, [user_token_value]);
  
      // Delete from Device
      await client.query(`
        DELETE FROM device
        WHERE id = $1
      `, [device_id]);
  
      //Delete from RemoteUserToken
      await client.query(`
        DELETE FROM remoteusertoken
        WHERE id = $1
      `, [remote_user_token_id]);
  

      await client.query('COMMIT');
    } catch (error) {

      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };


  const deviceCount = async (req, res, next) => {

    const {username} = req.body

    try{
        const result = await pool.query(deviceCountQuery, [username])
        if(result.rows[0].device_count >= 3){
            deleteEarliestDevice(username)
        }
        next();
    }
    catch(error){
        console.log(error);
    }
}




module.exports ={
    deviceCount,
    
} 