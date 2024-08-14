const pool = require('../config/db');

const removeUserAuthToken = async(req, res) => {
    const client = await pool.connect();
    const { username } = req.body
    try{
        await client.query('BEGIN')

        //delete usertoken
        await client.query(`
            DELETE FROM usertoken
            WHERE username = $1
            `,[username])

        //delete remoteusertoken
        await client.query(`
            DELETE FROM remoteusertoken
            WHERE username = $1
            `,[username])

        //delete device
        await client.query(`
            DELETE FROM device
            WHERE username = $1
            `,[username])

            await client.query('COMMIT');
            console.log('Data updated successfully.');
            res.send({message: 'success'})
    }
    catch(error){
        console.log(error);
        res.json({message: 'failed'})
    }
    finally{
        client.release()
    }
}


const deleteUser = async(req, res) => {
    const { username } = req.body

    try{
        await pool.query(`
            DELETE FROM users
            WHERE username = $1
            `, [username])

            res.send({message: 'user deleted'})
    }catch(error){
        console.log(error);
        res.send({message: 'something went wrong'})
    }
}


const updateUserPublication = async(req, res) => {
    const { username } = req.body

    if(!username) return res.send({message: 'username required'})

    try{
        const auth_token = await pool.query(`
            SELECT value FROM remoteusertoken
            WHERE username = $1
            `, [username])

        if(auth_token.rows.length === 0){
           return res.json({message: "user doesn't have a valid auth_token"})
        }

        const authToken = auth_token.rows[0].value


        res.send({message: 'success', authToken: authToken})
    }catch{
        console.log(error);
        res.send({message: 'something went wrong'})
    }
}

const updatePublication = async(req, res) => {
    const { publication_id } = req.body;

    if(!publication_id) return res.status(400).json({message: 'publication_id required'})

    
    //fetch puclication
    //save publication

    res.send({message: 'success'})
}

module.exports = {
    removeUserAuthToken,
    deleteUser,
    updateUserPublication,
    updatePublication,
}