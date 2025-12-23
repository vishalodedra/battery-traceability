import React from 'react';

const Input = ({
    label,
    id,
    type = 'text',
    placeholder,
    value,
    onChange,
    required = false,
    error,
    helperText,
    className = '',
    ...props
}) => {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${error ? 'border-red-300' : 'border-gray-300'} ${className}`}
                {...props}
            />
            {helperText && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default Input;