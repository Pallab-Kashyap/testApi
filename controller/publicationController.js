const { response } = require("express");
const axios = require("../config/axiosConfig")
const pool = require('../config/db');
const auth = require("../middleware/auth");

const fetchPublications = async (req,res)=>{
    const client = await pool.connect();

    const auth_token = req.authToken
    const username = req.username
    console.log('AUTH' , auth_token);
    try{
        const response = await fetch('https://www.osbornebooks.co.uk/api/publications', {
            method: 'get',
            headers: {
                Authorization: `token ${auth_token}`
            }
        })
        // const response = await axios({
        //     methord:'get',
        //     URL:'/publications',  // Endpoint URL (baseURL is already set)
        // })
        .then(response => response.json())
        .catch(err => {
            console.log(err);
            return res.send({message: 'something went wrong'})
        })
        // res.status(200).json(response.data);

        // console.log(response.results);
        await client.query('BEGIN')
        console.log(response);
        if(response.results.length > 0){
            const publicationValues = response.results.map(pub => [
                pub.urlId,
                pub.title,
                pub.description,
                pub.cover,
                pub.urlPath,
                new Date(pub.created_at * 1000).toISOString(),  
                new Date(pub.updated_at * 1000).toISOString(), 
                pub.metadata
              ]);
          
              // Upsert publications: Insert new ones or do nothing if they exist
              const insertPublicationsQuery = `
                INSERT INTO publication (url_id, title, description, cover_url, path_url, created_at, updated_at, metadata)
                VALUES
                ${publicationValues.map((_, i) => `($${i * 8 + 1}, $${i * 8 + 2}, $${i * 8 + 3}, $${i * 8 + 4}, $${i * 8 + 5}, $${i * 8 + 6}, $${i * 8 + 7}, $${i * 8 + 8})`).join(', ')} 
                ON CONFLICT (url_id) DO NOTHING
              `;
          
              const flatPublicationValues = publicationValues.flat();
              await client.query(insertPublicationsQuery, flatPublicationValues);
          
              // Prepare data for the publicationreader table
              const publicationReaderValues = response.results.map(pub => [
                username, pub.urlId
              ]);
          

              // Upsert into publicationreader table
              const insertPublicationReaderQuery = `
                INSERT INTO publicationreader (username, publication_id)
                VALUES
                ${publicationReaderValues.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(', ')}
                ON CONFLICT (username, publication_id) DO NOTHING
              `;
          
              const flatPublicationReaderValues = publicationReaderValues.flat();
              await client.query(insertPublicationReaderQuery, flatPublicationReaderValues);    
          
              await client.query('COMMIT');
              console.log('Publications stored and reader mappings updated successfully.');
              return res.send(response.results)

        }
        else{
            res.send({message: 'no publications found'})
        }
    }catch(err){
        await client.query('ROLLBACK');
        console.log(err);
        res.status(500).json({msg:'failed to fetch data'});
    }
    finally{
        client.release();
    }
}
const fetchSinglePublications =async (req,res)=>{
    const { id: publicationId } = req.params;
    
    try {
        // Query the database for publication details by ID
        const result = await pool.query(
            `SELECT id, title, description, 
                    EXTRACT(EPOCH FROM created_at) AS created_at, 
                    EXTRACT(EPOCH FROM updated_at) AS updated_at, 
                    cover_url AS "coverUrl", 
                    publication_url AS "publicationUrl", 
                    publication_store_url AS "publicationStoreUrl"
             FROM publications 
             WHERE id = $1`,
            [publicationId]
        );

        // Check if publication exists
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Publication not found' });
        }

        // Send the publication details as the response
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching publication details:', error);
        res.status(500).json({ error: 'Failed to fetch publication details' });
    }
}


module.exports = {
    fetchPublications,
    fetchSinglePublications
}