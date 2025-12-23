import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const navLinks = [
        { name: 'Dashboard', path: '/', icon: '🏠' },
        { name: 'Serialization', path: '/serialization', icon: '🔢' },
        { name: 'Barcode Generation', path: '/barcode', icon: '🧩' },
        { name: 'Inspection', path: '/inspection', icon: '🔍' },
        { name: 'Aggregation', path: '/aggregation', icon: '📦' },
        { name: 'Serial Numbers', path: '/serial-numbers', icon: '🔢' },
        { name: 'EPCIS Data', path: '/epcis', icon: '📊' }
    ];

    // Function to determine if a link is active
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="bg-gradient-to-b from-primary-600 to-primary-800 text-white h-full flex flex-col shadow-xl">
            <div className="p-5 border-b border-primary-500">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-xl font-bold">🔋</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Battery</h1>
                        <p className="text-xs text-primary-200">Traceability System</p>
                    </div>
                </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                    {navLinks.map((link, index) => (
                        <li key={index}>
                            <Link
                                to={link.path}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive(link.path)
                                    ? 'bg-white bg-opacity-20 text-white shadow-inner'
                                    : 'text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                                    }`}
                            >
                                <div className="mr-3 w-5 h-5">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        {link.icon === '🏠' && (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        )}
                                        {link.icon === '🔢' && (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                        )}
                                        {link.icon === '🧩' && (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v4a7 7 0 014 6v3a4 4 0 00-4-4h-6a4 4 0 00-4 4v-3a7 7 0 014-6V4z" />
                                        )}
                                        {link.icon === '🔍' && (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        )}
                                        {link.icon === '📦' && (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        )}
                                        {link.icon === '📊' && (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        )}
                                    </svg>
                                </div>
                                <span>{link.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;