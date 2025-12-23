const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bwipjs = require('bwip-js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/barcode-db')
    .then(() => console.log("Barcode DB connected"))
    .catch(err => console.error(err));

const BarcodeSchema = new mongoose.Schema({
    gs1: String,
    status: String,
    imagePath: String
});

const Barcode = mongoose.model('Barcode', BarcodeSchema);

const app = express();

// CORS configuration to allow requests from frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // In production, specify your frontend domain
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

// Validation middleware
function validateGS1(req, res, next) {
    const { gs1 } = req.body;

    if (!gs1) {
        return res.status(400).json({ error: 'GS1 data is required' });
    }

    if (typeof gs1 !== 'string') {
        return res.status(400).json({ error: 'GS1 data must be a string' });
    }

    if (gs1.length > 100) {
        return res.status(400).json({ error: 'GS1 data is too long' });
    }

    next();
}

app.post('/print', validateGS1, async (req, res) => {
    const { gs1 } = req.body;

    // Even shorter filename using last 4 digits of timestamp
    const timestamp = Date.now().toString().slice(-4);
    const filename = `b${timestamp}.png`;
    const filepath = path.join(__dirname, 'images', filename);

    try {
        const png = await bwipjs.toBuffer({
            bcid: 'code128',
            text: gs1,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: 'center'
        });

        fs.writeFileSync(filepath, png);

        // Check if a barcode already exists for this GS1 value
        const existingBarcode = await Barcode.findOne({ gs1 });

        let barcode;
        if (existingBarcode) {
            // Update the existing barcode
            barcode = await Barcode.findByIdAndUpdate(existingBarcode._id,
                { status: 'PRINTED', imagePath: filename },
                { new: true }
            );
        } else {
            // Create a new barcode record
            barcode = await Barcode.create({ gs1, status: 'PRINTED', imagePath: filename });
        }

        // Extract serial number from GS1 and update its status in serialization service
        // Assuming GS1 format: (01)GTIN(21)SERIAL(BATCH)(EXPIRY)
        const serialMatch = gs1.match(/\(21\)([^\(]+)/);
        if (serialMatch && serialMatch[1]) {
            const serial = serialMatch[1];
            try {
                // Update serial status to PRINTED
                await axios.patch(`http://serialization:${process.env.PORT_SERIALIZATION || 3001}/status/${serial}`, {
                    status: 'PRINTED'
                });
            } catch (updateErr) {
                console.error('Failed to update serial status:', updateErr.message);
                // Don't fail the barcode generation if status update fails
            }
        }

        res.json({ status: 'PRINTED', imageUrl: `https://barcode-4o85.onrender.com/images/${barcode.imagePath}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate barcode' });
    }
});

// Endpoint to get barcode by serial number
app.get('/barcode/:serial', async (req, res) => {
    try {
        const { serial } = req.params;
        console.log('Fetching barcode for serial:', serial);

        // Find barcode by extracting serial from GS1 field
        const barcode = await Barcode.findOne({
            gs1: { $regex: `\\(21\\)${serial}` }
        });

        console.log('Found barcode:', barcode);

        if (!barcode) {
            // Let's also try to find any barcode that contains the serial
            const alternativeBarcode = await Barcode.findOne({
                gs1: { $regex: serial }
            });

            console.log('Alternative search result:', alternativeBarcode);

            if (!alternativeBarcode) {
                return res.status(404).json({ error: 'Barcode not found' });
            }

            return res.json({
                imageUrl: `https://barcode-4o85.onrender.com/images/${alternativeBarcode.imagePath}`,
                status: alternativeBarcode.status
            });
        }

        res.json({
            imageUrl: `https://barcode-4o85.onrender.com/images/${barcode.imagePath}`,
            status: barcode.status
        });
    } catch (err) {
        console.error('Error fetching barcode:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get barcode by GS1 serial number
app.get('/by-gs1', async (req, res) => {
    try {
        const { gs1 } = req.query;

        if (!gs1) {
            return res.status(400).json({ error: 'GS1 parameter is required' });
        }

        console.log('Fetching barcode for GS1:', gs1);

        // Find the most recent barcode by GS1 field
        const barcode = await Barcode.findOne({ gs1: gs1 }).sort({ _id: -1 });

        console.log('Found barcode:', barcode);

        if (!barcode) {
            return res.status(404).json({ error: 'Barcode not found' });
        }

        res.json({
            imageUrl: `https://barcode-4o85.onrender.com/images/${barcode.imagePath}`,
            status: barcode.status
        });
    } catch (err) {
        console.error('Error fetching barcode:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get all barcodes (for debugging)
app.get('/barcodes', async (req, res) => {
    try {
        const barcodes = await Barcode.find({});
        res.json(barcodes);
    } catch (err) {
        console.error('Error fetching barcodes:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(process.env.PORT_BARCODE || 3002, () => console.log('Barcode Service running'));
