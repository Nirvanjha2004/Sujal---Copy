# Real Estate Portal Frontend

A modern React.js frontend for the Real Estate Portal built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on port 3000

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   VITE_APP_NAME=Real Estate Portal
   VITE_APP_URL=http://localhost:3001
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at: **http://localhost:3001**

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   └── landing/      # Landing page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and API client
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🛠 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Radix UI** - Accessible UI primitives
- **Lucide React** - Icons
- **Class Variance Authority** - Component variants

## 🔧 Configuration

### API Integration
The frontend connects to the backend API through:
- Vite proxy configuration for development
- Environment variables for API endpoints
- Custom API client in `src/lib/api.ts`

### Styling
- Tailwind CSS for utility-first styling
- CSS custom properties for theming
- Responsive design with mobile-first approach

### Components
- Reusable UI components in `src/components/ui/`
- Landing page components in `src/components/landing/`
- Custom hooks for data fetching in `src/hooks/`

## 🌐 Features

- **Property Search** - Advanced search with filters
- **Property Listings** - Grid and list views
- **Property Details** - Detailed property information
- **Responsive Design** - Mobile and desktop optimized
- **Type Safety** - Full TypeScript support
- **Modern UI** - Clean, professional design

## 🔗 API Integration

The frontend integrates with the backend API for:
- Property listings and search
- Property details
- User authentication (when implemented)
- Image uploads and management

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Tablet and desktop layouts
- Touch-friendly interactions
- Optimized images and performance

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new components
3. Add proper type definitions
4. Test components thoroughly
5. Follow the component structure patterns

## 📄 License

This project is part of the Real Estate Portal application.