#!/bin/bash

echo "🚀 Starting Parametric Insurance Flow with Queue Workers..."
echo "=========================================================="
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down queue workers..."
    kill $WORKER_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start the application in background to run queue workers
echo "🔄 Starting application with queue workers..."
cd /Users/leandrolourenco/Documents/FolderDev/hackathon/parametric_ecosphere/backend
npm run start:dev > app.log 2>&1 &
WORKER_PID=$!

# Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if application started successfully
if ! kill -0 $WORKER_PID 2>/dev/null; then
    echo "❌ Failed to start application"
    cat app.log
    exit 1
fi

echo "✅ Application started successfully (PID: $WORKER_PID)"
echo ""

# Run the flow command
echo "🎯 Running parametric insurance flow..."
npm run flow-real

echo ""
echo "⏳ Waiting for queue processing to complete..."
echo "   (This may take a few minutes for all jobs to be processed)"
sleep 30

echo ""
echo "📊 Checking database collections..."

# Check what's in the database
echo "Policies:"
node -e "
const mongoose = require('mongoose');
const Policy = require('./dist/src/modules/registry/entities/policy.entity.js').Policy;
mongoose.connect('mongodb://localhost:27017/smart_app').then(async () => {
  const count = await Policy.countDocuments();
  console.log('  - Policies:', count);
  process.exit(0);
}).catch(console.error);
"

echo "Payouts:"
node -e "
const mongoose = require('mongoose');
const Payout = require('./dist/src/modules/payouts/entities/payout.entity.js').Payout;
mongoose.connect('mongodb://localhost:27017/smart_app').then(async () => {
  const count = await Payout.countDocuments();
  console.log('  - Payouts:', count);
  process.exit(0);
}).catch(console.error);
"

echo "Pool Events:"
node -e "
const mongoose = require('mongoose');
const PoolEvent = require('./dist/src/modules/pool-events/entities/pool-event.entity.js').PoolEvent;
mongoose.connect('mongodb://localhost:27017/smart_app').then(async () => {
  const count = await PoolEvent.countDocuments();
  console.log('  - Pool Events:', count);
  process.exit(0);
}).catch(console.error);
"

echo "Triggers:"
node -e "
const mongoose = require('mongoose');
const Trigger = require('./dist/src/modules/triggers/entities/trigger.entity.js').Trigger;
mongoose.connect('mongodb://localhost:27017/smart_app').then(async () => {
  const count = await Trigger.countDocuments();
  console.log('  - Triggers:', count);
  process.exit(0);
}).catch(console.error);
"

echo ""
echo "🎉 Flow completed! Queue workers are still running."
echo "   Press Ctrl+C to stop the workers."
echo ""

# Keep the script running to maintain queue workers
wait $WORKER_PID
