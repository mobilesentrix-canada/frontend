# MS Store Management - Frontend

A modern React-based frontend application for store management built with Vite, TypeScript, and Tailwind CSS.

🌐 **Live Demo**: [https://ms-store-management.vercel.app/login](https://ms-store-management.vercel.app/login)

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **UI Components**: Radix UI primitives
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Theme**: next-themes for dark/light mode
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ms-store-management-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:

   ```env
   VITE_API_URL='http://localhost:3000/api'
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and configurations
├── types/           # TypeScript type definitions
└── styles/          # Global styles and Tailwind config
```

## Key Dependencies

### Core Framework

- **React 18** - Modern React with concurrent features
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components built on Radix UI
- **Radix UI** - Low-level UI primitives for accessibility
- **Lucide React** - Beautiful & consistent icon library

### Data & State Management

- **TanStack Query** - Powerful data synchronization for React
- **Axios** - Promise-based HTTP client
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation

### Additional Features

- **React Router DOM** - Declarative routing
- **Recharts** - Composable charting library
- **next-themes** - Theme management
- **date-fns** - Modern JavaScript date utility library

## Environment Variables

| Variable       | Description          | Default                     |
| -------------- | -------------------- | --------------------------- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` |

## Building for Production

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Preview the build**
   ```bash
   npm run preview
   ```

The build artifacts will be stored in the `dist/` directory.

## Deployment

This project is configured for deployment on Vercel. The live application is available at:
[https://ms-store-management.vercel.app/login](https://ms-store-management.vercel.app/login)

For other hosting platforms, build the project and serve the `dist/` directory.

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error boundaries
- Write accessible components

### Component Development

- Use shadcn/ui components when possible
- Follow the established component structure
- Implement proper TypeScript types
- Use Tailwind CSS for styling

### State Management

- Use TanStack Query for server state
- Use React hooks for local component state
- Implement proper error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## License

This project is private and proprietary.
