# Synthetic Data Generator - Frontend

A modern React-based frontend application for managing synthetic data generation tasks with a Material UI-inspired design.

## ✨ Features

### 🎯 **Model Training**
- 📊 Browse and select from available datasets with size information
- 🎯 Choose training methods (CTGAN, TVAE, Gaussian Copula)
- ⚙️ Configure epochs with an intuitive slider (1-1000)
- 📈 Real-time task monitoring with progress bars
- 🔄 Auto-refresh every 3 seconds

### 🚀 **Data Generation**
- 🎲 Generate synthetic cardiovascular data (10-10,000 samples)
- 📊 Interactive data table with first 100 rows preview
- 💾 Download generated data as CSV
- 📈 Visual statistics cards (samples, status, columns)
- 🎨 Beautiful gradient UI with smooth animations

### 🎨 **Modern UI/UX**
- 🌈 Material Design inspired interface
- 📱 Responsive layout (mobile & desktop)
- 🎭 Gradient backgrounds and smooth transitions
- 💫 Hover effects and elevation shadows
- 🎯 Intuitive navigation with sidebar
- ⚡ Fast and smooth animations

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Endpoints Used

The frontend connects to the following backend endpoints:

- `GET /datasets` - List available datasets
- `GET /train/methods` - Get available training methods
- `POST /train` - Start a training task
- `GET /train/tasks` - Get all training tasks with status
- `GET /train/status/{task_id}` - Get specific task status
- `POST /generate` - Generate synthetic data locally

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx            # Navigation sidebar
│   ├── TrainingView.jsx       # Training dashboard view
│   ├── GenerateView.jsx       # Data generation view
│   ├── DatasetSelector.jsx    # Dataset selection component
│   ├── TrainingForm.jsx       # Training configuration form
│   └── TaskMonitor.jsx        # Real-time task monitoring
├── services/
│   └── api.js                 # API service layer
├── App.jsx                    # Main application with routing
├── main.jsx                   # Application entry point
└── index.css                  # Tailwind CSS imports
```

## Navigation

The application features a sidebar with two main views:

### 📊 Model Training
- Select datasets
- Configure and start training
- Monitor training progress

### 🎲 Generate Data
- Generate synthetic samples
- View data in interactive table
- Download as CSV

## Features in Detail

### Sidebar Navigation
- Beautiful gradient background (indigo theme)
- Active state highlighting
- Smooth transitions
- System status indicator

### Dataset Selector
- Displays dataset name and size in KB
- Error handling with retry functionality
- Loading states with spinners

### Training Form
- Dynamic method selection with descriptions
- Visual epoch slider (1-1000)
- Gradient buttons with hover effects
- Form validation

### Task Monitor
- Auto-refreshes every 3 seconds
- Color-coded status badges
- Animated progress bars
- Detailed task information
- Expandable results section

### Data Generation
- Adjustable sample count (slider + input)
- Real-time generation
- Statistics cards (samples, status, columns)
- Sortable, scrollable data table
- CSV export functionality

## Styling

The application uses a custom design system inspired by Material UI:

- **Primary Colors**: Indigo/Blue gradients
- **Shadows**: Multiple elevation levels
- **Border Radius**: Rounded (lg, xl, 2xl)
- **Transitions**: Smooth 200ms animations
- **Typography**: System fonts with proper hierarchy

## Customization

### API Base URL

The application automatically uses a proxy in development. To change the backend URL for production, edit `.env`:

```bash
VITE_API_BASE_URL=http://your-backend-url:8000
```

### Polling Interval

To adjust the task monitoring refresh rate, edit `src/components/TaskMonitor.jsx`:

```javascript
const interval = setInterval(loadTasks, 3000); // Change 3000 to desired milliseconds
```

### Theme Colors

Colors can be customized by modifying the Tailwind classes throughout the components. The main color scheme uses:
- Primary: Indigo (indigo-500 to indigo-900)
- Secondary: Purple (purple-500 to purple-600)
- Accent: Blue (blue-500 to blue-600)

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Fetch API** - HTTP client for API calls

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
