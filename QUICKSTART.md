# Synthetic Data Generator - Quick Start Guide

## ✅ Project Setup Complete!

Your React + Tailwind CSS frontend for the Synthetic Data Generation platform is ready to use.

## 🚀 Getting Started

1. **Make sure your backend is running** on `http://localhost:8000`

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

## 📋 Features Implemented

### 1. Dataset Selection
- Lists all available datasets from `GET /datasets`
- Dropdown selector for easy dataset selection
- Automatic error handling and retry functionality

### 2. Training Configuration
- Fetches available training methods from `GET /train/methods`
- Configure epochs (1-1000)
- Validates that a dataset is selected before training
- Sends training requests to `POST /train`

### 3. Real-Time Task Monitoring
- Fetches all tasks from `GET /train/tasks`
- Auto-refreshes every 3 seconds
- Shows task progress with visual progress bars
- Color-coded status indicators:
  - 🟢 Green - Completed
  - 🔵 Blue - Running
  - 🔴 Red - Failed
  - 🟡 Yellow - Pending
- Displays detailed task information:
  - Task ID
  - Status and progress percentage
  - Start and completion times
  - Error messages (if any)
  - Results (when completed)

## 🎨 UI Components

### Layout
- **Header**: Application title and description
- **Left Column**: Dataset selection and training configuration
- **Right Column**: Real-time task monitoring
- **Footer**: Branding

### Styling
- Modern, clean design with Tailwind CSS
- Responsive layout (works on mobile and desktop)
- Gradient background
- Card-based component design
- Professional color scheme

## 🔧 Configuration

### Environment Variables
Create a `.env` file (copy from `.env.example`):
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### Customization Options

**Change API URL**: Edit `src/services/api.js`
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

**Change Polling Interval**: Edit `src/components/TaskMonitor.jsx`
```javascript
const interval = setInterval(loadTasks, 3000); // milliseconds
```

## 📁 Project Structure

```
synthetic-wizard/
├── src/
│   ├── components/
│   │   ├── DatasetSelector.jsx    # Dataset selection
│   │   ├── TrainingForm.jsx        # Training configuration
│   │   └── TaskMonitor.jsx         # Task monitoring
│   ├── services/
│   │   └── api.js                  # API calls
│   ├── App.jsx                     # Main component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Tailwind imports
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## 🧪 Testing the Application

1. **Start your backend API** at `http://localhost:8000`
2. **Ensure these endpoints are working**:
   - `GET /datasets`
   - `GET /train/methods`
   - `POST /train`
   - `GET /train/tasks`
3. **Start the frontend**: `npm run dev`
4. **Test the flow**:
   - Select a dataset
   - Choose a training method
   - Set epochs
   - Click "Start Training"
   - Watch the task progress in real-time

## 🐛 Common Issues

### CORS Errors
If you see CORS errors, make sure your backend allows requests from `http://localhost:5173`

### API Connection Failed
- Verify backend is running on `http://localhost:8000`
- Check the browser console for detailed error messages

### No Datasets Showing
- Check that `GET /datasets` endpoint returns data
- Open browser DevTools → Network tab to inspect the response

## 📦 Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## 🎯 Next Steps (Optional Enhancements)

- Add user authentication
- Implement dataset upload functionality
- Add data visualization for synthetic data
- Export/download generated synthetic data
- Add dataset preview functionality
- Implement more advanced filtering for tasks
- Add notification system (toast messages)
- Add dark mode toggle
- Implement WebSocket for real-time updates instead of polling

## 💡 Tips

- The task monitor automatically refreshes every 3 seconds
- You can start multiple training tasks - they'll all appear in the monitor
- Progress bars show real-time completion percentage
- Completed tasks show their full results in JSON format

Enjoy using your Synthetic Data Generator! 🎉
