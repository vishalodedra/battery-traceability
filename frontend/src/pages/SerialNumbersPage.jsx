import React, { useState, useEffect } from 'react';
import { serializationService, barcodeService } from '../utils/api';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Modal from '../components/Modal';

const SerialNumbersPage = () => {
    const [serials, setSerials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [selectedSerial, setSelectedSerial] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [barcodeImage, setBarcodeImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        const fetchSerials = async () => {
            try {
                const response = await serializationService.getAllSerials();
                setSerials(response.data);
                setCurrentPage(1); // Reset to first page when new data is fetched
            } catch (err) {
                setError('Failed to fetch serial numbers. The endpoint may not be available yet.');
                console.error('Error fetching serials:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSerials();
    }, []);

    const getStatusBadge = (status) => {
        const statusClasses = {
            'GENERATED': 'bg-blue-100 text-blue-800',
            'PRINTED': 'bg-green-100 text-green-800',
            'SCANNED': 'bg-purple-100 text-purple-800'
        };

        const statusText = {
            'GENERATED': 'Generated',
            'PRINTED': 'Printed',
            'SCANNED': 'Scanned'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {statusText[status] || status}
            </span>
        );
    };

    const openDetailModal = async (serial) => {
        setSelectedSerial(serial);

        // If the serial has been printed or scanned, try to get the barcode image
        if (serial.status === 'PRINTED' || serial.status === 'SCANNED') {
            try {
                // Format the serial number as GS1 format: (21)SERIAL_NUMBER
                const gs1FormattedSerial = `(21)${serial.serial}`;
                const response = await barcodeService.getBarcodeBySerial(gs1FormattedSerial);
                setBarcodeImage(response.data.imageUrl);
            } catch (err) {
                console.error('Error fetching barcode:', err);
                setBarcodeImage(null);
            }
        } else {
            setBarcodeImage(null);
        }

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSerial(null);
        setBarcodeImage(null);
    };


    const filteredSerials = filter === 'ALL'
        ? serials
        : serials.filter(serial => serial.status === filter);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSerials = filteredSerials.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSerials.length / itemsPerPage);

    const statusCounts = {
        ALL: serials.length,
        GENERATED: serials.filter(s => s.status === 'GENERATED').length,
        PRINTED: serials.filter(s => s.status === 'PRINTED').length,
        SCANNED: serials.filter(s => s.status === 'SCANNED').length
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Serial Numbers</h1>

                {error && (
                    <Alert variant="error" title="Error">
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <>
                        {/* Status Filter */}
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Filter by Status</h2>
                            <div className="flex flex-wrap gap-2">
                                {['ALL', 'GENERATED', 'PRINTED', 'SCANNED'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            setFilter(status);
                                            setCurrentPage(1); // Reset to first page when filter changes
                                        }}
                                        className={`px-3 py-1 rounded-md text-sm font-medium ${filter === status
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                                        <span className="ml-2 bg-white bg-opacity-30 rounded-full px-2 py-0.5">
                                            {statusCounts[status]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>



                        {/* Serial Numbers Table */}
                        <div className="table-container overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                            Serial Number
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                                            GTIN
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                                            Batch
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                            Manufacturing Date
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                            Expiry Date
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                                            Status
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentSerials.length > 0 ? (
                                        currentSerials.map((serial) => (
                                            <tr key={serial._id} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 max-w-[100px] truncate" title={serial.serial}>
                                                    {serial.serial}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 max-w-[80px] truncate" title={serial.gtin}>
                                                    {serial.gtin}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 max-w-[80px] truncate" title={serial.batch}>
                                                    {serial.batch}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(serial.mfgDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(serial.expiryDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                    {getStatusBadge(serial.status)}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openDetailModal(serial)}
                                                    >
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-3 py-3 text-center text-sm text-gray-500">
                                                No serial numbers found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="border-t border-gray-200 bg-white px-4 py-2 sm:px-6 mt-2">


                                <div className="flex items-center justify-center">
                                    <div className="flex flex-1 justify-between sm:hidden">
                                        <Button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            variant="outline"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            variant="outline"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
                                        <div>
                                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                <Button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    variant="outline"
                                                    className="rounded-l-md"
                                                >
                                                    Previous
                                                </Button>
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <Button
                                                        key={i + 1}
                                                        onClick={() => setCurrentPage(i + 1)}
                                                        variant={currentPage === i + 1 ? "primary" : "outline"}
                                                        className={currentPage === i + 1 ? "z-10" : ""}
                                                    >
                                                        {i + 1}
                                                    </Button>
                                                ))}
                                                <Button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    variant="outline"
                                                    className="rounded-r-md"
                                                >
                                                    Next
                                                </Button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </>
                )}

                {/* Serial Detail Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title="Serial Number Details"
                >
                    {selectedSerial && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedSerial.serial}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <p className="mt-1 text-sm text-gray-900">{getStatusBadge(selectedSerial.status)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">GTIN</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedSerial.gtin}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Batch</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedSerial.batch}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Manufacturing Date</label>
                                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedSerial.mfgDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedSerial.expiryDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {(selectedSerial.status === 'PRINTED' || selectedSerial.status === 'SCANNED') && (
                                <div className="pt-4 border-t border-gray-200">
                                    <h3 className="text-md font-medium text-gray-900 mb-2">Barcode</h3>
                                    <div className="bg-gray-50 p-4 rounded-md flex justify-center">
                                        {barcodeImage ? (
                                            <img
                                                src={barcodeImage}
                                                alt="Barcode"
                                                className="max-w-full h-auto"
                                            />
                                        ) : (
                                            <div className="text-center py-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                                <p className="mt-2 text-sm text-gray-500">Loading barcode...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default SerialNumbersPage;