# Battery Traceability System - Frontend

A React-based frontend for the Battery Traceability System with responsive UI using shadcn-inspired components.

## Features

- Product Serialization
- Barcode Generation
- Barcode Inspection
- Product Aggregation
- Responsive design
- Modern UI with Tailwind CSS

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── utils/          # Utility functions and API services
├── App.jsx         # Main App component
└── main.jsx        # Entry point
```

## API Integration

The frontend communicates with the backend microservices:

- Serialization Service: http://localhost:3001
- Barcode Service: http://localhost:3002
- Inspection Service: http://localhost:3003
- Aggregation Service: http://localhost:3004

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License