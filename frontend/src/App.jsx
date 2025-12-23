import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
// import Footer from './components/Footer'; // Removed footer
import Dashboard from './pages/Dashboard';
import SerializationPage from './pages/SerializationPage';
import BarcodePage from './pages/BarcodePage';
import InspectionPage from './pages/InspectionPage';
import AggregationPage from './pages/AggregationPage';
import SerialNumbersPage from './pages/SerialNumbersPage';
import EPCISPage from './pages/EPCISPage';

function App() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (!isMobileMenuOpen) {
            document.body.classList.add('mobile-menu-open');
        } else {
            document.body.classList.remove('mobile-menu-open');
        }
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        document.body.classList.remove('mobile-menu-open');
    };

    // Clean up class when component unmounts
    React.useEffect(() => {
        return () => {
            document.body.classList.remove('mobile-menu-open');
        };
    }, []);

    return (
        <Router>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
                {/* Desktop Sidebar */}
                <div className="hidden md:block w-64 min-h-screen bg-gradient-to-b from-primary-600 to-primary-800 fixed top-0 left-0 h-full z-10 shadow-xl">
                    <Sidebar />
                </div>

                {/* Mobile Sidebar - Overlay */}
                <div className={`md:hidden w-full h-full fixed inset-0 bg-black bg-opacity-50 z-30 ${isMobileMenuOpen ? '' : 'hidden'}`} onClick={closeMobileMenu}>
                    <div className={`w-64 h-full bg-gradient-to-b from-primary-600 to-primary-800 transform transition-transform duration-300 ease-in-out z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end p-4 border-b border-primary-500">
                            <button onClick={closeMobileMenu} className="text-white hover:text-primary-200">
                                ✕
                            </button>
                        </div>
                        <Sidebar />
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 md:ml-64 p-4 md:p-8 relative z-0">
                    <div className="md:hidden mb-4">
                        <button onClick={toggleMobileMenu} className="text-gray-700 hover:text-primary-600 p-2 text-xl">
                            ☰ Menu
                        </button>
                    </div>
                    <div className="overflow-y-auto h-[calc(100vh-100px)]">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/serialization" element={<SerializationPage />} />
                            <Route path="/barcode" element={<BarcodePage />} />
                            <Route path="/inspection" element={<InspectionPage />} />
                            <Route path="/aggregation" element={<AggregationPage />} />
                            <Route path="/serial-numbers" element={<SerialNumbersPage />} />
                            <Route path="/epcis" element={<EPCISPage />} />
                        </Routes>
                    </div>
                </main>
                {/* <Footer /> */} {/* Removed footer */}
            </div>
        </Router>
    );
}

export default App;