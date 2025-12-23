import { barcodeService, serializationService } from '../utils/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import Card from '../components/Card';
import { useEffect, useState } from 'react';

const BarcodePage = () => {
    const [formData, setFormData] = useState({
        gs1: ''
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

        // Validate that we have input
        if (!formData.gs1.trim()) {
            setError('Please enter a GS1 code');
            setResult(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await barcodeService.generateBarcode({ gs1: formData.gs1.trim() });
            setResult(response.data);
            // Refresh stats after printing a barcode
            await fetchStats();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate barcode');
            setResult(null);
        } finally {
            setLoading(false);
        }
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
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Barcode Generation</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="GS1 Code"
                        id="gs1"
                        name="gs1"
                        value={formData.gs1}
                        onChange={handleChange}
                        placeholder="Enter GS1 code (e.g., (21)26544079)"
                        helperText="Enter a valid GS1 code from the database. Example: (21)26544079"
                    />

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={loading || !formData.gs1.trim()}
                            variant="primary"
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Generating...
                                </>
                            ) : 'Generate Barcode'}
                        </Button>
                    </div>
                </form>
            </div>

            {error && (
                <Alert variant="error" title="Error">
                    {error}
                </Alert>
            )}

            {result && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Generated Barcode</h2>
                    <div className="flex flex-col items-center">
                        <img
                            src={result.imageUrl}
                            alt="Generated barcode"
                            className="mb-4 border border-gray-200 rounded-md"
                        />
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Status: <span className="font-medium text-green-600">{result.status}</span></p>
                            <a
                                href={result.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Download Barcode
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarcodePage;