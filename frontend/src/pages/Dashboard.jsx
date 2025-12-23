import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { serializationService } from '../utils/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        generated: 0,
        printed: 0,
        scanned: 0,
        total: 0,
        pending: 0
    });
    const [loading, setLoading] = useState(true);

    const features = [
        {
            title: 'Serialization',
            description: 'Generate unique serial numbers for battery products',
            path: '/serialization',
            color: 'bg-blue-500'
        },
        {
            title: 'Barcode Generation',
            description: 'Create barcode images for serialized products',
            path: '/barcode',
            color: 'bg-green-500'
        },
        {
            title: 'Inspection',
            description: 'Scan and validate product barcodes',
            path: '/inspection',
            color: 'bg-yellow-500'
        },
        {
            title: 'Aggregation',
            description: 'Group individual products into containers',
            path: '/aggregation',
            color: 'bg-purple-500'
        }
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await serializationService.getStats();
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 mb-4">
                    <h1 className="text-4xl font-bold text-white mb-1">Battery Traceability</h1>
                </div>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">Manage battery product lifecycle from serialization to distribution with complete traceability</p>
            </div>

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
                        <p className="text-4xl font-bold text-blue-600 mb-1">{loading ? '-' : stats.generated}</p>
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
                        <p className="text-4xl font-bold text-green-600 mb-1">{loading ? '-' : stats.printed}</p>
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
                        <p className="text-4xl font-bold text-yellow-600 mb-1">{loading ? '-' : stats.scanned}</p>
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
                        <p className="text-4xl font-bold text-purple-600 mb-1">{loading ? '-' : stats.pending}</p>
                        <p className="text-sm text-gray-500">Awaiting Printing</p>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Core Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Link
                            key={index}
                            to={feature.path}
                            className="block group transform transition-all duration-300 hover:-translate-y-1"
                        >
                            <Card className="hover:shadow-xl transition-shadow duration-300 h-full border-t-4 border-primary-500">
                                <div className="flex flex-col items-center text-center p-6">
                                    <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <span className="text-white font-bold text-xl">{index + 1}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary-600 transition-colors duration-300">{feature.title}</h3>
                                    <p className="text-gray-600 mb-4">{feature.description}</p>
                                    <div className="flex items-center text-primary-600 font-medium group-hover:translate-x-1 transition-transform duration-300">
                                        <span>Explore</span>
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Removed System Overview section */}
        </div>
    );
};

export default Dashboard;