const axios = require('axios');

const axiosInstance = axios.create({
    basebaseURL: 'https://www.osbornebooks.co.uk',  // Base URL for all requests
    timeout: 5000,  // Set a timeout of 5 seconds
    headers: {
        'Content-Type': 'application/json',  // Default Content-Type
        // Add any other default headers you need
    },
    responseType: 'json',  // Expected response type
});

module.exports = axiosInstance;