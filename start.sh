#!/bin/bash

echo "🚀 Starting services..."

# Start API Server on port 3001
echo "📡 Starting API Server on port 3001..."
(cd api-server && npm start) &
API_PID=$!

# Wait a bit for API server to start
sleep 2

# Start main application on port 5000
echo "🌐 Starting main application on port 5000..."
npm run dev &
MAIN_PID=$!

# Wait for both processes
wait $API_PID $MAIN_PID
