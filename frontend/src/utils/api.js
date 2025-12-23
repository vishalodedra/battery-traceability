import axios from 'axios';

// Base URLs for different services (using proxy paths in development, actual URLs in production)
const API_BASE_URLS = {
    serialization: process.env.NODE_ENV === 'development'
        ? '/api/serialization'
        : process.env.REACT_APP_SERIALIZATION_API_URL || 'https://battery-traceability.onrender.com',
    barcode: process.env.NODE_ENV === 'development'
        ? '/api/barcode'
        : process.env.REACT_APP_BARCODE_API_URL || 'https://barcode-4o85.onrender.com',
    inspection: process.env.NODE_ENV === 'development'
        ? '/api/inspection'
        : process.env.REACT_APP_INSPECTION_API_URL || 'https://inspection-zj0k.onrender.com',
    aggregation: process.env.NODE_ENV === 'development'
        ? '/api/aggregation'
        : process.env.REACT_APP_AGGREGATION_API_URL || 'https://aggregation01.onrender.com',
    epcis: process.env.NODE_ENV === 'development'
        ? '/api/epcis'
        : process.env.REACT_APP_EPCIS_API_URL || 'https://epics-l152.onrender.com'
};

// Create axios instances for each service
const serializationAPI = axios.create({
    baseURL: API_BASE_URLS.serialization
});

const barcodeAPI = axios.create({
    baseURL: API_BASE_URLS.barcode
});

const inspectionAPI = axios.create({
    baseURL: API_BASE_URLS.inspection
});

const aggregationAPI = axios.create({
    baseURL: API_BASE_URLS.aggregation
});

const epcisAPI = axios.create({
    baseURL: API_BASE_URLS.epcis
});

// Serialization Service APIs
export const serializationService = {
    generateSerial: (data) => serializationAPI.post('/generate', data),
    validateSerial: (serial) => serializationAPI.get(`/validate/${serial}`),
    getStats: () => serializationAPI.get('/stats'),
    getAllSerials: () => serializationAPI.get('/all')
};

// Barcode Service APIs
export const barcodeService = {
    generateBarcode: (data) => barcodeAPI.post('/print', data),
    getBarcodeBySerial: (serial) => barcodeAPI.get(`/by-gs1?gs1=${serial}`)
};

// Inspection Service APIs
export const inspectionService = {
    scanBarcode: (data) => inspectionAPI.post('/scan', data)
};

// Aggregation Service APIs
export const aggregationService = {
    createAggregation: (data) => aggregationAPI.post('/aggregate', data),
    getAggregation: (cartonId) => aggregationAPI.get(`/aggregation/${cartonId}`),
    getAllAggregations: (params) => aggregationAPI.get('/aggregations', { params })
};

// EPCIS Service APIs
export const epcisService = {
    getAllEPCs: () => epcisAPI.get('/epcs'),
    importEPCISFromFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return epcisAPI.post('/import-epcis-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

export default {
    serializationService,
    barcodeService,
    inspectionService,
    aggregationService,
    epcisService
};