const express = require('express');
const mongoose = require('mongoose');
const { generateGS1 } = require('./shared/gs1-utils');

mongoose.connect(process.env.MONGO_URI + '/serial-db')
    .then(() => console.log("Serialization DB connected"))
    .catch(err => console.error(err));

const SerialSchema = new mongoose.Schema({
    gtin: String,
    serial: { type: String, unique: true },
    batch: String,
    mfgDate: Date,
    expiryDate: Date,
    gs1: String,
    status: { type: String, default: 'GENERATED' }
});

const Serial = mongoose.model('Serial', SerialSchema);

async function getNextSerialNumber() {
    try {
        const allSerials = await Serial.find({}, 'serial');

        let maxSerial = 0;

        for (const serialRecord of allSerials) {
            const serialNum = parseInt(serialRecord.serial.replace(/[^0-9]/g, ''));
            if (!isNaN(serialNum) && serialNum > maxSerial) {
                maxSerial = serialNum;
            }
        }

        const nextSerial = maxSerial > 0 ? maxSerial + 1 : 10000001;

        return nextSerial.toString();
    } catch (err) {
        console.error('Error getting next serial number:', err);
        return '10000001';
    }
}

const app = express();
app.use(express.json());

function validateSerialRequest(req, res, next) {
    const { gtin, batch, mfgDate, expiryDate } = req.body;

    if (!gtin) {
        return res.status(400).json({ error: 'GTIN is required' });
    }

    if (!batch) {
        return res.status(400).json({ error: 'Batch is required' });
    }

    if (!mfgDate) {
        return res.status(400).json({ error: 'Manufacturing date is required' });
    }

    if (!expiryDate) {
        return res.status(400).json({ error: 'Expiry date is required' });
    }

    const mfg = new Date(mfgDate);
    const exp = new Date(expiryDate);

    if (isNaN(mfg.getTime())) {
        return res.status(400).json({ error: 'Invalid manufacturing date format' });
    }

    if (isNaN(exp.getTime())) {
        return res.status(400).json({ error: 'Invalid expiry date format' });
    }

    if (mfg >= exp) {
        return res.status(400).json({ error: 'Manufacturing date must be before expiry date' });
    }

    next();
}

app.post('/generate', validateSerialRequest, async (req, res) => {
    const { gtin, batch, mfgDate, expiryDate } = req.body;

    try {
        const serial = await getNextSerialNumber();
        const gs1 = generateGS1(gtin, serial, batch, new Date(mfgDate), new Date(expiryDate));

        const newSerial = await Serial.create({ gtin, serial, batch, mfgDate, expiryDate, gs1 });
        res.json({ serial, gs1 });
    } catch (err) {
        console.error('Error generating serial:', err);
        res.status(500).json({ error: 'Failed to generate serial number' });
    }
});

app.get('/validate/:serial', async (req, res) => {
    const { serial } = req.params;

    if (!serial) {
        return res.status(400).json({ error: 'Serial number is required' });
    }

    try {
        const serialRecord = await Serial.findOne({ serial });
        if (!serialRecord) {
            return res.status(404).json({ valid: false, error: 'Serial not found' });
        }

        res.json({
            valid: true,
            serial: serialRecord.serial,
            batch: serialRecord.batch,
            expiryDate: serialRecord.expiryDate,
            gtin: serialRecord.gtin
        });
    } catch (err) {
        console.error('Validation error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/stats', async (req, res) => {
    try {
        const stats = await Serial.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        let generated = 0;
        let printed = 0;
        let scanned = 0;

        stats.forEach(stat => {
            switch (stat._id) {
                case 'GENERATED':
                    generated = stat.count;
                    break;
                case 'PRINTED':
                    printed = stat.count;
                    break;
                case 'SCANNED':
                    scanned = stat.count;
                    break;
            }
        });

        res.json({
            generated,
            printed,
            scanned,
            total: generated + printed + scanned,
            pending: generated + printed
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.patch('/status/:serial', async (req, res) => {
    const { serial } = req.params;
    const { status } = req.body;

    if (!serial) {
        return res.status(400).json({ error: 'Serial number is required' });
    }

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['GENERATED', 'PRINTED', 'SCANNED'];
    if (!validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid status. Must be one of: GENERATED, PRINTED, SCANNED' });
    }

    try {
        const currentRecord = await Serial.findOne({ serial });

        if (!currentRecord) {
            return res.status(404).json({ error: 'Serial not found' });
        }

        const currentStatus = currentRecord.status.toUpperCase();
        const newStatus = status.toUpperCase();

        if (!isValidStatusTransition(currentStatus, newStatus)) {
            return res.status(400).json({
                error: `Invalid status transition from ${currentStatus} to ${newStatus}. Valid transitions are: GENERATED -> PRINTED -> SCANNED`
            });
        }

        const serialRecord = await Serial.findOneAndUpdate(
            { serial },
            { status: newStatus },
            { new: true }
        );

        if (!serialRecord) {
            return res.status(404).json({ error: 'Serial not found' });
        }

        res.json({
            success: true,
            serial: serialRecord.serial,
            status: serialRecord.status
        });
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function isValidStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
        'GENERATED': ['PRINTED'],
        'PRINTED': ['SCANNED'],
        'SCANNED': []
    };

    // If current status is not in our defined transitions, allow any (for backward compatibility)
    if (!validTransitions[currentStatus]) {
        return true;
    }

    // Check if the new status is in the list of allowed transitions
    return validTransitions[currentStatus].includes(newStatus);
}

// Endpoint to get all serial numbers with details
app.get('/all', async (req, res) => {
    try {
        const serials = await Serial.find({});
        res.json(serials);
    } catch (err) {
        console.error('Error fetching all serials:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/test', (req, res) => res.json({ message: 'Test endpoint working' }));

app.get('/health', (req, res) => res.send('OK'));

app.listen(process.env.PORT_SERIALIZATION || 3001, () => console.log('Serialization Service running'));
