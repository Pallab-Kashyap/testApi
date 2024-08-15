const {
  addUserQuery,
  findUserQuery,
  userSyncInfoQuery,
  clearRemoteTokenQuery,
  updateRemoteUserTokenQuery,
  deviceQuery,
  userTokenQuery,
  remoteUserTokenQuery,
} = require("../dbQuery/user");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const { stat } = require("fs");
const { STATUS_CODES } = require("http");
const Buffer = require("buffer").Buffer;


const registerUserInfo = async (res, username, expire, deviceId, auth_token) => {
  const client = await pool.connect();

  try{
  const jwtSecret = "aofeooieoeowjwoow";
  const deviceToken = jwt.sign({ username }, jwtSecret, {
    expiresIn: "7d",
  });

  await client.query("BEGIN");

  const date = new Date(expire * 1000);
  const id = Math.floor(Math.random() * 1000);

  // Convert to ISO 8601 string (timestamptz format)
  const time = date.toISOString();

  //storing device
  await client.query(deviceQuery, [deviceId, 12, time, username]);
  console.log("1");
  //storing deviceToken(device_token)
  await client.query(userTokenQuery, [
    deviceToken,
    username,
    time,
    time,
    deviceId,
  ]);
  console.log("1");
  // clearing expiredToken(auth_token)
  await client.query(remoteUserTokenQuery, [auth_token, time, username]);
  //storing remoteUserToken(auth_token)
  await client.query(updateRemoteUserTokenQuery, [
    auth_token,
    time,
    username,
    username,
  ]);
  console.log("1");
  //storing userSyncInfo
  // await client.query(userSyncInfoQuery, [id,time, username]);
  // console.log('1');

  await client.query("COMMIT");
  console.log("Data updated successfully.");

  return res.status(200).json({status: true, deviceToken: deviceToken });
}catch(error){
  console.log(error);
  return res.send({status: false, message: error})
}
finally{
  client.release()
}
};

const get_device_token = async (req, res) => {
  const client = await pool.connect();
  const { username, password, deviceId } = req.body;
  const credentials = `${username}:${password}`;
  const base64EncodedCredentials = Buffer.from(credentials).toString("base64");
  const authHeader = `Basic ${base64EncodedCredentials}`;

  try {
    const result = await fetch(
      "https://www.osbornebooks.co.uk/api/get_auth_token",
      {
        method: "get",
        headers: {
          Authorization: authHeader,
        },
      }
    )
      .then((result) => result.json())
      .catch((err) => {
        console.log(err);
        return res.send({ message: "osborne err" });
      });

    if (result.token === null) {
      return res.send({ status: false, message: "wrong credentials" });
    }

    const auth_token = result.token;
    const expire = result.expired;

    if (auth_token) {
      const user = await pool.query(findUserQuery, [username]);
      if (user.rows.length > 0) {
        registerUserInfo(res, username, expire, deviceId, auth_token);
      } else {
        const user = await pool.query(addUserQuery, [username]);
        if (user.rows.length === 0)
          return res.send({ message: "something went wrong" });
        registerUserInfo(res, username, expire, deviceId, auth_token);
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "something went wrong" });
    // throw error
  } finally {
    client.release();
  }
};

const logout = async (req, res) => {
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith("Bearer")) {
    let deviceToken = authorization.split(" ")[1];
    const jwtSecret = "aofeooieoeowjwoow";

    const { username } = jwt.verify(deviceToken, jwtSecret);

    if (!username) return res.send({ message: "invalid device token" });

    const client = await pool.connect();
    console.log("ent logout, connected client");

    try {
      console.log("ent try");
      await client.query("BEGIN");

      const userDevice = await client.query(
        `
    SELECT d.id AS device_id, u.value AS user_token_value, r.id AS remote_user_token_id
    FROM usertoken u
    JOIN device d ON d.id = u.device_id
    JOIN RemoteUserToken r ON r.username = u.username
    WHERE u.value = $1
    ORDER BY d.register_time ASC
    LIMIT 1
    `,
        [deviceToken]
      );

      // console.log(userDevice.rows);
      if (userDevice.rows.length === 0) {
        return res.send({ message: "device not found" });
      }

      const { device_id, remote_user_token_id } = userDevice.rows[0];

      // Delete from UserToken
      await client.query(
        `
      DELETE FROM UserToken
      WHERE value = $1
    `,
        [deviceToken]
      );

      //Delete from Device
      await client.query(
        `
      DELETE FROM Device
      WHERE id = $1
    `,
        [device_id]
      );

      //Delete from RemoteUserToken if no other devices

      await client.query(
        `
        DELETE FROM RemoteUserToken
        WHERE id = $1
      `,
        [remote_user_token_id]
      );

      // Clean up UserSyncInfo
      // await client.query(`
      //   DELETE FROM UserSyncInfo
      //   WHERE device_id = $1
      // `, [device_id]);

      await client.query("COMMIT");
      console.log("sent res success");
      return res.json({
        message: `${username} with device ${device_id} logout`,
      });
    } catch (error) {
      console.log(error);
      return res.send({ message: "something went wrong" });
    } finally {
      console.log("ext logout");
      client.release();
    }
  }
};



module.exports = {
  get_device_token,
  logout,
};
