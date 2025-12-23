import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 mt-8">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Battery Traceability System. All rights reserved.
                    </div>
                    <div className="mt-4 md:mt-0">
                        <p className="text-sm text-gray-500">
                            Version 1.0.0
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;