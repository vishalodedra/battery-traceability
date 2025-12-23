import React, { useState, useEffect } from 'react';
import { serializationService } from '../utils/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import Card from '../components/Card';

const SerializationPage = () => {
    const [formData, setFormData] = useState({
        gtin: '',
        batch: '',
        mfgDate: '',
        expiryDate: ''
    });

    // Validation errors
    const [validationErrors, setValidationErrors] = useState({});

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



    const fetchAllData = async () => {
        await fetchStats();
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.gtin.trim()) {
            errors.gtin = 'GTIN is required';
        } else if (formData.gtin.length < 14 || formData.gtin.length > 14 || isNaN(formData.gtin)) {
            errors.gtin = 'GTIN must be 14 digits';
        }

        if (!formData.batch.trim()) {
            errors.batch = 'Batch number is required';
        }

        if (!formData.mfgDate) {
            errors.mfgDate = 'Manufacturing date is required';
        }

        if (!formData.expiryDate) {
            errors.expiryDate = 'Expiry date is required';
        }

        if (formData.mfgDate && formData.expiryDate && formData.mfgDate > formData.expiryDate) {
            errors.mfgDate = 'Manufacturing date cannot be after expiry date';
            errors.expiryDate = 'Expiry date cannot be before manufacturing date';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setError('Please fix the validation errors');
            return;
        }

        setValidationErrors({});
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await serializationService.generateSerial(formData);
            setResult(response.data);
            // Clear form after successful submission
            setFormData({
                gtin: '',
                batch: '',
                mfgDate: '',
                expiryDate: ''
            });
            // Refresh stats after generating a new serial
            await fetchStats();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate serial number');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="flex flex-col items-center p-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Generated</h3>
                        <p className="text-4xl font-bold text-blue-600 mb-1">{stats.generated}</p>
                        <p className="text-sm text-gray-500">Total Serial Numbers</p>
                    </div>
                </Card>

                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="flex flex-col items-center p-6">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Printed</h3>
                        <p className="text-4xl font-bold text-green-600 mb-1">{stats.printed}</p>
                        <p className="text-sm text-gray-500">Barcodes Printed</p>
                    </div>
                </Card>

                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="flex flex-col items-center p-6">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Scanned</h3>
                        <p className="text-4xl font-bold text-yellow-600 mb-1">{stats.scanned}</p>
                        <p className="text-sm text-gray-500">Products Scanned</p>
                    </div>
                </Card>

                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="flex flex-col items-center p-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending</h3>
                        <p className="text-4xl font-bold text-purple-600 mb-1">{stats.pending}</p>
                        <p className="text-sm text-gray-500">Awaiting Printing</p>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Product Serialization</h1>
                            <p className="text-gray-600">Generate unique serial numbers for your battery products</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="GTIN (Global Trade Item Number)"
                                id="gtin"
                                name="gtin"
                                value={formData.gtin}
                                onChange={handleChange}
                                required
                                placeholder="Enter GTIN"
                                error={validationErrors.gtin}
                            />

                            <Input
                                label="Batch Number"
                                id="batch"
                                name="batch"
                                value={formData.batch}
                                onChange={handleChange}
                                required
                                placeholder="Enter batch number"
                                error={validationErrors.batch}
                            />

                            <Input
                                label="Manufacturing Date"
                                id="mfgDate"
                                name="mfgDate"
                                type="date"
                                value={formData.mfgDate}
                                onChange={handleChange}
                                required
                                error={validationErrors.mfgDate}
                            />

                            <Input
                                label="Expiry Date"
                                id="expiryDate"
                                name="expiryDate"
                                type="date"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                required
                                error={validationErrors.expiryDate}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                variant="primary"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Spinner size="sm" className="mr-2" />
                                        Generating...
                                    </>
                                ) : 'Generate Serial Number'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>



            {error && (
                <Alert variant="error" title="Error">
                    {error}
                </Alert>
            )}

            {result && (
                <Alert variant="success" title="Serial Generated Successfully">
                    <div className="space-y-1">
                        <p><strong>Serial Number:</strong> {result.serial}</p>
                        <p><strong>GS1 Code:</strong> {result.gs1}</p>
                    </div>
                </Alert>
            )}
        </div>
    );
};

export default SerializationPage;