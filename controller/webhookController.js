const pool = require("../config/db");
const dotenv = require('dotenv');
const { syncInfo } = require("../utils/syncinfo");
dotenv.config()

//UPDATE_USER
//DONE
const removeUserAuthToken = async (req, res) => {
  const client = await pool.connect();
  const { username } = req.body;
  try {
    await client.query("BEGIN");

    //delete usertoken
    await client.query(
      `
            DELETE FROM usertoken
            WHERE username = $1
            `,
      [username]
    );

    //delete remoteusertoken
    await client.query(
      `
            DELETE FROM remoteusertoken
            WHERE username = $1
            `,
      [username]
    );

    //delete device
    await client.query(
      `
            DELETE FROM device
            WHERE username = $1
            `,
      [username]
    );

    await client.query("COMMIT");
    console.log("Data updated successfully.");
    res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.json({ message: "failed" });
  } finally {
    client.release();
  }
};
//DONE
const deleteUser = async (req, res) => {
  const { username } = req.body;

  try {
    await pool.query(
      `
            DELETE FROM users
            WHERE username = $1
            `,
      [username]
    );

    res.send({ message: "user deleted" });
  } catch (error) {
    console.log(error);
    res.send({ message: "something went wrong" });
  }
};


//UPDATE_USER_PUBLICATION
//DONE
const updateUserPublication = async (req, res) => {
  const { username } = req.body;

  if (!username) return res.send({ message: "username required" });

  try {
    const auth_token = await pool.query(
      `
            SELECT value FROM remoteusertoken
            WHERE username = $1
            `,
      [username]
    );

    //TODO: if user auth token is expired get new auth token but how
    if (auth_token.rows.length === 0) {
      return res.json({ message: "user doesn't have a valid auth_token" });
    }

    req.authToken = auth_token.rows[0].value;
    req.username = username

    fetchSinglePublications(req, res)

  } catch {
    console.log(error);
    res.send({ message: "something went wrong" });
  }
};
//DONE
const deletePublicationForUser = async (req, res) => {
    const { username, publication_id } = req.body;
    if(!username || !publication_id) return res.send({status: false, message: 'username and publication_id required'})
        try{
  const deleteQuery = `
    DELETE FROM publicationreader
    WHERE username = $1 AND publication_id = $2;
    `;
    await pool.query(deleteQuery, [username, publication_id]);

    res.send({status: true, message: `publication ${publication_id} is deleted for ${username}`})

  }catch(err){
    res.send({status: false, message: err})
  }
};


//UPDATE_PUBLICATION
//DONE
const updatePublication = async (req, res) => {
    const { publication_id } = req.body;
  
    if (!publication_id)
      return res.status(400).json({ message: "publication_id required" });

    try{
    const osboneResponse= await fetch (`https://www.osbornebooks.co.uk/api/publications/${publicationId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `token ${process.env.OSBORNE_ADMIN_TOKEN}`
        },
      })
      
      if (!osboneResponse.ok) {
        console.error('Error fetching from Osbone server:', osboneResponse.statusText);
        return res.status(404).json({ error: "Book not found on Osbone server" });
      }

      const osboneData = await osboneResponse.json();
      console.log(osboneData);
      // const osbonePublication = osboneData.results[0];
      const insertResult = await pool.query(
        `INSERT INTO publication(url_id ,title , description , cover_url , path_url , created_at , updated_at)
        VALUES ($1, $2, $3, $4, $5, to_timestamp($6), to_timestamp($7))
        RETURNING url_id, title, description,
          cover_url AS "coverUrl",
          path_url AS "pathUrl",
          EXTRACT(EPOCH FROM created_at) AS created_at, 
          EXTRACT(EPOCH FROM updated_at) AS updated_at
          `,
        [
          osboneData.urlId,
           osboneData.title,
           osboneData.description,
           osboneData.coverUrl,
           osboneData.urlPath,
           osboneData.created_at,
           osboneData.updated_at,
        ]
      );

      res.send({status: true, message: `publication ${publication_id} updated`})
    }catch(err){
      console.log(err);
      res.send({status: false, message: err})
    }
  
    
};
//DONE
const deletePublication = async (req, res) => {

    const {publication_id} = req.body

    if(!publication_id) return res.send({status: false, message: 'publication_id required'})

    try{
        const deleteQuery = `
          DELETE FROM publication
          WHERE url_id = $1;
          `;
          await pool.query(deleteQuery, [publication_id]);
      
          res.send({status: true, message: `publication ${publication_id} is deleted`})
      
        }catch(err){
          res.send({status: false, message: err})
        }
}

const fetchSinglePublications =async (req,res)=>{
  const { publication_id: publicationId } = req.body;
  const auth_token = req.authToken;
 const username = req.username;

  try {
    // check if book is present in table
    const bookCheckResult = await pool.query(
      `SELECT url_id FROM publication WHERE  url_id = $1`,
      [publicationId]
    );

    //book not found in MAS DB
    if (bookCheckResult.rows.length === 0) {
      console.log("book not found");
      console.log("fetching from Osbone server...");

      const osboneResponse= await fetch (`https://www.osbornebooks.co.uk/api/publications/${publicationId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `token ${auth_token}`
          },
        })
        
        if (!osboneResponse.ok) {
          console.error('Error fetching from Osbone server:', osboneResponse.statusText);
          return res.status(404).json({ error: "Book not found on Osbone server" });
        }

        const osboneData = await osboneResponse.json();
        console.log(osboneData);
        // const osbonePublication = osboneData.results[0];
        const insertResult = await pool.query(
          `INSERT INTO publication(url_id ,title , description , cover_url , path_url , created_at , updated_at)
          VALUES ($1, $2, $3, $4, $5, to_timestamp($6), to_timestamp($7))
          RETURNING url_id, title, description,
            cover_url AS "coverUrl",
            path_url AS "pathUrl",
            EXTRACT(EPOCH FROM created_at) AS created_at, 
            EXTRACT(EPOCH FROM updated_at) AS updated_at
            `,
          [
            osboneData.urlId,
             osboneData.title,
             osboneData.description,
             osboneData.coverUrl,
             osboneData.urlPath,
             osboneData.created_at,
             osboneData.updated_at,
          ]
        );

        const publication = insertResult.rows[0];
        console.log('hereeeeeeeeeeeeeeee');
        // Insert data into publicationreader table
        await pool.query(
          `INSERT INTO publicationreader (username, publication_id, updated_at)
           VALUES ($1, $2, to_timestamp($3)) 
           ON CONFLICT (username, publication_id) 
           DO UPDATE SET updated_at = EXCLUDED.updated_at`,
           [ username , publication.url_id , Date.now() / 1000]
        );

      return res.status(200).json({status: true, message: "success"});
    }

    //book found in MAS DB
    await pool.query(
      `INSERT INTO publicationreader (username, publication_id)
       VALUES ($1, $2)
        ON CONFLICT (username, publication_id) 
        DO NOTHING`,
       [ username , bookCheckResult.rows[0].url_id]
    );

  // Check if publication exists
    await syncInfo(username)
    res.send({status: true, message: `user ${username} now have access to publication ${publicationId}`})

  } catch (error) {
      console.error('Error fetching publication details:', error);
      res.status(500).json({ error: 'Failed to fetch publication details' });
  }
}

module.exports = {
  removeUserAuthToken,
  deleteUser,
  updateUserPublication,
  updatePublication,
  deletePublicationForUser,
  deletePublication,
};
