import React, { useState, useEffect } from 'react';
import { inspectionService, serializationService } from '../utils/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import Card from '../components/Card';

const InspectionPage = () => {
    const [formData, setFormData] = useState({
        barcode: ''
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        generated: 0,
        printed: 0,
        scanned: 0,
        total: 0,
        pending: 0
    });

    const fetchStats = async () => {
        try {
            const response = await serializationService.getStats();
            setStats(response.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await inspectionService.scanBarcode(formData);
            setResult(response.data);
            // Refresh stats after scanning a barcode
            await fetchStats();
        } catch (err) {
            setError(err.response?.data?.notes || err.response?.data?.error || 'Failed to scan barcode');
        } finally {
            setLoading(false);
        }
    };

    const getAlertVariant = (result) => {
        if (result === 'VERIFIED') return 'success';
        if (result === 'INVALID') return 'error';
        if (result === 'ERROR') return 'warning';
        return 'info';
    };

    return (
        <div className="space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                    <div className="flex flex-col items-center">
                        <h3 className="text-lg font-medium text-blue-800 mb-1">Generated</h3>
                        <p className="text-2xl font-bold text-blue-600">{stats.generated}</p>
                    </div>
                </Card>

                <Card className="bg-green-50 border-green-200">
                    <div className="flex flex-col items-center">
                        <h3 className="text-lg font-medium text-green-800 mb-1">Printed</h3>
                        <p className="text-2xl font-bold text-green-600">{stats.printed}</p>
                    </div>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                    <div className="flex flex-col items-center">
                        <h3 className="text-lg font-medium text-yellow-800 mb-1">Scanned</h3>
                        <p className="text-2xl font-bold text-yellow-600">{stats.scanned}</p>
                    </div>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                    <div className="flex flex-col items-center">
                        <h3 className="text-lg font-medium text-purple-800 mb-1">Pending</h3>
                        <p className="text-2xl font-bold text-purple-600">{stats.pending}</p>
                    </div>
                </Card>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Barcode Inspection</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Barcode Data"
                        id="barcode"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleChange}
                        required
                        placeholder="Enter barcode data (e.g., (21)12345678)"
                        helperText="Enter the barcode data to validate the product"
                    />

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={loading}
                            variant="primary"
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Scanning...
                                </>
                            ) : 'Scan Barcode'}
                        </Button>
                    </div>
                </form>
            </div>

            {(error || result) && (
                <Alert
                    variant={error ? 'error' : getAlertVariant(result?.result)}
                    title={error ? 'Error' : `Scan Result: ${result?.result}`}
                >
                    {error ? (
                        <p>{error}</p>
                    ) : result ? (
                        <div className="space-y-1">
                            <p><strong>Serial:</strong> {result.serial}</p>
                            <p><strong>Batch:</strong> {result.batch}</p>
                            <p><strong>Expiry:</strong> {result.expiry}</p>
                            <p><strong>Notes:</strong> {result.notes}</p>
                        </div>
                    ) : null}
                </Alert>
            )}
        </div>
    );
};

export default InspectionPage;