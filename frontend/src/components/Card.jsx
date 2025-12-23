import React from 'react';

const Card = ({ children, className = '', title, ...props }) => {
    return (
        <div className={`bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${className}`} {...props}>
            {title && (
                <div className="border-b border-gray-200 px-6 py-4 rounded-t-xl">
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                </div>
            )}
            <div className={title ? "p-6 rounded-b-xl" : "p-6 rounded-xl"}>
                {children}
            </div>
        </div>
    );
};

export default Card;