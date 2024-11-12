const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

async function sendToWebhook(data, url, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.post(url, data, {
                headers: { 'Content-Type': 'text/html' },
                timeout: 10000, // Increased timeout
            });
            return response;
        } catch (error) {
            console.error(`Attempt ${attempt} failed: ${error.message}`);
            if (error.response) {
                console.error(`Webhook Error Response Data: ${JSON.stringify(error.response.data)}`);
            }
            if (attempt === retries) throw error; // Throw after max retries
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
}

app.post('/send-webhook', async (req, res) => {
    const webhookUrl = 'https://webhook.site/fdda8c1b-e6bc-4b35-86b1-184e49c77a86';

    try {
        const requestData = { ...req.body, uniqueId: Date.now() }; // Unique identifier for each request
        console.log('Request Data:', requestData); // Log the request data
        const response = await sendToWebhook(requestData, webhookUrl);
        res.status(200).json({
            message: 'Data sent to webhook successfully',
            data: response.data,
        });
    } catch (error) {
        if (error.response) {
            console.error('Webhook Error Response:', error.response.data);
            res.status(500).json({
                message: 'Failed to send data to webhook',
                error: error.response.data,
            });
        } else if (error.request) {
            console.error('No response received:', error.request);
            res.status(500).json({
                message: 'Failed to send data to webhook',
                error: 'No response received from webhook',
            });
        } else {
            console.error('Request Error:', error); // Log full error object
            res.status(500).json({
                message: 'Failed to send data to webhook',
                error: error.message || 'Unknown error',
            });
        }
    }
});


app.listen(PORT, () => {
    console.log(`Node server is running on http://localhost:${PORT}`);
});