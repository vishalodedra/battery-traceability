const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Validation middleware
function validatePushRequest(req, res, next) {
    const payload = req.body;

    if (!payload) {
        return res.status(400).json({ status: 'FAILED', error: 'Payload is required' });
    }

    // Validate payload structure
    if (typeof payload !== 'object' || Array.isArray(payload)) {
        return res.status(400).json({ status: 'FAILED', error: 'Payload must be an object' });
    }

    next();
}

// Retry function for external API calls
async function postWithRetry(url, data, options, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${maxRetries} to send data to external system`);
            const response = await axios.post(url, data, options);
            return response;
        } catch (err) {
            lastError = err;
            console.error(`Attempt ${attempt} failed:`, err.message);

            // Don't retry on client errors (4xx)
            if (err.response && err.response.status >= 400 && err.response.status < 500) {
                throw err;
            }

            // Wait before retry (exponential backoff)
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

app.post('/push', validatePushRequest, async (req, res) => {
    const payload = req.body;

    // Add request ID for tracing
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        console.log(`[${requestId}] Sending payload to external system`, payload);

        // Configure timeout and retry settings
        const axiosOptions = {
            timeout: 10000, // 10 second timeout
            headers: {
                'Content-Type': 'application/json',
                'X-Request-ID': requestId
            }
        };

        const response = await postWithRetry(
            process.env.EXTERNAL_API || 'https://external-endpoint/api',
            payload,
            axiosOptions
        );

        console.log(`[${requestId}] External system response`, {
            status: response.status,
            statusText: response.statusText
        });

        res.json({
            status: 'POSTED',
            requestId,
            externalStatus: response.status
        });
    } catch (err) {
        console.error(`[${requestId}] Error sending to external system:`, err.message);

        // Provide more detailed error information
        if (err.response) {
            // Server responded with error status
            res.status(502).json({
                status: 'FAILED',
                error: 'External system error',
                externalStatus: err.response.status,
                requestId
            });
        } else if (err.request) {
            // Request was made but no response received
            res.status(504).json({
                status: 'FAILED',
                error: 'External system unreachable',
                requestId
            });
        } else {
            // Other error
            res.status(500).json({
                status: 'FAILED',
                error: 'Internal error',
                requestId
            });
        }
    }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(process.env.PORT_INTEGRATION || 3005, () => console.log(`Integration Service running on port ${process.env.PORT_INTEGRATION || 3005}`));
