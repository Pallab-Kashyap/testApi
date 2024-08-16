const cron = require('node-cron');
const axios = require('axios');

// cron.schedule('0 9 * * *', async () => {
//   try {
//     const response = await axios.get('https://api.example.com/endpoint');
        //if(response) db query
//   } catch (error) {
//     console.error('Error making API call:', error);
//   }
// }, {
//   timezone: "America/New_York"
// });

// console.log('Scheduled task to run at 9:00 AM every day');