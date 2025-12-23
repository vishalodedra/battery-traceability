function formatDate(date) {
    return date.toISOString().slice(2, 10).replace(/-/g, '');
}

function generateGS1(gtin, serial, batch, mfg, exp) {
    // Generate minimal barcode with only serial number for maximum brevity
    return `(21)${serial}`;
}

function parseGS1(data) {
    console.log('Parsing barcode data:', data);
    // Very simple parsing for (21)SERIAL format
    if (data.startsWith('(21)')) {
        // Extract exactly the serial number part
        const serial = data.substring(4);
        const result = { '21': serial };
        console.log('Parsed barcode:', result);
        return result;
    }

    // Handle format without parentheses
    if (data.startsWith('21')) {
        const serial = data.substring(2);
        const result = { '21': serial };
        console.log('Parsed simplified format:', result);
        return result;
    }

    console.log('Could not parse barcode, returning empty object');
    return {};
}

module.exports = { generateGS1, parseGS1 };
