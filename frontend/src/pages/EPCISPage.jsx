import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { epcisService } from '../utils/api';

const EPCISPage = () => {
  const [epcs, setEpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchEPCs();
  }, []);

  const fetchEPCs = async () => {
    try {
      setLoading(true);
      const response = await epcisService.getAllEPCs();
      // Ensure we're working with an array
      const data = Array.isArray(response.data) ? response.data : [];
      setEpcs(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch EPCIS data. Please make sure the EPCIS service is running.');
      console.error('Error fetching EPCIS data:', err);
      // Ensure epcs is still an array even on error
      setEpcs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setError('Please select a valid JSON file');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await epcisService.importEPCISFromFile(file);
      setSuccess('EPCIS data imported successfully from file!');
      fetchEPCs(); // Refresh the data
      setTimeout(() => setSuccess(null), 3000);
      // Reset the file input
      event.target.value = '';
    } catch (err) {
      setError('Failed to import EPCIS data from file: ' + (err.response?.data?.error || err.message));
      console.error('Error importing EPCIS data from file:', err);
      // Ensure epcs is still an array even on error
      setEpcs([]);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic with safeguards
  const safeEpcs = Array.isArray(epcs) ? epcs : [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEPCs = safeEpcs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(safeEpcs.length / itemsPerPage);

  const getStatusBadge = (epc) => {
    // Simple logic to determine status based on EPC format
    if (epc.includes('sgtin')) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">SGTIN</span>;
    } else if (epc.includes('sscc')) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">SSCC</span>;
    } else {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const extractGTIN = (epc) => {
    // Extract GTIN from SGTIN format: urn:epc:id:sgtin:GTIN.EXT.SERIAL
    const match = epc.match(/urn:epc:id:sgtin:(\d+)\.\d+\.\d+/);
    return match ? match[1] : 'N/A';
  };

  const extractSerial = (epc) => {
    // Extract serial from SGTIN format: urn:epc:id:sgtin:GTIN.EXT.SERIAL
    const match = epc.match(/urn:epc:id:sgtin:\d+\.\d+\.(\d+)/);
    return match ? match[1] : 'N/A';
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">EPCIS Data</h1>
                  <p className="text-gray-600">Electronic Product Code Information Services data</p>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row">
              <div className="relative w-full md:w-auto">
                <input
                  type="file"
                  id="file-upload"
                  accept=".json,application/json"
                  onChange={handleFileImport}
                  disabled={loading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  variant="primary"
                  disabled={loading}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {loading ? 'Uploading...' : 'Upload JSON File'}
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="error" title="Error">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" title="Success">
              {success}
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="flex flex-col items-center p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total EPCs</h3>
                    <p className="text-4xl font-bold text-blue-600 mb-1">{safeEpcs.length}</p>
                    <p className="text-sm text-gray-500">Electronic Product Codes</p>
                  </div>
                </Card>

                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="flex flex-col items-center p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">SGTIN Items</h3>
                    <p className="text-4xl font-bold text-green-600 mb-1">{safeEpcs.filter(epc => epc.epc.includes('sgtin')).length}</p>
                    <p className="text-sm text-gray-500">Serialized Trade Items</p>
                  </div>
                </Card>

                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="flex flex-col items-center p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">SSCC Items</h3>
                    <p className="text-4xl font-bold text-purple-600 mb-1">{safeEpcs.filter(epc => epc.epc.includes('sscc')).length}</p>
                    <p className="text-sm text-gray-500">Shipping Containers</p>
                  </div>
                </Card>
              </div>

              {/* EPCIS Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6 max-w-full">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                        EPC
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                        Type
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                        GTIN
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                        Serial
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                        Lot Number
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                        Production Date
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                        Expiration Date
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                        Pack Size
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentEPCs.length > 0 ? (
                      currentEPCs.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 max-w-[120px]">
                            <div className="truncate" title={item.epc}>
                              {item.epc}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {getStatusBadge(item.epc)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {extractGTIN(item.epc)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {extractSerial(item.epc)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.lotNumber || 'N/A'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.productionDate || 'N/A'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.expirationDate || 'N/A'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.packsize || 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-3 py-4 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-gray-500 text-base mb-1">No EPCIS data found</p>
                            <p className="text-xs text-gray-400">Click "Upload JSON File" to load data</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center py-4">
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="rounded-l-md px-4 py-2 text-sm font-medium"
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                      const pageNum = startPage + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={currentPage === pageNum ? "primary" : "outline"}
                          className={`px-4 py-2 text-sm font-medium ${currentPage === pageNum ? "z-10" : ""}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
                        ...
                      </span>
                    )}
                    {totalPages > 5 && currentPage < totalPages - 1 && (
                      <Button
                        onClick={() => setCurrentPage(totalPages)}
                        variant="outline"
                        className="px-4 py-2 text-sm font-medium"
                      >
                        {totalPages}
                      </Button>
                    )}
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      className="rounded-r-md px-4 py-2 text-sm font-medium"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              )}

            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EPCISPage;