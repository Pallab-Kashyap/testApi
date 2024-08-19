// const addUserQuery = "INSERT INTO users (last_login, username, first_name, last_name, email, date_joined) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *"
const addUserQuery = "INSERT INTO users (username) VALUES ($1) RETURNING *"
const findUserQuery = "SELECT * FROM users WHERE username = $1"
const userTokenQuery = `INSERT INTO usertoken 
                        (value, username, time_created, time_expired, device_id)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (value) DO UPDATE SET
                            value = EXCLUDED.value,
                            username = EXCLUDED.username,
                            time_created = EXCLUDED.time_created,
                            time_expired = EXCLUDED.time_expired,
                            device_id = EXCLUDED.device_id
                          `
const deviceQuery = `INSERT INTO device 
                    (id, os_type, register_time, username)
                    VALUES ($1, $2, $3, $4) 
                    ON CONFLICT (id) DO UPDATE SET
                    register_time = EXCLUDED.register_time
                    `
const updateRemoteUserTokenQuery = "UPDATE remoteusertoken SET value = $1, time_expired = $2, username = $3 WHERE username = $4"
const remoteUserTokenQuery = "INSERT INTO remoteusertoken (value, time_expired, username) VALUES ($1, $2, $3)"
const clearRemoteTokenQuery = "DELETE FROM remoteusertoken WHERE username = $1" 
const userSyncInfoQuery = "INSERT INTO usersyncinfo (username) VALUES ($1)"
const deviceCountQuery = "SELECT * FROM device WHERE username = $1"
const findAuthTokenQuery = "SELECT * FROM remoteusertoken WHERE username = $1 ORDER BY created_at DESC LIMIT 1"

module.exports = {
    addUserQuery,
    findUserQuery,
    userTokenQuery,
    deviceQuery,
    updateRemoteUserTokenQuery,
    remoteUserTokenQuery,
    userSyncInfoQuery,
    deviceCountQuery,
    findAuthTokenQuery,
    clearRemoteTokenQuery,
}
