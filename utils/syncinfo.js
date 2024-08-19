const axios = require('axios');
const { userSyncInfoQuery } = require('../dbQuery/user');
const schedule = require('node-schedule');
const pool = require('../config/db')


const scheduledJob = schedule.scheduleJob('46 19 * * *', async () => {
        try {
         const response = await fetch('https://www.osbornebooks.co.uk/api/publications', {
                        method: 'get',
                        headers: {
                                Authorization: `token ${process.env.OSBORNE_ADMIN_TOKEN}`
                        }
                }         
                )       
          } catch (error) {
                   console.error('Error making API call:', error);
                }
    console.log('Job ran at:');
});

scheduledJob.tz = 'Asia/Kolkata';


const syncInfo = async (username) => {
        await pool.query(userSyncInfoQuery, [username]);
}


module.exports = {
        scheduledJob,
        syncInfo,
}