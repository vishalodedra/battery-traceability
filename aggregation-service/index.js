const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

mongoose.connect(process.env.MONGO_URI + '/aggregation-db')
    .then(() => console.log("Aggregation DB connected"))
    .catch(err => console.error(err));

const AggregationSchema = new mongoose.Schema({
    parent: { type: String, unique: true },
    children: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});
const Aggregation = mongoose.model('Aggregation', AggregationSchema);

const app = express();
app.use(express.json());

// Validation middleware
function validateAggregationRequest(req, res, next) {
    const { cartonId, serials } = req.body;

    if (!cartonId) {
        return res.status(400).json({ error: 'Carton ID is required' });
    }

    if (typeof cartonId !== 'string') {
        return res.status(400).json({ error: 'Carton ID must be a string' });
    }

    if (cartonId.length > 50) {
        return res.status(400).json({ error: 'Carton ID is too long' });
    }

    if (!serials) {
        return res.status(400).json({ error: 'Serials array is required' });
    }

    if (!Array.isArray(serials)) {
        return res.status(400).json({ error: 'Serials must be an array' });
    }

    if (serials.length === 0) {
        return res.status(400).json({ error: 'Serials array cannot be empty' });
    }

    if (serials.length > 1000) {
        return res.status(400).json({ error: 'Too many serials in array' });
    }

    // Validate each serial number
    for (let i = 0; i < serials.length; i++) {
        const serial = serials[i];
        if (typeof serial !== 'string') {
            return res.status(400).json({ error: `Serial at index ${i} must be a string` });
        }

        if (serial.length > 50) {
            return res.status(400).json({ error: `Serial at index ${i} is too long` });
        }

        if (!/^[a-zA-Z0-9-_]+$/.test(serial)) {
            return res.status(400).json({ error: `Serial at index ${i} contains invalid characters` });
        }
    }

    next();
}

app.post('/aggregate', validateAggregationRequest, async (req, res) => {
    const { cartonId, serials } = req.body;

    try {
        // Check if carton already exists
        const existingAggregation = await Aggregation.findOne({ parent: cartonId });
        if (existingAggregation) {
            return res.status(409).json({ error: 'Carton ID already exists' });
        }

        // Validate that all serial numbers exist in serialization service
        const validationResults = [];
        for (const serial of serials) {
            try {
                const response = await axios.get(`http://serialization:${process.env.PORT_SERIALIZATION || 3001}/validate/${serial}`);
                if (!response.data.valid) {
                    return res.status(400).json({ error: `Serial ${serial} does not exist` });
                }
                validationResults.push(response.data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    return res.status(400).json({ error: `Serial ${serial} does not exist` });
                } else {
                    console.error(`Error validating serial ${serial}:`, err.message);
                    return res.status(500).json({ error: `Error validating serial ${serial}` });
                }
            }
        }

        // Create aggregation record
        const aggregation = await Aggregation.create({ parent: cartonId, children: serials });

        res.status(201).json({
            status: 'AGGREGATED',
            cartonId,
            aggregatedItems: serials.length,
            createdAt: aggregation.createdAt
        });
    } catch (err) {
        console.error('Aggregation error:', err);
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Duplicate carton ID' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get aggregation by carton ID
app.get('/aggregation/:cartonId', async (req, res) => {
    try {
        const { cartonId } = req.params;
        const aggregation = await Aggregation.findOne({ parent: cartonId });

        if (!aggregation) {
            return res.status(404).json({ error: 'Carton not found' });
        }

        res.json({
            cartonId: aggregation.parent,
            serials: aggregation.children,
            createdAt: aggregation.createdAt
        });
    } catch (err) {
        console.error('Error retrieving aggregation:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all aggregations with pagination
app.get('/aggregations', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const aggregations = await Aggregation.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Aggregation.countDocuments();

        res.json({
            aggregations: aggregations.map(a => ({
                cartonId: a.parent,
                itemCount: a.children.length,
                createdAt: a.createdAt
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Error retrieving aggregations:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(process.env.PORT_AGGREGATION || 3004, () => console.log(`Aggregation Service running on port ${process.env.PORT_AGGREGATION || 3004}`));
