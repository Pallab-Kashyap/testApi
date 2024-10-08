const pool = require("../config/db");
const { deviceCountQuery } = require("../dbQuery/user");
const jwt = require("jsonwebtoken");

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

//checking no of devices loged in
const deviceCount = async (req, res, next) => {
  const { username, deviceId } = req.body;

  if (!username) return res.send({ message: "all fields reqired" });
  console.log("username", username);

  try {
    //fetching user devices
    console.log("got req in devcount");
    const result = await pool.query(deviceCountQuery, [username]);

    //if user have device registered
    if (result.rows.length > 0) {
      console.log("have devices", result.rows.length);

      //chechking if user already registered with device id
      let deviceFound = false;
      for (const device of result.rows) {

        //if device id is already registered
        if (device.id === deviceId) {
          deviceFound = true;
          console.log("div === div");

          //cheaking if auth_token is still valid
          const authToken = await pool.query(
            `
            SELECT * FROM remoteusertoken
            WHERE username = $1 
            ORDER BY created_at ASC
            LIMIT 1
            `,
            [username]
          );

          if (authToken.rowCount > 0) {
            //if auth_token is expired, delete existing token and generate new token
            if (authToken.rows[0].time_expired <= new Date()){
              await pool.query(`
                DELETE FROM remoteusertoken
                WHERE id = $1
                `,[authToken.rows[0].id])
            return next();
            }
            //if auth_token is valid, generate new device token and send to client
            else{
              const deviceToken = jwt.sign({ username }, process.env.JWT_SECRET_KEY, {
                expiresIn: "7d",
              });
              try {
                  await pool.query(
                  `
                    UPDATE usertoken
                    SET value = $1
                    WHERE device_id = $2
                    AND username = $3
                  `,
                  [deviceToken, deviceId, username]
                );
                return res.send({ status: true , deviceToken: deviceToken });
              } catch (err) {
                console.log(err);
                return res.send({ status: false, message: "something went wrong" });
              }
            }
          }
          //if device is found but auth_token not found
          else{
            return res.send({status: false, message: 'incorrect username'})
          }
        }
      }

      //the device id didn't matched any devices stored in db
      console.log("no device found");
      //if user reaches device limit logingout earliest device
      if (!deviceFound) {
        //user reaches device limit delete earliest and create new
        if (result.rows.length >= 3) {
          await deleteEarliestDevice(username);
          console.log("next");
          next();
          return;
        } else {
          console.log("next");
          next();
          return;
        }
      }
    }
    //if user don't have any devices goes to register new device
    else {
      console.log("next");
      next();
      return;
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "internal server error" });
  }
};

module.exports = {
  deviceCount,
};
