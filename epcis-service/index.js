const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT_EPCIS || 3008;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // In production, specify your frontend domain
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Create uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || path.extname(file.originalname) === '.json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed!'), false);
    }
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/batterytraceability');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB for EPCIS service');
});

// EPCIS Document Schema - using mixed type to accept any structure
const epcisDocumentSchema = new mongoose.Schema({}, { strict: false });

const EPCISDocument = mongoose.model('EPCISDocument', epcisDocumentSchema);

// Helper function to clean up the JSON data
const cleanEPCISData = (data) => {
  const cleaned = JSON.parse(JSON.stringify(data));

  // Clean up prefixes and special keys
  const removePrefixes = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(removePrefixes);
    }

    const cleanedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const cleanKey = key.replace(/^_+/, ''); // Remove leading underscores

        // Handle special case for objects with __text property
        if (typeof obj[key] === 'object' && obj[key] !== null && obj[key].hasOwnProperty('__text')) {
          cleanedObj[cleanKey] = obj[key].__text;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          cleanedObj[cleanKey] = removePrefixes(obj[key]);
        } else {
          cleanedObj[cleanKey] = obj[key];
        }
      }
    }
    return cleanedObj;
  };

  return removePrefixes(cleaned);
};

// Routes
app.get('/health', (req, res) => {
  res.send('EPCIS Service is running');
});

// Get all EPCIS documents
app.get('/epcis-documents', async (req, res) => {
  try {
    const documents = await EPCISDocument.find({});
    res.json(documents);
  } catch (err) {
    console.error('Error fetching EPCIS documents:', err);
    res.status(500).json({ error: 'Failed to fetch EPCIS documents' });
  }
});

// Get a specific EPCIS document by ID
app.get('/epcis-documents/:id', async (req, res) => {
  try {
    const document = await EPCISDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'EPCIS document not found' });
    }
    res.json(document);
  } catch (err) {
    console.error('Error fetching EPCIS document:', err);
    res.status(500).json({ error: 'Failed to fetch EPCIS document' });
  }
});

// Import EPCIS data from uploaded file
app.post('/import-epcis-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fs = require('fs');
    const path = require('path');

    // Read the uploaded file
    const rawData = fs.readFileSync(req.file.path, 'utf8');
    const epcisData = JSON.parse(rawData);

    // Clean the data
    const cleanedData = cleanEPCISData(epcisData.EPCISDocument);

    // Check if data already exists by checking if any documents exist
    const documentCount = await EPCISDocument.countDocuments();

    if (documentCount > 0) {
      // Optionally clear existing data or return error
      await EPCISDocument.deleteMany({});
    }

    // Save to MongoDB
    const document = new EPCISDocument(cleanedData);
    const savedDocument = await document.save();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'EPCIS data imported successfully from file',
      document: savedDocument
    });
  } catch (err) {
    console.error('Error importing EPCIS data from file:', err);
    res.status(500).json({ error: 'Failed to import EPCIS data from file', details: err.message });
  }
});

// Get all EPCs (individual items) from all documents
app.get('/epcs', async (req, res) => {
  try {
    const documents = await EPCISDocument.find({});
    const epcs = [];

    documents.forEach(doc => {
      if (doc.EPCISBody && doc.EPCISBody.EventList && doc.EPCISBody.EventList.ObjectEvent) {
        doc.EPCISBody.EventList.ObjectEvent.forEach(event => {
          if (event.epcList && event.epcList.epc) {
            event.epcList.epc.forEach(epc => {
              epcs.push({
                epc: epc,
                lotNumber: event.extension?.ilmd?.lotNumber,
                expirationDate: event.extension?.ilmd?.itemExpirationDate,
                productionDate: event.extension?.ilmd?.itemProductionDate,
                SKU: event.SKU,
                packsize: event.packsize
              });
            });
          }
        });
      }
    });

    res.json(epcs);
  } catch (err) {
    console.error('Error fetching EPCs:', err);
    res.status(500).json({ error: 'Failed to fetch EPCs' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`EPCIS Service running on port ${PORT}`);
});