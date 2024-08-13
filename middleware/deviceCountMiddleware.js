const { logger } = require("sequelize/lib/utils/logger");
const pool = require("../config/db");
const { deviceCountQuery } = require("../dbQuery/user");
const jwt = require('jsonwebtoken');
const { cloneDeep } = require("sequelize/lib/utils");

const deleteEarliestDevice = async (username) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Find the earliest device
    const earliestDevice = await client.query(
      `
        SELECT d.id AS device_id, u.value AS user_token_value, r.id AS remote_user_token_id
        FROM Device d
        JOIN UserToken u ON u.device_id = d.id
        JOIN RemoteUserToken r ON r.username = d.username
        WHERE d.username = $1
        ORDER BY d.register_time ASC
        LIMIT 1
      `,
      [username]
    );

    if (earliestDevice.rows.length === 0) {
      return res.send({ message: "hit device limit but no device found" });
    }

    const { device_id, user_token_value, remote_user_token_id } = earliestDevice.rows[0];

    //Delete from UserToken
    await client.query(
      `
        DELETE FROM usertoken
        WHERE value = $1
      `,
      [user_token_value]
    );

    // Delete from Device
    await client.query(
      `
        DELETE FROM device
        WHERE id = $1
      `,
      [device_id]
    );

    //Delete from RemoteUserToken
    await client.query(
      `
        DELETE FROM remoteusertoken
        WHERE id = $1
      `,
      [remote_user_token_id]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const deviceCount = async (req, res, next) => {
  const { username, deviceId } = req.body;

  if (!username) return res.send({ message: "all fields reqired" });

  try {

    //fetching user devices
    const result = await pool.query(deviceCountQuery, [username]);
console.log('got result');

    //if user have device registered
    if (result.rows.length > 0) {
console.log('have devices', result.rows.length);
      //chechking if user already registered with device id
      let deviceFound = false;
      for (const device of result.rows) {
        if (device.id === deviceId) {

          deviceFound = true;
          console.log('device id matched');
          const jwtSecret = "aofeooieoeowjwoow";
          const deviceToken = jwt.sign({ username }, jwtSecret, {
            expiresIn: "7d",
          });
          try {
            const result = await pool.query(
              `
                UPDATE usertoken
                SET value = $1
                WHERE device_id = $2
                AND username = $3
              `,
              [deviceToken, deviceId, username]
            );
            if (result.rows)
              console.log('sent res');
              return res.send({ message: "success", deviceToken: deviceToken });
          } catch (err) {
              console.log(err);
              return res.send({ message: "something went wrong" });
          }
        }
      };
      //the device id didn't matched any device stored in db
console.log('no device found');
      //if user reaches device limit logingout earliest device
      if(!deviceFound){
      if (result.rows.length >= 3) {
        await deleteEarliestDevice(username);
       console.log('next');
        next();
        return;
      }
      else{
        console.log('next');
        next();
        return;
      }
    } 
  }
    //if user don't have any devices goes to register new device
    else {
      console.log('next');
      next();
      return;
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({message: 'internal server error'})
  }
};

module.exports = {
  deviceCount,
};
