import React, { useState, useEffect, useRef } from 'react';
import { aggregationService } from '../utils/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const AggregationPage = () => {
    const hasLoaded = useRef(false);
    const [aggregationForm, setAggregationForm] = useState({
        cartonId: '',
        serials: ''
    });

    const [aggregationResult, setAggregationResult] = useState(null);
    const [aggregationsList, setAggregationsList] = useState([]);
    const [selectedAggregation, setSelectedAggregation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [listError, setListError] = useState(null);

    useEffect(() => {
        if (!hasLoaded.current) {
            console.log('Loading aggregations...');
            loadAggregations();
            hasLoaded.current = true;
        }
    }, []);

    const loadAggregations = async () => {
        try {
            const response = await aggregationService.getAllAggregations();
            setAggregationsList(response.data.aggregations || []);
        } catch (err) {
            setListError('Failed to load aggregations');
        }
    };

    const handleAggregationChange = (e) => {
        setAggregationForm({
            ...aggregationForm,
            [e.target.name]: e.target.value
        });
    };

    const handleAggregationSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setAggregationResult(null);

        try {
            // Convert serials string to array
            const serialsArray = aggregationForm.serials
                .split('\n')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const data = {
                cartonId: aggregationForm.cartonId,
                serials: serialsArray
            };

            const response = await aggregationService.createAggregation(data);
            setAggregationResult(response.data);
            loadAggregations(); // Refresh the list
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create aggregation');
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch and display aggregation details
    const showAggregationDetails = async (cartonId) => {
        setLoading(true);
        try {
            const response = await aggregationService.getAggregation(cartonId);
            setSelectedAggregation(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load aggregation details');
        } finally {
            setLoading(false);
        }
    };

    // Function to close the details view
    const closeDetails = () => {
        setSelectedAggregation(null);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Aggregation</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Create Aggregation Form */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Aggregation</h2>
                        <form onSubmit={handleAggregationSubmit} className="space-y-4">
                            <Input
                                label="Carton ID"
                                id="cartonId"
                                name="cartonId"
                                value={aggregationForm.cartonId}
                                onChange={handleAggregationChange}
                                required
                                placeholder="Enter carton/container ID"
                            />

                            <div>
                                <label htmlFor="serials" className="block text-sm font-medium text-gray-700 mb-1">
                                    Serial Numbers (one per line)
                                </label>
                                <textarea
                                    id="serials"
                                    name="serials"
                                    value={aggregationForm.serials}
                                    onChange={handleAggregationChange}
                                    required
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter serial numbers, one per line&#10;e.g.:&#10;12345678&#10;12345679&#10;12345680"
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    variant="primary"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size="sm" className="mr-2" />
                                            Creating...
                                        </>
                                    ) : 'Create Aggregation'}
                                </Button>
                            </div>
                        </form>

                        {error && (
                            <Alert variant="error" title="Error" className="mt-4">
                                {error}
                            </Alert>
                        )}

                        {aggregationResult && (
                            <Alert variant="success" title="Aggregation Created Successfully" className="mt-4">
                                <div className="space-y-1">
                                    <p><strong>Carton ID:</strong> {aggregationResult.cartonId}</p>
                                    <p><strong>Items Aggregated:</strong> {aggregationResult.aggregatedItems}</p>
                                </div>
                            </Alert>
                        )}
                    </div>

                    {/* Recent Aggregations List */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Aggregations</h2>
                        <p className="text-sm text-gray-600 mb-4">Recently created container aggregations</p>
                        {listError ? (
                            <Alert variant="error" title="Error">
                                {listError}
                            </Alert>
                        ) : aggregationsList.length > 0 ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {aggregationsList.map((aggregation, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => showAggregationDetails(aggregation.cartonId)}
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-medium">{aggregation.cartonId}</span>
                                            <span className="text-sm text-gray-500">{aggregation.itemCount} items</span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {new Date(aggregation.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No aggregations found</p>
                        )}
                    </div>
                </div>

                {/* Aggregation Details Modal/Section */}
                {selectedAggregation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Aggregation Details</h2>
                                    <button
                                        onClick={closeDetails}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Carton ID</p>
                                        <p className="font-medium">{selectedAggregation.cartonId}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Created</p>
                                        <p className="font-medium">{new Date(selectedAggregation.createdAt).toLocaleString()}</p>
                                    </div>

                                    <div>
                                        <p className="font-medium mb-2">Contained Products ({selectedAggregation.serials.length}):</p>
                                        <ul className="list-disc list-inside border border-gray-100 rounded p-2 max-h-60 overflow-y-auto">
                                            {selectedAggregation.serials.map((serial, index) => (
                                                <li key={index} className="text-sm py-1">{serial}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AggregationPage;